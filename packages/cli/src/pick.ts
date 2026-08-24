/**
 * Asking a person to choose.
 *
 * A thin shell over the pure lists in core. Nothing here decides what may be picked; it
 * decides how the picking looks.
 *
 * **Nothing reading input is a refusal, never a wait.** A prompt in a pipeline blocks until
 * the job is killed and the output says nothing about why, so an agent or a CI step gets told
 * to pass its arguments instead.
 *
 * `chooseFrom` is the one implementation of *ask, or refuse with the list*, and
 * `decisions/a-command-that-needs-a-choice-offers-it` is why every command that resolves a value
 * from a knowable set reaches for it rather than writing its own. A second copy of this is two
 * places for the refusal to drift, which is the failure that produced the rule.
 */

import { MoveChoice } from '@mollyguard/core';
import { dim, fail, warn } from './ui';

/**
 * The prompt package is ESM and this build is CommonJS, so it is imported where it is used.
 *
 * That turns out to be the right shape anyway: a run that never asks anything never loads it,
 * which is every run in a pipeline.
 */
async function select<T>(config: unknown): Promise<T> {
  const prompts = await import('@inquirer/prompts');
  return prompts.select(config as never) as Promise<T>;
}

export function interactive(): boolean {
  return process.stdin.isTTY === true && process.stdout.isTTY === true;
}

/** Thrown by the prompt on Ctrl+C. Abandoning is not a failure of the tool. */
export function abandoned(cause: unknown): boolean {
  return cause instanceof Error && cause.name === 'ExitPromptError';
}

/**
 * Anything a person can be offered: the slug they could have typed, and enough to recognise it.
 *
 * `detail` is the middle column — a change's state, and nothing else so far. Optional because
 * most sets have nothing to put there, and rendering an empty column is worse than not having
 * one.
 */
export interface Choice {
  readonly slug: string;
  readonly title: string;
  readonly detail?: string | undefined;
}

/**
 * What to ask, and what to say when asking is not possible.
 *
 * Every field is here because leaving it to the caller is how the four bounds in
 * `decisions/a-command-that-needs-a-choice-offers-it` got applied inconsistently in the first
 * place.
 */
export interface Offer {
  /** The question, shown to a person. */
  readonly message: string;
  /** The usage line a refusal leads with when nobody is reading input. */
  readonly usage: string;
  /** What to say when there is nothing to choose from. Never an empty menu. */
  readonly empty: string;
  /**
   * The label for declining, where declining is a real answer.
   *
   * Present means the value is optional, which has a second consequence: with nobody reading
   * input and nothing given, this returns `undefined` rather than refusing. A scripted caller
   * that never passed the flag is not answering wrongly — it is not being asked.
   */
  readonly decline?: string | undefined;
  /**
   * What was wrong with the value that *was* given.
   *
   * Set only on a second attempt, and it overrides the optional path above: a flag typed
   * wrongly is refused whether or not it could have been omitted, because the caller has said
   * something and it did not resolve.
   */
  readonly problem?: string | undefined;
}

/** The list, in the refusal, so a pipeline is told what it could have passed. */
function listing(items: readonly Choice[]): string {
  return items.map((item) => item.slug).join(', ');
}

/**
 * Ask, or refuse with the list.
 *
 * The whole of `decisions/a-command-that-needs-a-choice-offers-it`, in one place. Returns the
 * chosen slug, or `undefined` where declining was offered and taken.
 */
export async function chooseFrom(
  items: readonly Choice[],
  offer: Offer,
): Promise<string | undefined> {
  // Never an empty menu: a list of nothing is a question with no answer, so the refusal names
  // the command that writes the first one instead.
  if (items.length === 0) fail(offer.problem ?? offer.usage, offer.empty);

  if (!interactive()) {
    // A value was given and did not resolve. Refused whether or not the flag was optional —
    // the caller said something, and quietly ignoring it is how a misspelling becomes a
    // silent no-op.
    if (offer.problem !== undefined) {
      fail(offer.problem, `one of: ${listing(items)}`);
    }
    // Nothing given, and declining is a legitimate answer: not being asked is not the same as
    // answering wrongly, so this is the path every existing scripted caller keeps.
    if (offer.decline !== undefined) return undefined;
    fail(
      offer.usage,
      `nothing is reading input, so there is nobody to ask. One of: ${listing(items)}`,
    );
  }

  if (offer.problem !== undefined) warn(dim(offer.problem));

  const width = Math.max(...items.map((item) => item.slug.length));
  const detailed = items.some((item) => item.detail !== undefined);
  const width2 = detailed
    ? Math.max(...items.map((item) => (item.detail ?? '').length))
    : 0;

  // `undefined` is not a usable prompt value, so declining is a sentinel that no slug can
  // collide with — a slug is lowercase ASCII and this is not.
  const DECLINE = '\u0000decline';

  const choices = items.map((item) => ({
    // The slug leads, because it is what the flag takes: somebody who picks once learns the
    // string they could have typed.
    name: detailed
      ? `${item.slug.padEnd(width)}  ${dim((item.detail ?? '').padEnd(width2))}  ${item.title}`
      : `${item.slug.padEnd(width)}  ${dim(item.title)}`,
    value: item.slug,
  }));

  if (offer.decline !== undefined) {
    choices.push({ name: dim(offer.decline), value: DECLINE });
  }

  try {
    const chosen = await select<string>({ message: offer.message, choices });
    return chosen === DECLINE ? undefined : chosen;
  } catch (cause) {
    // Abandoning leaves nothing changed, and `0` is the code that says the command did what it
    // was asked. Nothing was written, so this is a refusal — `1` — not a success.
    if (abandoned(cause)) process.exit(1);
    throw cause;
  }
}

/**
 * The change a command is about, picked when it was not named.
 *
 * Shared rather than written per command: `move` and `publish` both take one change as their
 * first argument, and two copies of "ask, or refuse with the list" is two places for the refusal
 * to drift. The usage line differs per command, so it is passed in.
 *
 * Written in terms of `chooseFrom` rather than beside it. The output is unchanged — the state
 * rides in `detail`, which is the column this call is the reason for.
 */
export async function chooseChange(
  choices: readonly MoveChoice[],
  usage: string,
): Promise<MoveChoice> {
  const slug = await chooseFrom(
    choices.map((choice) => ({
      slug: choice.slug,
      title: choice.title,
      detail: choice.state,
    })),
    {
      message: 'Which change?',
      usage,
      empty: 'there are none — write one first: `molly change new "<title>"`',
    },
  );
  return choices.find((choice) => choice.slug === slug) as MoveChoice;
}
