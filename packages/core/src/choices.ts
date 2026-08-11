/**
 * What a person may be offered to pick from.
 *
 * Both lists are built here, pure, rather than inside the prompt that shows them — for two
 * reasons that turn out to be the same reason. A slice must be able to narrow what is offered
 * without importing a terminal, and the harness must be able to assert what is offered without
 * driving one. A list only reachable through a TTY is a list nothing checks.
 *
 * **A filter may narrow a list. It may never widen one.** Anything a filter returns that was
 * not in what it was given is dropped, so no slice can offer an edge the lifecycle table does
 * not have. A tool whose lifecycle means something different depending on what is installed is
 * a tool nobody can write instructions for — the same rule that lets a slice add a check and
 * never replace one.
 */

import { Direction, STATES, State, TERMINAL, directionOf, positionOf } from './lifecycle';

/** A change, as it appears in a picker. */
export interface MoveChoice {
  /** Qualified id: `changes/<slug>`. What the ledger records. */
  readonly node: string;
  /** What a person types when they are not picking. */
  readonly slug: string;
  readonly title: string;
  readonly state: State;
}

/** A state a change could move to, and which way that goes. */
export interface StateChoice {
  readonly to: State;
  readonly direction: Direction;
}

/**
 * How a slice narrows what may be picked.
 *
 * Both methods are optional: a slice that only cares about states says nothing about changes.
 * Neither may add — see the rule above.
 */
export interface ChoiceFilter {
  /** Reported by `molly plugins`, so a corpus can say who removed an option. */
  readonly name: string;
  changes?(all: readonly MoveChoice[]): readonly MoveChoice[];
  states?(from: State, all: readonly StateChoice[]): readonly StateChoice[];
}

/** Forwards before backwards, and nearest first within each. */
function rank(here: number, to: State): number {
  const distance = positionOf(to) - here;
  return distance > 0 ? distance : STATES.length + Math.abs(distance);
}

/** Keeps only what was already there, in the original order. Order is core's, not a slice's. */
function narrowed<T>(original: readonly T[], returned: readonly T[], key: (item: T) => string): readonly T[] {
  const kept = new Set(returned.map(key));
  return original.filter((item) => kept.has(key(item)));
}

/**
 * Every state a *move* could record — every state but the one it is in, and but the terminal
 * one.
 *
 * Nothing is withheld on the grounds of order: the sequence describes a sequence rather than
 * permitting a set of edges, and what a move *requires* is policy, which is a slice's or an
 * orchestrator's.
 *
 * The terminal state is a different matter and is not policy. Reaching it is a *write* — the
 * documents a change carries go into the knowledge base and the bundle is archived — and only
 * the command that performs that write can record it truthfully. A move that recorded it would
 * append a line claiming a publication that never happened, and every later reader would
 * believe it. So it is not offered here and is refused where it is typed.
 *
 * The order is the useful part of what remains. The next state in the sequence comes first,
 * because it is what somebody is usually reaching for; then the rest forwards, then the ones
 * that go back. A list sorted by name would put `approved` above `draft` and make the common
 * case the hardest to find.
 */
export function selectableStates(
  from: State,
  filters: readonly ChoiceFilter[] = [],
): readonly StateChoice[] {
  const here = positionOf(from);
  const all: readonly StateChoice[] = STATES.filter((state) => state !== from && state !== TERMINAL)
    .map((state) => ({ to: state, direction: directionOf(from, state) }))
    .sort((a, b) => rank(here, a.to) - rank(here, b.to));

  return filters.reduce<readonly StateChoice[]>(
    (offered, filter) =>
      filter.states ? narrowed(offered, filter.states(from, offered), (c) => c.to) : offered,
    all,
  );
}

/** Every change that may be moved. */
export function selectableChanges(
  all: readonly MoveChoice[],
  filters: readonly ChoiceFilter[] = [],
): readonly MoveChoice[] {
  return filters.reduce<readonly MoveChoice[]>(
    (offered, filter) =>
      filter.changes ? narrowed(offered, filter.changes(offered), (c) => c.node) : offered,
    all,
  );
}
