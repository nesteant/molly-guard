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
 * Git attributes for the corpus, and the one pattern that goes in them.
 *
 * **Inside the corpus, not at the repository root.** Git reads a `.gitattributes` in any
 * directory and applies it to that directory and below, so the pattern is relative to the corpus
 * and one string is correct for every `root:`. That is also what keeps this the tool's own file:
 * `decisions/the-tool-writes-only-what-it-owns` permits two kinds of file outside the corpus and
 * says there is no third, and a repository-root `.gitattributes` would have been it.
 *
 * **Union merge is safe here and nowhere else.** Two branches that each advanced a change have
 * both appended at the end of the ledger, and git cannot know both additions are wanted. That
 * resolution is correct only for a file whose lines are independent facts and whose order carries
 * no meaning beyond *this happened*. Two edits to a specification are a disagreement somebody has
 * to resolve, and keeping both sides would be the wrong answer — so the pattern names one file
 * rather than a directory.
 */
export const ATTRIBUTES_FILE = '.gitattributes';
export const LEDGER_MERGE = `${HISTORY_FILE} merge=union`;

/**
 * The file a project writes its own rules for working in this corpus in.
 *
 * Named here rather than in the skills that point at it, so the path exists in one place — and
 * fixed rather than configurable: four generated skills name it, and a corpus that could move it
 * would be a corpus where the config and the skills can disagree about where a project's rules
 * are. The skills are what an agent actually reads, so they win, so there is nothing to declare.
 */
export const CONVENTIONS_FILE = 'conventions.md';

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
