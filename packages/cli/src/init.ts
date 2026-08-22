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
 *
 * **It writes nothing over anything.** The root is a directory somebody else's repository
 * already had, so every file here is placed only where there is nothing, and what was found is
 * named at the end. The corpus is still made either way — keeping a file is not a refusal.
 *
 * **Two places, and only one of them is the corpus.** `mollyguard.yml` goes at the top of the
 * repository and names the directory; the directory holds the areas. That is what lets every
 * other command find the corpus from anywhere inside the repository instead of being told where
 * it is on each invocation.
 */

import { mkdir } from 'node:fs/promises';
import { join, posix, relative } from 'node:path';
import { ROOT_README, STATE_README, allDirectories, readmeFor } from '@mollyguard/core';
import { CONFIG_FILE, HISTORY_FILE, README_FILE, STATE_DIR, corpusAt, place } from '@mollyguard/store';
import { agentsCommand } from './agents';
import { amber, bold, dim, fail, green, info, teal } from './ui';

const CONFIG = (root: string, lang: string): string => `# MollyGuard corpus configuration.
#
# This file sits at the top of the repository and names the directory the corpus is in, so every
# command finds it from anywhere inside — there is nothing to pass on the command line.
root: ${root}

# \`lang\` is the language the specifications are written in.
lang: ${lang}

# How names are minted, per area. Commented out because the tool has no opinion about whether a
# corpus wants ordering — without this every name is its slug, exactly as it reads below.
#
# \`{ordinal:n}\` is the next unused number in that area, zero-padded to n. Unused means unused
# ever: what is in the directory, what was archived out of it, and what the ledger remembers of
# something deleted by hand. \`--name\` still overrides, which is how a corpus migrates onto a
# pattern without renaming what it already has.
#
# naming:
#   changes:   '{ordinal:4}-{slug}'
#   specs:     '{ordinal:4}-{slug}'
#   decisions: '{ordinal:4}-{slug}'
`;

export async function initCommand(
  cwd: string,
  dir: string,
  given: string | undefined,
): Promise<number> {
  const lang = given ?? 'en';
  const root = join(cwd, dir);

  // A corpus already configured *here*, in either layout — not one somewhere above, which a
  // package inside a larger repository would legitimately sit under. Refused rather than added
  // to: one configuration names one corpus, so a second here would be a second answer to "where
  // is the corpus", and having exactly one answer is why the file moved up in the first place.
  const already = await corpusAt(cwd);
  if (already !== undefined) {
    fail(
      `a corpus is already here, at ${already.dir}/`,
      `${relative(cwd, already.config) || CONFIG_FILE} configures it — delete that file to start over, or run this in another directory`,
    );
  }

  await mkdir(join(root, STATE_DIR), { recursive: true });

  // Written at the top of the repository rather than into the corpus. It is the one file here
  // that is not part of the corpus at all: it is what says where the corpus is.
  await place(cwd, CONFIG_FILE, CONFIG(dir, lang));

  // What was found rather than written, in the order it was met. Reported at the end so the
  // summary reads as one answer rather than as a write interrupted by complaints.
  const kept: string[] = [];
  const put = async (path: string, text: string): Promise<void> => {
    if ((await place(root, path, text)) === 'kept') kept.push(`${dir}/${path}`);
  };



  // Created empty rather than absent. A ledger that appears on first write is a ledger whose
  // absence and whose emptiness look the same, and those mean different things.
  //
  // Placed like everything else, and this is the one that matters most: a corpus whose config
  // was deleted still has its history beside it, and a ledger is the one file here that cannot
  // be written again from anything.
  await put(HISTORY_FILE, '');

  await put(README_FILE, ROOT_README(dir));
  await put(posix.join(STATE_DIR, README_FILE), STATE_README);

  const directories = allDirectories();
  for (const directory of directories) {
    await mkdir(join(root, directory), { recursive: true });
    await put(posix.join(directory, README_FILE), readmeFor(directory));
  }

  const readmes = directories.length + 2 - kept.filter((path) => path.endsWith(README_FILE)).length;

  info(`${green('*')} corpus initialised at ${teal(`${dir}/`)}`);
  info();
  info(`  ${dim('config')}      ${CONFIG_FILE} ${dim(`— names ${dir}/, so no --root is needed`)}`);
  info(`  ${dim('areas')}       ${directories.join(', ')}`);
  info(`  ${dim('readme')}      ${readmes} file(s) — one per directory, saying what belongs in it`);
  info(`  ${dim('knowledge')}   ${dim('empty — nothing is true until a change is published')}`);
  info(`  ${dim('language')}    ${lang}`);
  info(`  ${dim('agents')}      instructions, in the directories agent tools read`);
  info();

  // Named, not counted. A count tells somebody a file of theirs was met and leaves them to find
  // which — and the whole point of keeping it was that they already had something there worth
  // more than the explainer this would have written over it.
  if (kept.length > 0) {
    info(`  ${amber('!')} ${kept.length} file(s) were already here, and were left as they are`);
    for (const path of kept) info(`    ${dim(path)}`);

    // The ledger is named on its own, because the remedy below would destroy it. An explainer
    // is prose nothing reads and is free to replace; a history is the one file in a corpus that
    // cannot be written again from anything else.
    if (kept.includes(`${dir}/${HISTORY_FILE}`)) {
      info(dim('    a corpus was here before this one — its record is kept, and is never deleted'));
    }
    info(dim('    an explainer is prose nothing reads: delete one and run again to get this one'));
    info();
  }

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
