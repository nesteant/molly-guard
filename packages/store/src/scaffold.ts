/**
 * Putting the agent instructions on disk, and pre-authorising the commands.
 *
 * Three outcomes rather than two — created, replaced, already current — because the third is
 * what `--check` reads. A writer that could not tell "already there" from "just written" would
 * force the check to implement the same comparison a second time, and two comparisons of one
 * thing eventually disagree.
 *
 * Everything here is written outside the corpus, at the repository root, because that is where
 * the tools look. It is the only part of MollyGuard that writes outside one — and every path it
 * writes is this tool's own, `molly`-namespaced, and deletable without surgery on anything else.
 *
 * **A settings file is not written here, and is not written anywhere.** This once merged
 * `Bash(molly:*)` into `.claude/settings.json`, carefully: whole when absent, otherwise parsed,
 * given only what it lacked, and left alone in any shape it did not understand. Careful was not
 * the point. That file decides what may run without being asked, its contents are somebody's
 * judgement about risk, and a tool that adds itself to it has approved itself. `molly agents`
 * names the permissions instead, and a person spends ten seconds granting one they have read.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { ScaffoldFile } from '@mollyguard/core';

export type Outcome = 'created' | 'replaced' | 'current';

export interface Placed {
  readonly path: string;
  readonly outcome: Outcome;
}

/** Writes the files, reporting what each one turned out to be. */
export async function writeScaffold(
  root: string,
  files: readonly ScaffoldFile[],
): Promise<readonly Placed[]> {
  const placed: Placed[] = [];

  for (const file of files) {
    const target = join(root, ...file.path.split(posix.sep));
    const outcome = await compare(target, file.text);
    if (outcome !== 'current') {
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, file.text, 'utf8');
    }
    placed.push({ path: file.path, outcome });
  }

  return placed;
}

/** What is absent or different, without writing anything. The whole of `--check`. */
export async function checkScaffold(
  root: string,
  files: readonly ScaffoldFile[],
): Promise<readonly Placed[]> {
  const stale: Placed[] = [];

  for (const file of files) {
    const target = join(root, ...file.path.split(posix.sep));
    const outcome = await compare(target, file.text);
    if (outcome !== 'current') stale.push({ path: file.path, outcome });
  }

  return stale;
}

async function compare(target: string, text: string): Promise<Outcome> {
  if (!existsSync(target)) return 'created';
  const current = await readFile(target, 'utf8').catch(() => undefined);
  return current === text ? 'current' : 'replaced';
}
