/**
 * What a commit message says about a change.
 *
 * The rule a project wants here is half its own and half the tool's, and separating them is the
 * whole reason this exists. **Which commits must name a change is the project's** — a repository
 * using conventional commits may want it of `feat` and `fix` and not of `docs`; one using no
 * convention at all wants it of nothing. **That the name resolves is the tool's**, because the
 * trailer holds a MollyGuard id and nothing else knows what those address.
 *
 * So the policy is declared and the resolution is not optional. A corpus that declares nothing
 * gets the second half alone: a trailer that names a change which does not exist is refused
 * wherever it appears, and no commit is required to carry one.
 *
 * Pure. Reading the file and resolving the id against the corpus both happen outside.
 */

/** The trailer key. Fixed, because it is the tool's own name — there is nothing to configure. */
export const TRAILER = 'MollyGuard';

/**
 * A message git composed rather than a person, which no rule here applies to.
 *
 * A merge and a revert are generated headers with no type and no author deciding their shape;
 * `fixup!` and `squash!` are addressed to a later rebase and vanish into the commit they amend.
 * Requiring any of them to name a change is requiring an edit to a message the tool itself is
 * about to discard.
 */
const GENERATED = /^(Merge\b|Revert\b|fixup!|squash!|amend!)/;

/** `type(scope)!: subject` — the shape a type can be read off. Anything else has no type. */
const HEADER = /^([a-z]+)(?:\([^)]*\))?!?:\s/i;

export interface CommitMessage {
  /** The conventional-commit type, lowercased, where the subject has one. */
  readonly type: string | undefined;
  /** Every id the message names, in the order written. Usually none or one. */
  readonly names: readonly string[];
  /** Whether nothing here is a rule's business. */
  readonly generated: boolean;
}

/**
 * Reads a composed message.
 *
 * **Composed, not authored.** A squash-merged pull request becomes a commit whose message is the
 * PR title and body, and a check that ran over the branch's own commits would have passed on
 * every one of them and let that message onto the trunk unexamined. The input here is whatever
 * git is about to record, which is what a `commit-msg` hook is handed and what a pipeline should
 * read back out of the merge commit.
 *
 * Comment lines are dropped first, because git strips them after the hook has run — a trailer
 * inside the commented block is one the author did not write.
 */
export function readCommitMessage(text: string): CommitMessage {
  const lines = text.split(/\r?\n/).filter((line) => !line.startsWith('#'));

  // The first line with anything on it. A message may open with blank lines and still be one.
  const subject = lines.find((line) => line.trim() !== '')?.trim() ?? '';

  const names: string[] = [];
  // Anywhere in the message, not only in the trailing block. Git would only honour the last
  // paragraph, but a person who wrote the line meant it wherever they put it, and reading it
  // where they wrote it turns a silent miss into a check.
  const trailer = new RegExp(`^\\s*${TRAILER}:\\s*(.+?)\\s*$`, 'i');
  for (const line of lines) {
    const found = trailer.exec(line);
    if (found?.[1] !== undefined) names.push(found[1]);
  }

  const header = HEADER.exec(subject);
  return {
    type: header?.[1]?.toLowerCase(),
    names,
    generated: GENERATED.test(subject),
  };
}

/** Whether this message is required to name a change, given the types a corpus asks it of. */
export function mustNameChange(message: CommitMessage, requires: readonly string[]): boolean {
  if (message.generated || requires.length === 0) return false;
  return message.type !== undefined && requires.includes(message.type);
}
