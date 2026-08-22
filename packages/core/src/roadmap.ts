/**
 * A roadmap entry: intent that has not become a change yet.
 *
 * Read while planning, so that a new change does not quietly contradict something already
 * intended. That is its whole job, and it is why an entry that nothing lists is worse than no
 * entry at all — somebody plans against a corpus that appears to intend nothing.
 *
 * **No state.** An entry is open, or realised by a change that landed, and neither is recorded:
 * nothing here reaches the transition ledger, for the same reason a capability does not. What
 * has a lifecycle is the change, and an entry that became one is answered by the change.
 */

export interface RoadmapRecord {
  readonly title: string;
  readonly lang: string;
  /**
   * The capability this intent belongs to, bare: `billing`.
   *
   * Optional, and absent rather than empty where nothing was declared — an entry nobody filed
   * is not an entry filed under nothing. Unlike a change's, it is not checked against what is on
   * disk: an entry is a note, and refusing one for naming a capability somebody has not written
   * yet would refuse the ordinary order of planning.
   */
  readonly capability?: string | undefined;
}
