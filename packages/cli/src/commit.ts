/**
 * `molly commit-msg <file>` and `molly hooks install`
 *
 * The half of a commit rule that is about MollyGuard: a `MollyGuard: <id>` trailer names a
 * change, and the id has to resolve to one. A project keeps its own conventional-commit linting
 * — subject length, scope vocabulary, imperative mood — because none of that is the tool's
 * business and all of it is the project's taste.
 *
 * **It resolves against `changes/` and `history/` both.** A commit landing today may implement a
 * change that publishes tomorrow, and one written six months ago names a change that has long
 * since been archived. A check that knew only about work in flight would start refusing the
 * repository's own history the first time anybody rebased over it.
 *
 * Exit codes carry the answer, as everywhere: `0` clean, `1` a refusal. That is the whole
 * integration surface a `commit-msg` hook needs.
 */

import { execFileSync } from 'node:child_process';
import { chmod, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CHANGES, area, mustNameChange, readCommitMessage, TRAILER, unqualify } from '@mollyguard/core';
import { Corpus, place, readConfig } from '@mollyguard/store';
import { dim, fail, green, info, teal } from './ui';

export interface CommitMessageOptions {
  readonly file: string | undefined;
}

export async function commitMessageCommand(
  corpus: Corpus,
  options: CommitMessageOptions,
): Promise<number> {
  const { root, dir } = corpus;
  if (options.file === undefined) {
    fail('molly commit-msg <file>', 'the file git is about to record the message from');
  }
  if (!existsSync(options.file)) {
    fail(`no message at ${options.file}`, 'a commit-msg hook is passed the path by git');
  }

  const config = await readConfig(corpus.config);

  // From the area table rather than a second copy of the word. A directory name written twice
  // is a directory name that gets renamed once, and `publish` already reads it from here.
  const archive = area(CHANGES)?.archiveInto;
  if (archive === undefined) {
    fail('changes have nowhere to be archived', 'this is a defect in the tool');
  }

  const message = readCommitMessage(await readFile(options.file, 'utf8'));

  if (message.names.length === 0) {
    if (!mustNameChange(message, config.commitRequires)) return 0;
    fail(
      `a ${message.type} commit must name the change it implements`,
      `add a trailer: ${TRAILER}: <change>. Types that need one: ${config.commitRequires.join(', ')}`,
    );
  }

  // Every name, not the first. A squash merge composes one message out of several, so two
  // trailers is an ordinary outcome rather than a mistake — and checking only one of them is how
  // the other reaches the trunk naming nothing.
  for (const name of message.names) {
    const slug = unqualify(CHANGES, name);
    if (existsSync(join(root, CHANGES, slug)) || existsSync(join(root, archive, slug))) continue;
    fail(
      `${TRAILER}: ${name} names no change`,
      `nothing at ${dir}/${CHANGES}/${slug}/ or ${dir}/${archive}/${slug}/ — \`molly status\` lists what there is`,
    );
  }

  return 0;
}

/**
 * The hook, written where git will find it.
 *
 * It calls the `molly` on the PATH rather than embedding the rule, so a repository that upgrades
 * the tool upgrades the check — a hook holding a copy of the logic is a hook that enforces
 * whichever version was installed on each machine.
 */
const HOOK = `#!/bin/sh
# Installed by \`molly hooks install\`. Verifies that a commit naming a change names one that
# exists. The rule itself lives in the tool, so upgrading molly upgrades this check.
exec molly commit-msg "$1"
`;

/**
 * Where this repository's hooks actually live.
 *
 * **Not `.git/hooks`.** In a worktree or a submodule `.git` is a *file* pointing elsewhere, and
 * joining a path onto it produces one that cannot be created — which crashed with `ENOTDIR` and
 * exit `2`, the code reserved for a defect in the tool. A worktree is an ordinary thing to be
 * standing in, so the tool asks git rather than assuming a layout.
 *
 * Asked of git for the same reason `identity` asks it who you are: the answer is already there
 * and inventing a second one is how the two disagree. `core.hooksPath` is honoured by this too,
 * so a repository that relocated its hooks gets the hook where it keeps them.
 */
function hooksDirectory(cwd: string): string | undefined {
  try {
    const path = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-path', 'hooks'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return path === '' ? undefined : path;
  } catch {
    return undefined;
  }
}

export async function hooksCommand(cwd: string, dir: string): Promise<number> {
  const hooks = hooksDirectory(cwd);
  if (hooks === undefined) {
    fail('no git repository here', 'run this from inside one — `molly commit-msg <file>` needs no hook');
  }

  // The same courtesy `molly init` gives a directory it did not make: a hook already there was
  // written by somebody, and replacing it would silently drop whatever else it ran.
  const path = 'commit-msg';
  const outcome = await place(hooks, path, HOOK);

  if (outcome === 'kept') {
    info(`${dim('=')} ${join(hooks, path)} was already here, and was left as it is`);
    info(dim(`    add this line to it yourself: exec molly commit-msg "$1"`));
    return 0;
  }

  await chmod(join(hooks, path), 0o755);
  info(`${green('+')} ${teal(join(hooks, path))} ${dim('— a commit naming a change must name one that exists')}`);
  info();
  info(dim(`  it reads ${dir}/, and passes any message that names nothing`));
  return 0;
}
