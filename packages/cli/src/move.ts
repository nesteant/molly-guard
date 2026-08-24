/**
 * `molly move [<change>] [<state>]`
 *
 * Records a state change, and adjudicates nothing. **Any state may follow any other**: the
 * sequence in core is an order, not a set of permitted edges, so this command's job is to write
 * down what happened rather than to decide whether it should have. What a move *requires* — a
 * design present, a task claimed, evidence that held, or simply that states are not skipped —
 * is policy, and policy belongs to a slice or to whatever orchestrates the work.
 *
 * Until that seam exists, nothing refuses a move on the grounds of order. That is deliberate
 * and it is stated here so it is not mistaken for an omission.

 *
 * **The terminal state is the one exception, and it is not about order.** Reaching it is a
 * write into the knowledge base, performed by `molly publish`. Recording it here would claim a
 * publication that never happened, so it is refused — a command may decline to assert something
 * it did not do without having any opinion about what ought to happen next.
 *
 * Either argument may be left out, and what is missing is picked from a list. That is not
 * only convenience: a change's name and its title need not resemble each other, so a name is
 * not derivable from anything a listing shows, and before the picker existed the only place a
 * name was ever printed was inside a refusal — you had to run the command wrong to learn how
 * to run it right.
 *
 * Two things are written, and which is which matters. The **ledger** gets a line: that is the
 * record, append-only, and what every fold reads. The change document gets its `state:` field
 * updated: that is a **projection**, kept because a corpus is reviewed as files in a pull
 * request, and a state only the ledger knows is a state the reviewer cannot see.
 *
 * A projection is not a second source of truth, because it can be checked against its source —
 * and it is, before every move. A `state:` that disagrees with the fold is refused rather than
 * moved from, since the two would otherwise diverge further at every step.
 */

import {
  CHANGES,
  MoveChoice,
  between,
  STATES,
  StateChoice,
  TERMINAL,
  directionOf,
  isState,
  nodesIn,
  qualify,
  selectableChanges,
  selectableStates,
  stateOf,
  unqualify,
} from '@mollyguard/core';
import {
  Corpus,
  appendEvent,
  readArchivedChanges,
  readChanges,
  readHistory,
  writeDeclaredState,
} from '@mollyguard/store';
import { identity } from './identity';
import { chooseChange, chooseFrom } from './pick';
import { amber, dim, fail, green, info, teal, warn } from './ui';

export interface MoveOptions {
  readonly change: string | undefined;
  readonly to: string | undefined;
  /** ISO-8601. Read here, because core is handed its timestamps and never the clock. */
  readonly at: string;
}

