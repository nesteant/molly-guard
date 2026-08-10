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
 * `README.md` is documentation, never a record.
 *
 * Every other `.md` in an area is read as a document, which is why a directory could not
 * otherwise explain itself: an explainer in `decisions/` would parse as a decision named
 * `readme`, and one in `specs/` — which holds folders — would be reported as a stray file.
 * The exclusion is by name, in one place, for every area: a rule per area is a rule somebody
 * forgets when they add the next one.
 */
export const README_FILE = 'README.md';

export function isReadme(fileName: string): boolean {
  return /^readme(\.[a-z]{2,3}(-[A-Za-z0-9]{2,8})*)?\.md$/i.test(fileName);
}
