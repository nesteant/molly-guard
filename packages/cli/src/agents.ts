/**
 * `molly agents [--tools <list>] [--check]`
 *
 * Installs the instructions an agent needs, in the directories agents already read. Nothing is
 * written into `AGENTS.md`, `CLAUDE.md`, or any other file a project owns: a root instruction
 * file is always-on context for a workflow that is a fraction of what happens in a repository,
 * and a namespaced skill directory can be removed without surgery on somebody's prose.
 *
 * Everything written is a skill in the Agent Skills format, which is what makes one installation
 * serve every major tool rather than one. The table says which, and the run says so out loud —
 * "does this work with Codex" is a question an install should answer without being asked twice.
 *
 * Nothing here reads the corpus. The skills say *where* the decisions, the capabilities and the
 * language live and never what they say, which is what makes this an upgrade-time command:
 * publishing a change cannot make it stale, so nobody has to remember to re-run it.
 *
 * **One exception, and it is about what was just written rather than about the corpus.** The
 * skills point at `<root>/conventions.md`, and a corpus made before that file existed has no
 * such target — `init` writes it and `init` is the one command an existing corpus cannot run.
 * So this looks for one, best-effort, and names the file if it is missing. It reads nothing from
 * the corpus but whether a single path exists, it never refuses, and it says nothing at all when
 * there is no corpus to ask: this command has to work in a repository nobody has initialised,
 * which is the moment somebody most needs the instructions.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  PERMISSIONS,
  SKILLS,
  Tool,
  TOOLS,
  defaultTools,
  invocation,
  readers,
  scaffoldFor,
  tool,
} from '@mollyguard/core';
import { CONVENTIONS_FILE, checkScaffold, locateCorpus, writeScaffold } from '@mollyguard/store';
import { amber, bold, dim, fail, green, info, teal } from './ui';

export interface AgentsOptions {
  /** Comma-separated ids, or undefined for the tools every corpus gets. */
  readonly tools?: string | undefined;
  /** Report what is absent or different, write nothing, and fail if anything is. */
  readonly check: boolean;
}

export async function agentsCommand(root: string, options: AgentsOptions): Promise<number> {
  const chosen = requireTools(options.tools);
  const files = scaffoldFor(chosen);

  if (options.check) {
    const stale = await checkScaffold(root, files);
    if (stale.length === 0) {
      info(`${green('*')} agent instructions are current ${dim(`(${chosen.map((t) => t.id).join(', ')})`)}`);
      return 0;
    }
    // Reported and not repaired. A check that fixed what it found would be an install, and
    // nobody would be able to tell afterwards which of the two they had run.
    info(`${amber('!')} ${stale.length} file(s) are missing or out of date`);
    for (const file of stale) info(`    ${dim(`${file.outcome === 'created' ? 'missing' : 'differs'}  ${file.path}`)}`);
    info(dim('    run `molly agents` to reinstall them'));
    return 1;
  }

  const placed = await writeScaffold(root, files);
  const written = placed.filter((file) => file.outcome !== 'current');

  info(`${green('*')} agent instructions ${dim(`(${chosen.map((t) => t.id).join(', ')})`)}`);
  info();
  for (const file of placed) {
    const mark = file.outcome === 'created' ? green('+') : file.outcome === 'replaced' ? bold('~') : dim('=');
    info(`  ${mark} ${file.path}`);
  }

  info();
  info(dim(`  ${written.length === 0 ? 'already current' : `${written.length} file(s) written`}`));
  // Who each directory just served. One file is read by ten tools, and an install that left
  // that to be discovered is one people re-run per tool, or doubt. Only where it is more than
  // one: naming the single tool a directory belongs to says nothing its path did not.
  for (const directory of new Set(chosen.map((t) => t.skills))) {
    const served = readers(directory);
    if (served.length < 2) continue;
    info(dim(`  ${directory} — read by ${served.map((t) => t.title).join(', ')}`));
  }
  info(dim('  The skills name where truth lives; they hold no decision, capability or language.'));

  // Said once, here, and never as a finding in `molly status`: a project with no conventions is
  // not a corpus with a problem, and a listing that nags about an optional file teaches people
  // to read past its findings. This is the moment the sentence is actionable, because it is the
  // moment the pointer was installed.
  const corpus = await locateCorpus(root, undefined);
  if (corpus !== undefined && !existsSync(join(corpus.root, CONVENTIONS_FILE))) {
    info();
    info(
      `  ${amber('!')} ${corpus.dir}/${CONVENTIONS_FILE} ${dim('is not there, and these skills point at it')}`,
    );
    info(dim(`    it is where this project's own rules go, and they win over the skills'`));
    info(dim('    run `molly init` to write the empty one, or write it yourself'));
  }

  // What can now be typed. A command file is invisible until somebody guesses its name, and the
  // name is not something they can reason their way to: the same four commands are `/molly:new`
  // in one palette and `/molly-new` in the next, because the tool decides that and not us.
  // Grouped by spelling rather than listed per tool — the second form is a screen of repetition
  // whose one interesting bit, that these two tools differ, is the thing it buries.
  const spellings = new Map<string, string[]>();
  for (const t of chosen) {
    const commands = t.commands;
    if (commands === undefined) continue;
    const line = SKILLS.map((skill) => invocation(commands, skill)).join('  ');
    spellings.set(line, [...(spellings.get(line) ?? []), t.title]);
  }
  if (spellings.size > 0) {
    info();
    for (const [line, titles] of spellings) {
      info(`  ${line}`);
      info(dim(`    typed in ${titles.join(', ')}`));
    }
  }

  // Named, never written. This used to merge the grants into the file itself, carefully — and
  // careful was not the point. A settings file decides what runs without being asked; its
  // contents are somebody's judgement about risk, and a tool that writes itself into one has
  // approved itself in the place that exists to approve it. Ten seconds of pasting is the whole
  // cost, and the person has read what they granted.
  //
  // Printed whether or not it is already there. Reading the file to find out would put the tool
  // back to inspecting a configuration it has no business in, to save a line.
  const settings = chosen.filter((t) => t.settings !== undefined);
  if (settings.length > 0) {
    info();
    info(dim('  to run the molly commands without a prompt each time, add these yourself:'));
    for (const t of settings) info(`    ${teal(t.settings ?? '')} ${dim(`— permissions.allow: ${PERMISSIONS.join(', ')}`)}`);
  }
  return 0;
}

/**
 * The tools to install for.
 *
 * The default is every directory in the table rather than every row — four of them, because a
 * corpus arriving with instructions one model can read and another cannot is one whose second
 * reader finds nothing. The rest of the table is there so naming a tool works: somebody on
 * Cursor should be able to ask for Cursor and be told where it reads, rather than guess.
 *
 * An unknown id is refused by name rather than skipped: a typo that silently installed less than
 * asked for is a session that behaves differently for no visible reason.
 */
function requireTools(given: string | undefined): readonly Tool[] {
  if (given === undefined) return defaultTools();

  const wanted = given
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '');
  if (wanted.length === 0) fail('--tools <list>', `one or more of: ${TOOLS.map((t) => t.id).join(', ')}`);

  // Deduplicated: naming one tool twice is one tool, and a run that authorised the same
  // settings file twice would report a write nobody asked for.
  return [...new Set(wanted)].map((id) => {
    const found = tool(id);
    if (found) return found;
    fail(`"${id}" is not a tool this installs for`, `one of: ${TOOLS.map((t) => t.id).join(', ')}`);
  });
}
