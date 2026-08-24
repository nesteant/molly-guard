/**
 * A roadmap slice: a body of planned work that has not become changes yet.
 *
 * Read while planning, so that a new change does not quietly contradict something already
 * intended. That is its whole job, and it is why a slice that nothing lists is worse than no
 * slice at all — somebody plans against a corpus that appears to intend nothing.
 *
 * **One document, describing many features.** What is in the slice, the order they are wanted
 * in, what has already been decided about them and what is done — all of it prose, none of it
 * read here. `core-never-parses-a-body` is not bent for planning: the reader that acts on the
 * order is a model, taught by the `molly-roadmap` skill, and the tool contributes the shape the
 * template writes rather than a schema it checks.
 *
 * **No capability.** A capability answers *what is the product responsible for*; a slice answers
 * *what body of work are we planning*. The axes are independent and a slice is expected to cross
 * several capabilities, which is the shape a business need arrives in. A field that would lie in
 * the ordinary case is worse than no field.
 *
 * **No state.** A slice is open, or realised by the changes that landed, and neither is recorded:
 * nothing here reaches the transition ledger, for the same reason a capability does not. What has
 * a lifecycle is the change, and planning that can be advanced is planning somebody advances
 * instead of writing the change.
 */

export interface RoadmapRecord {
  readonly title: string;
  readonly lang: string;
}
