/**
 * The lifecycle of a change.
 *
 * **The shape is a sequence, not a set of permitted edges.** Any state may follow any other,
 * and a move records what it is told. Whether a particular move is *allowed* — whether a design
 * is present, whether the work was claimed, whether skipping three states is acceptable here —
 * is policy, and policy belongs to a slice or to whatever orchestrates the work. The engine
 * owns the vocabulary and the record; it does not own the process.
 *
 * That leaves the sequence doing real work without refusing anything. It says which state
 * follows which, so a picker offers the obvious one first. And it says whether a move went
 * forwards or back, so the ledger records a direction rather than making every reader compare
 * two names against an order they have to remember.
 *
 * **A change's state is not stored in the change.** It is folded from an append-only log, so
 * advancing a change does not touch its text — which is what lets an approval pinned to a
 * content hash still mean something two states later. The `state:` a document carries is a
 * projection of this log, checked against it, never a second answer to the same question.
 *
 * Pure, like the rest of core: a move needs a timestamp and an author, and both are passed in.
 * A function that read the clock could not be re-run to reproduce a result.
 */

/**
 * The eight, in the order a change walks them when nothing goes wrong.
 *
 * `deployed` sits between `verified` and `published` because the knowledge base says what the
 * product *does*. A change that passed its tests is one that will probably work; a change
 * that is deployed is one the product actually does, and publishing any earlier would put an
 * intention into accumulated truth.
 */
export const STATES = [
  'draft',
  'review',
  'approved',
  'in_progress',
  'implemented',
  'verified',
  'deployed',
  'published',
] as const;

export type State = (typeof STATES)[number];

export function isState(value: unknown): value is State {
  return typeof value === 'string' && (STATES as readonly string[]).includes(value);
}

/** Where a change is before anything has happened to it. */
export const INITIAL: State = 'draft';

/**
 * The end of the sequence.
 *
 * A label, not a lock, and nothing here refuses anything: this file describes an order and
 * enforces none of it.
 *
 * What sits outside it is worth knowing while reading this. Reaching the terminal state is a
 * *write* — a change's documents go into the knowledge base — so only the command performing
 * that write can record it truthfully, and `molly move` refuses to. Leaving it is the open
 * question, and belongs to the same command for the same reason: it is the one that would have
 * to answer for the write being undone.
 */
export const TERMINAL: State = STATES[STATES.length - 1] as State;

/** Where a state sits in the sequence. */
export function positionOf(state: State): number {
  return STATES.indexOf(state);
}

export type Direction = 'advances' | 'returns' | 'stays';

/**
 * Which way a move went.
 *
 * Derived from the sequence rather than declared per edge, so it stays true for moves nobody
 * anticipated — including one that skips several states at once, which a table of permitted
 * edges could not have described without enumerating it.
 */
export function directionOf(from: State, to: State): Direction {
  const difference = positionOf(to) - positionOf(from);
  return difference === 0 ? 'stays' : difference > 0 ? 'advances' : 'returns';
}

/**
 * The states a move passes over, in the direction it travels.
 *
 * Empty for an adjacent move and for one that stays, which is what makes it safe to render
 * unconditionally: the common case contributes nothing and the line is unchanged.
 *
 * **Passed over, never performed.** These are the states a change did not stop in, and naming
 * them is a rendering rather than a record — the ledger gets the one transition it was told
 * about. A tool that wrote a line per state here would be manufacturing an audit trail, which
 * is the failure the ledger exists to prevent rather than a convenience it is missing.
 *
 * Reversed for a move that goes back, so the order reads the way the move went rather than the
 * way the sequence is written. Somebody reading `deployed → review` is walking backwards, and a
 * list in forward order would describe a journey nobody took.
 */
export function between(from: State, to: State): readonly State[] {
  const here = positionOf(from);
  const there = positionOf(to);
  const span = STATES.slice(Math.min(here, there) + 1, Math.max(here, there));
  return here < there ? span : [...span].reverse();
}

/** One recorded event. Written to the ledger by the store, folded back by `stateOf`. */
export interface LifecycleEvent {
  /** Qualified id of what this happened to: `changes/<name>`. */
  readonly node: string;
  /** ISO-8601, supplied by the caller — core does not read the clock. */
  readonly at: string;
  readonly kind: 'created' | 'transition';
  /** Absent on `created`: nothing preceded it. */
  readonly from?: State;
  readonly to: State;
  /** Who did it, supplied by the caller — core does not know who is running. */
  readonly by: string;
}

/**
 * The current state of one node, folded from the log.
 *
 * The last event wins by position rather than by `at`: the file is the order things happened,
 * and folding by timestamp would let one machine with a wrong clock reorder history.
 *
 * Events for other nodes are skipped rather than refused — one ledger holds every change, and
 * a fold that objected to its neighbours could never read it.
 */
export function stateOf(events: readonly LifecycleEvent[], node: string): State {
  let state = INITIAL;
  for (const event of events) {
    if (event.node === node) state = event.to;
  }
  return state;
}

/**
 * Whether the ledger knows about this node at all.
 *
 * Distinct from "is in draft". A change created through the tool has a `created` line, so a
 * bundle with nothing at all is one that arrived some other way — written by hand, or a folder
 * renamed with `mv`, which orphans everything recorded under the old name. `stateOf` answers
 * `draft` in both cases and cannot tell them apart.
 */
export function isRecorded(events: readonly LifecycleEvent[], node: string): boolean {
  return events.some((event) => event.node === node);
}

/**
 * Every node the ledger has heard of, in the order it first heard of them.
 *
 * The other half of `isRecorded`: that answers whether the record knows a bundle, this answers
 * what the record knows that no bundle answers to. A ledger node with no document is a change
 * removed or renamed outside the tool, and until something asks this question the events sit
 * there addressing nothing while every command exits `0`.
 *
 * First-seen order rather than sorted, because the ledger's order is the order things happened
 * and a report that re-sorts it invents a sequence nothing recorded.
 */
export function nodesIn(events: readonly LifecycleEvent[]): readonly string[] {
  const seen = new Set<string>();
  const nodes: string[] = [];
  for (const event of events) {
    if (seen.has(event.node)) continue;
    seen.add(event.node);
    nodes.push(event.node);
  }
  return nodes;
}
