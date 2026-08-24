/**
 * Writing the corpus skeleton.
 *
 * One function, and the whole of it is a refusal: **a file that is already there is left
 * alone.** `molly init` writes into a directory the tool did not make — `docs/` by default,
 * which a great many repositories already have and already keep an index in — so every write
 * it makes is a write over somebody else's file until something says otherwise.
 *
 * It is the same courtesy `authorise` next door gives `.claude/settings.json`, for the same
 * reason: the contents are decisions nobody here made. That one merges because a settings file
 * has a shape to merge into. A README has none, so this one keeps and reports.
 */

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { ATTRIBUTES_FILE, HISTORY_FILE, README_FILE, STATE_DIR } from './layout';

/**
 * What happened to one file.
 *
 * Two outcomes and not three. `writeScaffold` has `created`, `replaced` and `current` because
 * `--check` has to tell a file that matches from one that does not; nothing asks that here.
 * Init's answer is whether it wrote, and a kept file that happens to be byte-identical is still
 * a file init did not write.
 */
export type Placement = 'created' | 'kept';

/** Writes only where nothing is. Says which happened, never which it wanted. */
export async function place(root: string, path: string, text: string): Promise<Placement> {
  const target = join(root, ...path.split(posix.sep));
  if (existsSync(target)) return 'kept';

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
