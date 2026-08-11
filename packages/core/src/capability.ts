/**
 * A capability: what the product is responsible for, and where the edges are.
 *
 * A grouping rather than a claim. A specification names the capability it belongs to and
 * reading is scoped by it, which is what keeps a corpus readable once it no longer fits in one
 * sitting.
 *
 * **No state, and no kind.** A record carrying a state field is a record something will
 * eventually try to move, and a capability has nothing to move through: it is current, and it
 * is edited directly rather than by a change merging into it. That absence is why nothing about
 * a capability reaches the transition ledger.
 */

export interface CapabilityRecord {
  readonly title: string;
  readonly lang: string;
}
