/**
 * Asking a person to choose.
 *
 * A thin shell over the pure lists in core. Nothing here decides what may be picked; it
 * decides how the picking looks.
 *
 * **Nothing reading input is a refusal, never a wait.** A prompt in a pipeline blocks until
 * the job is killed and the output says nothing about why, so an agent or a CI step gets told
 * to pass its arguments instead.
 */

import { MoveChoice, StateChoice } from '@mollyguard/core';
import { dim } from './ui';

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

export async function pickChange(choices: readonly MoveChoice[]): Promise<string> {
  const width = Math.max(...choices.map((choice) => choice.slug.length));
  return select<string>({
    message: 'Which change?',
    choices: choices.map((choice) => ({
      // The name is what `molly move <change>` takes, so it leads: someone who picks once
      // learns the string they could have typed.
      name: `${choice.slug.padEnd(width)}  ${dim(choice.state.padEnd(11))}  ${choice.title}`,
      value: choice.slug,
    })),
  });
}

export async function pickState(from: string, choices: readonly StateChoice[]): Promise<string> {
  return select<string>({
    message: `Move it from ${from} to?`,
    choices: choices.map((choice) => ({
      name: choice.to,
      value: choice.to,
      // `returns` is the move that undoes work. Saying so at the moment of choosing is worth
      // more than saying so in a refusal that is never going to come.
      description: choice.direction === 'advances' ? 'advances' : 'goes back',
    })),
  });
}
