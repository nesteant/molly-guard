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
 * **Run where a corpus already is, it completes rather than refuses.** This is the only command
 * that writes the skeleton, so everything a later version adds to the shape of a corpus reached
 * new corpora only: `<root>/.gitattributes` fixed a real defect and every corpus made before it
 * still had the defect and no remedy, because the command carrying the fix declined to run. The
 * recipe that worked was to move the configuration out of the way so the check found nothing,
 * run this, and put it back — the tool asking its users to defeat the guard that protects them.
 *
 * What is still refused is a **second** `mollyguard.yml`. That file is the one answer to *where
 * is the corpus*, and the refusal was always about the file rather than about the command; it
 * had simply been doing duty as both.
 *
 * **Two places, and only one of them is the corpus.** `mollyguard.yml` goes at the top of the
 * repository and names the directory; the directory holds the areas. That is what lets every
 * other command find the corpus from anywhere inside the repository instead of being told where
 * it is on each invocation.
 */

import { mkdir, readFile } from 'node:fs/promises';
import { join, posix, relative } from 'node:path';
import {
  CONVENTIONS_README,
  ROOT_README,
  STATE_README,
  allDirectories,
  readmeFor,
} from '@mollyguard/core';
import {
  ATTRIBUTES_FILE,
  CONFIG_FILE,
  CONVENTIONS_FILE,
  DEFAULT_ROOT,
  readConfig,
  HISTORY_FILE,
  LEDGER_MERGE,
  README_FILE,
  STATE_DIR,
  corpusAt,
  place,
} from '@mollyguard/store';
import { agentsCommand } from './agents';
import { amber, bold, dim, fail, green, info, teal } from './ui';

