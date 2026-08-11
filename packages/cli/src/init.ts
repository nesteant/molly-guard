/**
 * `molly init`
 *
 * Writes the skeleton and nothing else: every area directory, each explaining itself in a
 * `README.md`, plus the config that marks the root and the ledger the history is appended to.
 *
 * It seeds no example. A corpus that starts with somebody else's invoice specification starts
 * with a deletion, and a seeded change in draft makes the tracker report one in flight on the
 * first day — a tracker that is wrong from the first minute is one people learn to disbelieve.
 * An example is produced by running the flow, which is the only way to get one whose history
 * is not a fiction.
 */

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT_README, STATE_README, allDirectories, readmeFor } from '@mollyguard/core';
import { CONFIG_FILE, HISTORY_FILE, README_FILE, STATE_DIR } from '@mollyguard/store';
import { agentsCommand } from './agents';
import { bold, dim, fail, green, info, teal } from './ui';

const CONFIG = (lang: string): string => `# MollyGuard corpus configuration.
#
# \`lang\` is the language the specifications are written in.
lang: ${lang}
`;

export async function initCommand(
  root: string,
  dir: string,
  lang: string,
  cwd: string,
): Promise<number> {
  if (existsSync(join(root, CONFIG_FILE))) {
    fail(
      `a corpus already exists at ${dir}/`,
      `delete it first, or pass --root <dir> for a second one`,
    );
  }

  await mkdir(join(root, STATE_DIR), { recursive: true });
  await writeFile(join(root, CONFIG_FILE), CONFIG(lang), 'utf8');

  // Created empty rather than absent. A ledger that appears on first write is a ledger whose
  // absence and whose emptiness look the same, and those mean different things.
  await writeFile(join(root, HISTORY_FILE), '', 'utf8');

  let readmes = 0;
  await writeFile(join(root, README_FILE), ROOT_README(dir), 'utf8');
  await writeFile(join(root, STATE_DIR, README_FILE), STATE_README, 'utf8');
  readmes += 2;

  const directories = allDirectories();
  for (const directory of directories) {
    await mkdir(join(root, directory), { recursive: true });
    await writeFile(join(root, directory, README_FILE), readmeFor(directory), 'utf8');
    readmes++;
  }

  info(`${green('*')} corpus initialised at ${teal(`${dir}/`)}`);
  info();
  info(`  ${dim('config')}      ${dir}/${CONFIG_FILE}`);
  info(`  ${dim('areas')}       ${directories.join(', ')}`);
  info(`  ${dim('readme')}      ${readmes} file(s) — one per directory, saying what belongs in it`);
  info(`  ${dim('knowledge')}   ${dim('empty — nothing is true until a change is published')}`);
  info(`  ${dim('language')}    ${lang}`);
  info(`  ${dim('agents')}      instructions, in the directories agent tools read`);
  info();
  info();

  // Installed with the corpus rather than as a second step, because from where the person is
  // standing there is one act: this repository now uses MollyGuard. A corpus whose agent finds
  // no instructions is one whose agent improvises a workflow — editing the knowledge base
  // directly, writing deltas, hand-writing a state — and every one of those produces a corpus
  // that looks maintained and is not.
  //
  // Written at the working directory rather than inside the corpus: it is where the tools look.
  await agentsCommand(cwd, { check: false });

  info();
  info(`Next: ${bold('molly change new "<title>"')} — nothing enters the base any other way.`);
  return 0;
}
