/**
 * Writing the corpus skeleton.
 *
 * One function, and the whole of it is a refusal: **a file that is already there is left
 * alone.** `molly init` writes into a directory the tool did not make — `docs/` by default,
 * which a great many repositories already have and already keep an index in — so every write
 * it makes is a write over somebody else's file until something says otherwise.
 *
 * The contents are decisions nobody here made, and a README has no shape to merge into, so this
 * keeps and reports rather than repairing.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { ATTRIBUTES_FILE, HISTORY_FILE, README_FILE, STATE_DIR } from './layout';

/**
 * What happened to one file.
 *
 * Three outcomes, and the third is a **report and never a repair.** Init's first answer is still
 * whether it wrote: a kept file that happens to be byte-identical is a file init did not write,
 * which is why `kept` and `differs` are both kept and only one of them is worth saying out loud.
 *
 * `differs` exists because two outcomes made a claim the command could not support. An install
 * completing an existing corpus reported *it already had everything this version writes* from
 * `existsSync` alone — true about files, false about their contents, and false in exactly the
 * case the sentence was there for: a corpus carrying an earlier version's explainer through an
 * upgrade that rewrote it, told it was current.
 *
 * The asymmetry with `writeScaffold` next door is deliberate and is about ownership rather than
 * about care. That writes this tool's own `molly`-namespaced files at the repository root, so it
 * replaces what differs. This writes into `docs/`, a directory the tool did not make, where the
 * files become the project's the moment they exist — so it may compare and it may not replace.
 * `decisions/the-tool-writes-only-what-it-owns` is the constraint, and naming the file is the
 * whole of what somebody needs to run `molly init` in an empty directory and look.
 */
export type Placement = 'created' | 'kept' | 'differs';

/**
 * Writes only where nothing is. Says which happened, never which it wanted.
 *
 * Empty text is kept without being read. A comparison against nothing can only ever say
 * *differs*, which carries no information — and the file this rule exists for is the ledger,
 * which is placed empty, holds data rather than prose, and is the one file here that grows.
 */
export async function place(root: string, path: string, text: string): Promise<Placement> {
  const target = join(root, ...path.split(posix.sep));
  if (existsSync(target)) {
    if (text === '') return 'kept';
    const current = await readFile(target, 'utf8').catch(() => undefined);
    return current === text ? 'kept' : 'differs';
  }

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text, 'utf8');
  return 'created';
}

/**
 * Every path `molly init` writes inside a corpus, corpus-relative.
 *
 * Here rather than inside `init` because a second reader arrived: `molly status` reports what is
 * missing, and two lists of the same thing would drift the day one of them gained a file. The
 * areas are not in it — they come from the table in core, which is where an area is declared —
 * so this is the rest: the explainers that belong to no area, the ledger, and the attributes
 * file that makes it mergeable.
 *
 * `conventions.md` is deliberately absent. It is a file the *project* writes and `init` merely
 * makes room for; a corpus without one is a project with no rules of its own, and reporting it
 * as missing would make an invitation into a nag.
 */
export const SKELETON: readonly string[] = [
  README_FILE,
  ATTRIBUTES_FILE,
  HISTORY_FILE,
  posix.join(STATE_DIR, README_FILE),
];

/** Which of them a corpus does not have. Ordered as above, so the report reads the same way twice. */
export function missingFrom(root: string, areas: readonly string[]): readonly string[] {
  const absent = (path: string): boolean => !existsSync(join(root, path));
  return [
    ...areas.map((area) => posix.join(area, README_FILE)).filter(absent),
    ...SKELETON.filter(absent),
  ];
}