const ATTRIBUTES = `# The transition ledger is append-only, and two branches that each advanced a change have
# both appended at the end of it. Without this, that is a conflict on every merge — git cannot
# know that two additions at the same position are both wanted. With it, both lines survive.
#
# Union merge is only ever safe for a file whose lines are independent facts and whose order
# carries no meaning beyond "this happened". That is exactly what this ledger is, and it is why
# nothing else in the corpus gets that treatment: two edits to a specification are a
# disagreement somebody has to resolve, and silently keeping both would be the wrong answer.
#
# The pattern is relative to this file, so it is correct wherever the corpus lives.
${LEDGER_MERGE}
`;

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
# It suits an area read in order: changes are events, and decisions are numbered by convention.
# \`specs\` accepts one too, though a knowledge base is read by topic, and a number is one more
# thing to keep true when a document is renamed to match what it is now about.
#
# naming:
#   changes:   '{ordinal:4}-{slug}'
#   decisions: '{ordinal:4}-{slug}'
`;

export async function initCommand(
  cwd: string,
  asked: string | undefined,
  chosen: string | undefined,
): Promise<number> {
  const already = await corpusAt(cwd);

  // A corpus here and a *different* directory asked for is a request for a second one, and that
  // is what the refusal has always been about: one configuration names one corpus, so a second
  // here would be a second answer to where the corpus is. Asking for the one that exists — or
  // asking for nothing, which is the daily case — is a request to complete it.
  if (already !== undefined && asked !== undefined && asked !== already.dir) {
    fail(
      `a corpus is already here, at ${already.dir}/`,
      `${relative(cwd, already.config) || CONFIG_FILE} configures it — run \`molly init\` with no --root to complete that corpus, or run this in another directory`,
    );
  }

  // Nothing here rewrites a configuration that exists. `--lang` would be a request to change one,
  // and silently ignoring a flag is the failure this tool refuses everywhere else.
  if (already !== undefined && chosen !== undefined) {
    fail(
      `a corpus is already here, at ${already.dir}/`,
      `its language is set in ${relative(cwd, already.config) || CONFIG_FILE} — edit that file; \`molly init\` will not rewrite it`,
    );
  }

  const completing = already !== undefined;
  const dir = already?.dir ?? asked ?? DEFAULT_ROOT;
  const lang = chosen ?? 'en';
  const root = already?.root ?? join(cwd, dir);

  await mkdir(join(root, STATE_DIR), { recursive: true });

  // Written at the top of the repository rather than into the corpus. It is the one file here
  // that is not part of the corpus at all: it is what says where the corpus is — which is why a
  // completing run leaves it exactly as it is, `naming:` policy and all.
  if (!completing) await place(cwd, CONFIG_FILE, CONFIG(dir, lang));

  // What was found rather than written, in the order it was met. Reported at the end so the
  // summary reads as one answer rather than as a write interrupted by complaints.
  const kept: string[] = [];
  const created: string[] = [];
  const put = async (path: string, text: string): Promise<void> => {
    if ((await place(root, path, text)) === 'kept') kept.push(`${dir}/${path}`);
    else created.push(`${dir}/${path}`);
  };



  // Created empty rather than absent. A ledger that appears on first write is a ledger whose
  // absence and whose emptiness look the same, and those mean different things.
  //
  // Placed like everything else, and this is the one that matters most: a corpus whose config
  // was deleted still has its history beside it, and a ledger is the one file here that cannot
  // be written again from anything.
  await put(HISTORY_FILE, '');

  // The ledger is append-only, so two branches that each advanced a change conflict at the end of
  // it without this. Written beside the corpus rather than at the repository root, which keeps it
  // ours and keeps the pattern relative to whatever `root:` says.
  await put(ATTRIBUTES_FILE, ATTRIBUTES);

  await put(README_FILE, ROOT_README(dir));
  await put(posix.join(STATE_DIR, README_FILE), STATE_README);

  // The one file here a project is expected to fill in, and the only reason it is written at all
  // is that four installed skills already point at it. A pointer whose target is absent teaches
  // an agent that the pointer is decorative — and an agent that has learned one instruction is
  // decorative reads the next one the same way. Placed like everything else, so a project that
  // already had a `conventions.md` keeps it and is told.
  await put(CONVENTIONS_FILE, CONVENTIONS_README(dir));

  const directories = allDirectories();
  for (const directory of directories) {
    await mkdir(join(root, directory), { recursive: true });
    await put(posix.join(directory, README_FILE), readmeFor(directory));
  }

  // The two runs must not print the same thing. One made a corpus; the other found one and added
  // what this version writes and it did not have — and somebody reading the second needs to know
  // which files are new, because everything else was theirs already.
  if (completing) {
    const declared = (await readConfig(already.config)).lang;
    info(`${green('*')} corpus completed at ${teal(`${dir}/`)}`);
    info();
    info(
      `  ${dim('config')}      ${relative(cwd, already.config) || CONFIG_FILE} ${dim('— left exactly as it is')}`,
    );
    info(`  ${dim('added')}       ${created.length === 0 ? dim('nothing — it already had everything this version writes') : created.length + ' file(s)'}`);
    for (const path of created) info(`    ${green('+')} ${path}`);
    info(`  ${dim('kept')}        ${kept.length} file(s) — everything that was already there`);
    if (declared !== undefined) info(`  ${dim('language')}    ${declared} ${dim('— from the configuration, not from this run')}`);
    info(`  ${dim('agents')}      instructions, reinstalled`);
    info();
  } else {
    const readmes = directories.length + 2 - kept.filter((path) => path.endsWith(README_FILE)).length;

    info(`${green('*')} corpus initialised at ${teal(`${dir}/`)}`);
    info();
    info(`  ${dim('config')}      ${CONFIG_FILE} ${dim(`— names ${dir}/, so no --root is needed`)}`);
    info(`  ${dim('areas')}       ${directories.join(', ')}`);
    info(`  ${dim('readme')}      ${readmes} file(s) — one per directory, saying what belongs in it`);
    info(`  ${dim('knowledge')}   ${dim('empty — nothing is true until a change is published')}`);
    info(`  ${dim('yours')}       ${CONVENTIONS_FILE} ${dim('— this project\'s own rules, empty and pointed at by every skill')}`);
    info(`  ${dim('language')}    ${lang}`);
    info(`  ${dim('agents')}      instructions, in the directories agent tools read`);
    info();
  }

  // Named, not counted. A count tells somebody a file of theirs was met and leaves them to find
  // which — and the whole point of keeping it was that they already had something there worth
  // more than the explainer this would have written over it.
  // A `.gitattributes` somebody else wrote is theirs, and is left byte-identical. But a corpus
  // whose ledger has no union merge will conflict on the first parallel branch, so the missing
  // line is named rather than added — the same posture `molly agents --check` takes. It does not
  // fail: a corpus that will conflict later is not a failed initialisation.
  let unmerged = false;
  if (kept.includes(`${dir}/${ATTRIBUTES_FILE}`)) {
    const existing = await readFile(join(root, ATTRIBUTES_FILE), 'utf8').catch(() => '');
    unmerged = !existing.includes(LEDGER_MERGE);
  }

  if (kept.length > 0 && !completing) {
    info(`  ${amber('!')} ${kept.length} file(s) were already here, and were left as they are`);
    for (const path of kept) info(`    ${dim(path)}`);

    // The ledger is named on its own, because the remedy below would destroy it. An explainer
    // is prose nothing reads and is free to replace; a history is the one file in a corpus that
    // cannot be written again from anything else.
    if (unmerged) {
      info(dim(`    ${ATTRIBUTES_FILE} is yours — add this line, or the ledger conflicts on the first parallel branch:`));
      info(dim(`      ${LEDGER_MERGE}`));
    }
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
  info(
    completing
      ? `Next: ${bold('molly status')} — it says what this corpus holds and what disagrees.`
      : `Next: ${bold('molly change new "<title>"')} — nothing enters the base any other way.`,
  );
  return 0;
}