export async function moveCommand(corpus: Corpus, options: MoveOptions): Promise<number> {
  const { root } = corpus;

  const scanned = await readChanges(root);
  for (const line of scanned.unreadable) warn(dim(line));

  if (scanned.bundles.length === 0) {
    fail('there are no changes to move', 'write one first: `molly change new "<title>"`');
  }

  const history = await readHistory(root);
  for (const line of history.unreadable) warn(dim(line));

  // Said before acting, because `move` is where a wrong state does damage. A node the ledger
  // remembers and no bundle answers to means a change was renamed or removed outside the tool —
  // and the fold for whatever replaced it starts from nothing, answering `draft` with confidence
  // it has not earned. Reported and never refused: the corpus is not broken, its record and its
  // directories disagree, and the person about to move something should know that.
  //
  // Only in-flight bundles are scanned here, so a published change would read as an orphan. Its
  // events stay under `changes/<name>` while its bundle sits in `history/`, which is why this
  // asks the archive too.
  const archivedHere = await readArchivedChanges(root);
  const known = new Set([
    ...scanned.bundles.map((bundle) => bundle.node),
    ...archivedHere.bundles.map((bundle) => qualify(CHANGES, bundle.slug)),
  ]);
  for (const node of nodesIn(history.events)) {
    if (known.has(node)) continue;
    warn(dim(`the ledger has events for ${node}, which has no bundle`));
  }

  const choices: readonly MoveChoice[] = selectableChanges(
    scanned.bundles.map((bundle) => ({
      node: bundle.node,
      slug: bundle.slug,
      title: bundle.record.title,
      state: stateOf(history.events, bundle.node),
    })),
  );

  const named =
    options.change === undefined
      ? await chooseChange(choices, 'molly move <change> <state>')
      : resolve(options.change, choices);
  const from = named.state;

  // The ledger is the record; the document's `state:` is a projection of it. A projection that
  // disagrees with its source is the one thing that must never be moved from — the fold and
  // the file would then diverge further with every step, and the next reader has two answers.
  const declared = declaredOf(scanned.bundles, named.node);
  if (declared !== undefined && declared !== from) {
    fail(
      `${named.slug} says it is ${declared}, and the ledger says ${from}`,
      'The ledger is the record. Set `state: ' +
        from +
        '` in change.md to match it, or work out which transition was lost before moving on.',
    );
  }

  const offered = selectableStates(from);
  const to = options.to === undefined ? await chooseState(from, offered, named.slug) : options.to;

  if (!isState(to)) fail(`"${to}" is not a state`, `one of: ${STATES.join(', ')}`);

  // The one state a move may not record, and it is not a rule about the order. Reaching it is a
  // *write*: the documents the change carries go into the knowledge base and the bundle is
  // archived. Recording it here would append a line claiming a publication that never happened,
  // leaving the ledger saying the base holds something it does not — and every later reader
  // believing the ledger, which is the whole point of having one.
  if (to === TERMINAL) {
    fail(
      `${TERMINAL} is reached by publishing, not by recording`,
      `run \`molly publish ${named.slug}\` — it files the change's documents into the knowledge base, archives the bundle, and records this state as part of doing so`,
    );
  }

  if (from === to) {
    // Not a refusal. A pipeline step that re-runs must not fail a build for having already
    // happened, and a line for a move that did not move would inflate the audit trail.
    info(`${dim('=')} ${teal(named.node)} is already ${to}`);
    return 0;
  }

  // No edge is refused. The sequence says which way this went; whether it should have been
  // allowed is a question for a slice or an orchestrator, and neither exists yet.
  //
  // **What is not refused is still said.** A one-edge move and a six-edge move differed in the
  // output by a single word, so `molly move 0003 deployed` typed where `review` was meant read
  // exactly like a deliberate jump — at the one moment it was still free to correct. The
  // distance is arithmetic over a sequence this tool owns, and what the tool knows and does not
  // show is the same failure as what it overwrites and does not say.
  const direction = directionOf(from, to);
  const skipped = between(from, to);
  const by = identity();
  await appendEvent(root, { node: named.node, at: options.at, kind: 'transition', from, to, by });

  // Recorded first, projected second. If the write fails the transition still happened, and
  // saying so is better than pretending it did not — the drift check above is what catches it.
  const problem = await writeDeclaredState(root, named.slug, to);

  info(`${green('→')} ${teal(named.node)} ${from} → ${to} ${dim(`(${direction}, ${by})`)}`);
  // A second line rather than a longer one, and only when there is something to say. Six state
  // names inside the parenthetical would push the author's name off the end of a terminal, and
  // the common case has to stay exactly as short as it was.
  if (skipped.length > 0) info(`  ${dim(`skipped ${skipped.join(', ')}`)}`);
  if (problem !== undefined) {
    warn(`${amber('!')} ${dim(`recorded, but the document still says ${from}: ${problem}`)}`);
    return 1;
  }
  return 0;
}

function declaredOf(
  bundles: readonly { readonly node: string; readonly declared: string | undefined }[],
  node: string,
): string | undefined {
  return bundles.find((bundle) => bundle.node === node)?.declared;
}

/**
 * Finds the change a name refers to.
 *
 * Bare or qualified: `a-change` and `changes/a-change` name the same bundle, because the path
 * is the id and people type the short half of it.
 */
function resolve(given: string, choices: readonly MoveChoice[]): MoveChoice {
  const slug = unqualify(CHANGES, given);
  const found = choices.find((choice) => choice.slug === slug);
  if (found) return found;

  fail(
    `no change named "${slug}"`,
    `run \`molly move\` with no arguments to pick from a list, or one of: ${choices
      .map((choice) => choice.slug)
      .join(', ')}`,
  );
}

async function chooseState(
  from: string,
  offered: readonly StateChoice[],
  slug: string,
): Promise<string> {
  if (offered.length === 0) {
    // Only reachable once a slice has filtered everything away. Distinguished from the empty
    // sets `chooseFrom` handles: those mean nothing has been written yet, this means something
    // was written and then narrowed away, and the remedy is not the same.
    fail(`nothing is offered from ${from} for ${slug}`, 'an installed slice has narrowed the list to nothing');
  }
  // Through the shared offer, per `decisions/a-command-that-needs-a-choice-offers-it`: the set
  // comes from the lifecycle rather than from a scan, and that changes where the list is built,
  // not how it is put to somebody. `direction` is the whole description a state needs — the move
  // that undoes work is worth naming at the moment of choosing.
  const chosen = await chooseFrom(
    offered.map((choice) => ({
      slug: choice.to,
      title: choice.direction === 'advances' ? 'advances' : 'goes back',
    })),
    {
      message: `Move it from ${from} to?`,
      usage: `molly move ${slug} <state>`,
      empty: 'an installed slice has narrowed the list to nothing',
    },
  );
  return chosen as string;
}
