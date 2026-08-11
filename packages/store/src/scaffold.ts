/**
 * Putting the agent instructions on disk, and pre-authorising the commands.
 *
 * Three outcomes rather than two — created, replaced, already current — because the third is
 * what `--check` reads. A writer that could not tell "already there" from "just written" would
 * force the check to implement the same comparison a second time, and two comparisons of one
 * thing eventually disagree.
 *
 * Everything here is written outside the corpus, at the repository root, because that is where
 * the tools look. It is the only part of MollyGuard that touches files a corpus does not own.
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

export interface Authorised {
  readonly outcome: Outcome;
  /** Set when the file exists and could not be read as JSON. Nothing was touched. */
  readonly unreadable?: string;
}

/**
 * Adds the permissions a session needs, to a file this tool does not own.
 *
 * Written whole when absent. When present it is parsed, given only the entries it lacks, and
 * written back — everything else survives, because a project's settings hold decisions nobody
 * here made. A file that will not parse is reported and left exactly as it is: guessing at the
 * contents of somebody's configuration is worse than saying it could not be read.
 */
export async function authorise(
  root: string,
  file: string,
  permissions: readonly string[],
): Promise<Authorised> {
  const target = join(root, ...file.split(posix.sep));

  if (!existsSync(target)) {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, `${JSON.stringify({ permissions: { allow: [...permissions] } }, null, 2)}\n`, 'utf8');
    return { outcome: 'created' };
  }

  const text = await readFile(target, 'utf8').catch(() => undefined);
  if (text === undefined) return { outcome: 'current', unreadable: `${file} could not be read` };

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (cause) {
    return { outcome: 'current', unreadable: `${file}: ${(cause as Error).message.split('\n')[0]}` };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { outcome: 'current', unreadable: `${file} is not a settings object` };
  }

  const settings = parsed as Record<string, unknown>;

  // Only merged into a shape this understands. `permissions` holding a string would otherwise be
  // spread character by character into an object, and `allow` holding one would be thrown away —
  // both silently, in a file whose contents are somebody else's decisions. Reporting and leaving
  // it is the only honest answer to a shape nobody here anticipated.
  const found = settings['permissions'];
  if (found !== undefined && (typeof found !== 'object' || found === null || Array.isArray(found))) {
    return { outcome: 'current', unreadable: `${file} has a "permissions" that is not an object` };
  }
  const block = (found ?? {}) as Record<string, unknown>;

  const listed = block['allow'];
  if (listed !== undefined && !Array.isArray(listed)) {
    return { outcome: 'current', unreadable: `${file} has a "permissions.allow" that is not a list` };
  }
  const allow = ((listed ?? []) as unknown[]).filter((entry): entry is string => typeof entry === 'string');

  const missing = permissions.filter((entry) => !allow.includes(entry));
  if (missing.length === 0) return { outcome: 'current' };

  settings['permissions'] = { ...block, allow: [...allow, ...missing] };
  await writeFile(target, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  return { outcome: 'replaced' };
}
