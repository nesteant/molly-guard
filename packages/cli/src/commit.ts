/**
 * `molly commit-msg <file>`
 *
 * The half of a commit rule that is about MollyGuard: a `MollyGuard: <id>` trailer names a
 * change, and the id has to resolve to one. A project keeps its own conventional-commit linting
 * — subject length, scope vocabulary, imperative mood — because none of that is the tool's
 * business and all of it is the project's taste.
 *
 * **It reads a path and writes nothing.** Where this runs is the repository's own arrangement,
 * and husky, lefthook and pre-commit are in that business already — they order hooks, chain
 * them, and install them across a team. This composes with all three by being a file reader
 * that answers in an exit code, and competes with none of them by installing nothing.
 * `molly help` names the line each one wants.
 *
 * **It resolves against `changes/` and `history/` both.** A commit landing today may implement a
 * change that publishes tomorrow, and one written six months ago names a change that has long
 * since been archived. A check that knew only about work in flight would start refusing the
 * repository's own history the first time anybody rebased over it.
 *
 * Exit codes carry the answer, as everywhere: `0` clean, `1` a refusal. That is the whole
 * integration surface a `commit-msg` hook needs.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CHANGES, area, mustNameChange, readCommitMessage, TRAILER, unqualify } from '@mollyguard/core';
import { Corpus, readConfig } from '@mollyguard/store';
import { fail } from './ui';

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
