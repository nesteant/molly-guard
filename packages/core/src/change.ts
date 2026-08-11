/**
 * A change: the four documents one unit of intent is made of.
 *
 * A change is not finished when its text is written. A specification with no design has not
 * been thought through; a design with no task order is not schedulable; work with no tests is
 * not verifiable. Keeping them as siblings in one folder means they are reviewed together,
 * moved together, and archived together.
 *
 * One record per bundle. `change.md` carries the frontmatter and the other three are prose —
 * otherwise `title` lives in four files and they disagree inside a week.
 */

export const CHANGE_PARTS = {
  entry: 'change.md',
  plan: 'plan.md',
  tasks: 'tasks.md',
  tests: 'tests.md',
} as const;

export type ChangePart = keyof typeof CHANGE_PARTS;

/**
 * The folder a change carries the knowledge base it intends to produce in.
 *
 * A partial mirror of the corpus: `publish/specs/feeding/spec.md` is the document that becomes
 * `specs/feeding/spec.md`. The path is the id, so the path is also the instruction — there is
 * nothing else to say where a document goes.
 *
 * Part of what a change bundle *is*, which is why it is named here rather than inside the
 * command that consumes it.
 */
export const CHANGE_PUBLISH = 'publish';

/** A label. It sets what a reader expects, and it is what listings are scanned by. */
export const CHANGE_KINDS = ['feature', 'bug', 'refactor', 'chore'] as const;
export type ChangeKind = (typeof CHANGE_KINDS)[number];

export function isChangeKind(value: unknown): value is ChangeKind {
  return typeof value === 'string' && (CHANGE_KINDS as readonly string[]).includes(value);
}

export interface ChangeRecord {
  readonly title: string;
  readonly lang: string;
  readonly kind: ChangeKind;
  /**
   * The capability this work is filed under, bare: `billing`.
   *
   * Optional in the type as well as in the document, because absent and empty are different
   * answers — a change nobody filed is not a change filed under nothing. Bare rather than
   * qualified because the field admits exactly one area, so there is nothing to disambiguate.
   */
  readonly capability?: string | undefined;
  /**
   * What in the knowledge base this change alters, qualified: `specs/<name>`.
   *
   * **Only documents that exist.** Named `alters` rather than `targets` because a thing cannot
   * be altered before it is there, and the old name invited the other reading: a change would
   * write down the name a specification was going to be given, which is a promise nothing can
   * check — not now, and not at publication either, which is free to produce another name.
   *
   * Empty is the normal answer for a change that introduces new truth, and it is not an
   * omission. What such a change owes instead is a `capability`, so publishing knows where to
   * file what it creates.
   */
  readonly alters: readonly string[];
}

/**
 * Where a change starts.
 *
 * Written into the document at creation so the file answers "what state is this" on its own —
 * a corpus read in a pull request is read as files, and a state only the ledger knows is a
 * state the reviewer cannot see.
 */
export const INITIAL_STATE = 'draft';
