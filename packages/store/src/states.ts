/**
 * Reading a state that was written down, possibly under a name it no longer has.
 *
 * `merged` was renamed to `published` when the command that performs the fold was named. Two
 * different files hold that word — the ledger, and the `state:` a change document projects —
 * and they have to understand it the same way. Understood in one and not the other, a corpus
 * written before the rename would show a document and a fold that agree while the tool reported
 * one of them as absent.
 *
 * **Written strictly, read leniently.** Nothing is rewritten on the way past: a correction to a
 * record is another line rather than an edit, and this is not a correction — it is the same
 * state under the name it was recorded with. The old name disappears from a document only when
 * something moves that change and the field is projected afresh.
 */

import { State, isState } from '@mollyguard/core';

const RENAMED: Readonly<Record<string, State>> = { merged: 'published' };

export function readState(value: unknown): State | undefined {
  if (isState(value)) return value;
  return typeof value === 'string' ? RENAMED[value] : undefined;
}
