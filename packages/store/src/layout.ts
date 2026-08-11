/**
 * Where things live on disk.
 *
 * The only module allowed to know the shape of a path. Everything else asks for one.
 */

/** Default corpus directory. Named for what it holds, not for the tool. */
export const DEFAULT_ROOT = 'docs';

/** State the tool maintains, kept apart from documents people write. */
export const STATE_DIR = '.mollyguard';

export const CONFIG_FILE = 'mollyguard.yml';
export const HISTORY_FILE = `${STATE_DIR}/history.jsonl`;

/**
 * The name of the file a directory explains itself in.
 *
 * Nothing reads it. Every directory carries one because git tracks no empty directory, so a
 * skeleton without them is a corpus that vanishes on clone.
 */
export const README_FILE = 'README.md';

/**
 * Whether a directory entry is a document at all.
 *
 * **A file named `README.md`, in any area, is documentation and never a record** — excluded by
 * name, here, for every area including the ones added later. A rule written per area is one
 * somebody forgets when they add the next one, and the failure is an explainer in `decisions/`
 * parsing as a decision called `readme`.
 *
 * Machine-local clutter goes the same way: a `.DS_Store` reported as unreadable would make the
 * report itself the noise.
 */
export function isDocumentName(name: string): boolean {
  return !name.startsWith('.') && name !== README_FILE;
}
