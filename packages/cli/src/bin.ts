#!/usr/bin/env node
/**
 * `molly`
 *
 * Exit codes are the contract: `0` clean, `1` a refusal, `2` a defect in the tool. That is
 * the whole integration surface — enough to use as a git hook or a CI step with no glue, and
 * the third code keeps a crash distinguishable from a refusal in a build log.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { agentsCommand } from './agents';
import { newCapabilityCommand } from './capability';
import { newChangeCommand } from './change';
import { initCommand } from './init';
import { moveCommand } from './move';
import { publishCommand } from './publish';
import { newRoadmapCommand } from './roadmap';
import { statusCommand } from './status';
import { Corpus, locateCorpus, readConfig } from '@mollyguard/store';
import { bold, dim, fail, info, teal, warn } from './ui';

interface Args {
  readonly command: string;
  readonly positional: readonly string[];
  readonly flags: ReadonlyMap<string, string | true>;
  /** argv as given. Kept so a repeatable flag can be collected rather than overwritten. */
  readonly raw: readonly string[];
}

/**
 * Flags that take no value.
 *
 * Without this the parser gives any flag the next non-flag token, so `molly publish --dry-run
 * <change>` swallows the change as the flag's value and the command then refuses for having no
 * change — naming the argument the caller just typed. A word order that silently changes what
 * was meant is worse than one that is refused.
 */
const BOOLEAN: ReadonlySet<string> = new Set(['dry-run', 'check', 'help', 'version', 'json']);

/**
 * The commands that do not act on a corpus, and so are not refused for standing outside one.
 *
 * `agents` writes the instructions agent tools read, in the directories those tools look in —
 * outside the corpus by design, and deliberately holding nothing from it, so it works in a
 * repository that has not been initialised yet. `init` is not here because it is handled before
 * this, being the one that *creates* one.
 *
 * **Two kinds of file are written outside a corpus, and there is no third.** The one that says
 * where the corpus is, and the `molly`-namespaced skills and commands that teach an agent to use
 * it. Both are this tool's own, both are named by a table, and both can be deleted without
 * surgery on anything of somebody else's.
 *
 * So a command arriving here is answering a larger question than where it may run. `.git/hooks`,
 * a settings file, a lockfile, a CI definition — each is a file this tool does not own, each was
 * defensible on its own, and the sum of enough of them is a tool nobody can predict the reach of.
 * The tool ships checks and integrates through exit codes; the plumbing that runs them belongs to
 * whatever already manages plumbing in that repository.
 *
 * A set rather than a chain of comparisons, because the next command added has to answer this
 * question somewhere, and a list is a place to answer it.
 */
const OUTSIDE: ReadonlySet<string> = new Set(['agents']);

/**
 * Every command, and everything the dispatcher and the reader both need to know about it.
 *
 * One table because three questions have one answer. *What may I type* is the listing. *Is this
 * flag real* is the refusal below. *What does this command do* is `molly <command> --help`. Kept
 * apart, they were two tables and a gap: `molly publish --help` printed the listing, because the
 * only per-command knowledge the dispatcher had was a flag array with no words in it.
 *
 * **An unrecognised flag is refused by name**, and that is what this table was originally for.
 * A flag parsed, stored and never read is the same behaviour as not having typed it — tolerable
 * for a listing and unacceptable for a write: `molly publish <change> --dryrun`, one hyphen short
 * of the flag that exists, published for real, archived the bundle and recorded it, because the
 * misspelling landed in the map under a key nothing looks up. A safety flag that silently does
 * nothing is worse than no safety flag, since the caller has been told what they asked for and
 * believes it.
 *
 * **`refuses` is the one field that can drift**, since a command's refusals cannot be read off
 * its source. So it names them rather than describing them, and the harness provokes each one:
 * a line here about a refusal that was removed fails the build rather than becoming a false
 * statement about the tool.
 *
 * Keyed by command rather than by command-and-verb. `molly change new` and a later `molly change
 * <something else>` would take the same flags or the verb would be a different command.
 */
interface Command {
  /** How it is typed. The listing renders this column. */
  readonly usage: string;
  /** What it does, in one line. */
  readonly summary: string;
  /** Flags it takes beyond the global ones. */
  readonly flags: readonly string[];
  /** What it declines to do, one line each, named rather than described. */
  readonly refuses?: readonly string[];
  /** Out of the listing, still a command. `--version` is a flag people type, not a verb to teach. */
  readonly hidden?: boolean;
}

const COMMANDS: Readonly<Record<string, Command>> = {
  init: {
    usage: 'molly init [--lang <tag>]',
    summary: 'scaffold a corpus: every area, each explaining itself',
    flags: ['lang'],
    refuses: [
      'a second corpus where one is already configured, naming the file that configures it',
      '--lang where a corpus exists, because its language is in a file this run leaves alone',
    ],
  },
  capability: {
    usage: 'molly capability new "<title>"',
    summary: 'a grouping: what the product is responsible for',
    flags: ['name', 'lang'],
    refuses: ['a title that no name can be derived from without losing part of it'],
  },
  change: {
    usage: 'molly change new "<title>"',
    summary: 'the four documents one change is made of',
    flags: ['name', 'kind', 'capability', 'realises', 'alters', 'lang'],
    refuses: [
      'a title that no name can be derived from without losing part of it',
      '--capability naming a capability that does not exist',
      '--realises naming a roadmap entry that does not exist',
    ],
  },
  roadmap: {
    usage: 'molly roadmap new "<title>"',
    summary: 'a slice of planned work: its features, in order',
    flags: ['name', 'lang'],
    refuses: ['a title that no name can be derived from without losing part of it'],
  },
  move: {
    usage: 'molly move [<change>] [<state>]',
    summary: 'one edge of the lifecycle or several, forwards or back',
    flags: [],
    refuses: [
      'a state that is not one of the eight',
      'published, which is reached by publishing rather than by recording',
      'a change whose `state:` disagrees with the ledger',
    ],
  },
  publish: {
    usage: 'molly publish [<change>]',
    summary: 'file its documents into the knowledge base',
    flags: ['dry-run'],
    refuses: [
      'a change whose `state:` disagrees with the ledger',
      'a publish/ folder that is absent, empty, or holds a document it cannot read',
      'a document whose name this corpus\'s naming policy would not have minted',
      'a new document in a grouped area that is filed under no capability',
      'a payload byte-identical to what the knowledge base already holds',
    ],
  },
  status: {
    usage: 'molly status [--json]',
    summary: 'every change, and where it is; --json for a reader that is not a person',
    flags: ['json'],
  },
  agents: {
    usage: 'molly agents [--tools <list>]',
    summary: 'the skills an agent reads; --check verifies them',
    flags: ['tools', 'check'],
  },
  // Listed although it is what is being read. Every command named in a generated README, skill
  // or command file must appear here — a name missing from this list is one the harness reports
  // as not being a command, and that check is only worth having if it is complete.
  help: {
    usage: 'molly help',
    summary: 'this',
    flags: [],
  },
  version: {
    usage: 'molly version',
    summary: 'which build is on the PATH',
    flags: [],
    hidden: true,
  },
};

/** Taken everywhere, so no command has to list them. */
const GLOBAL: readonly string[] = ['root', 'help', 'version'];

/**
 * What a name that is not a command gets, from all three places that can meet one.
 *
 * The dispatcher meets it before locating a corpus, the switch meets it after, and `--help` meets
 * it when asked about something that does not exist. One function because they are one answer:
 * three copies of a sentence are three chances for a caller to see two different ones for the
 * same mistake, and the wording is what tells somebody they have a typo rather than a corpus
 * problem.
 */
function unknown(name: string): number {
  warn(`unknown command "${name}" — run \`molly help\``);
  return 1;
}

/** Refuses a flag the command does not take, naming the ones it does. */
function checkFlags(args: Args): void {
  const known = COMMANDS[args.command];
  // An unknown *command* is reported by the switch below, with its own better message. Checking
  // flags first would answer a question nobody asked.
  if (known === undefined) return;

  const takes = [...known.flags, ...GLOBAL];
  const allowed = new Set(takes);
  for (const name of args.flags.keys()) {
    if (allowed.has(name)) continue;
    fail(
      `molly ${args.command} does not take --${name}`,
      `it takes: ${takes.map((f) => `--${f}`).join(', ')}`,
    );
  }
}

function parseArgs(argv: readonly string[]): Args {
  const positional: string[] = [];
  const flags = new Map<string, string | true>();

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === undefined) continue;

    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const body = token.slice(2);
    const eq = body.indexOf('=');
    if (eq !== -1) {
      flags.set(body.slice(0, eq), body.slice(eq + 1));
      continue;
    }
    const next = argv[i + 1];
    if (!BOOLEAN.has(body) && next !== undefined && !next.startsWith('--')) {
      flags.set(body, next);
      i++;
    } else {
      flags.set(body, true);
    }
  }

  return { command: positional[0] ?? 'help', positional: positional.slice(1), flags, raw: argv };
}

function flag(args: Args, name: string): string | undefined {
  const value = args.flags.get(name);
  return typeof value === 'string' ? value : undefined;
}

/** The line every help output ends on. The exit codes are the integration surface. */
const CODES = '  exit 0 clean · 1 a refusal · 2 a defect in the tool';

function help(): number {
  info(`${bold('MollyGuard')} ${dim('— your specification guardian')}`);
  info();
  info(dim('  The unit of work is a change. The knowledge base is what changes publish into.'));
  info(dim('  The prose is the specification, and nothing reads it.'));
  info();
  // In the table's order, which is therefore the order somebody reads the commands in — roughly
  // the order a corpus is used. Reordering the table reorders this, which is the intent: a
  // listing sorted alphabetically would open on `agents`, the one command that is not about a
  // corpus at all.
  for (const command of Object.values(COMMANDS)) {
    if (command.hidden === true) continue;
    info(`  ${teal(command.usage.padEnd(32))} ${command.summary}`);
  }
  info();
  info(dim(CODES));
  return 0;
}

/**
 * `molly <command> --help` — what that command takes and what it refuses.
 *
 * Answered from the same table the listing and the flag check read, so a command cannot describe
 * itself into disagreement with what it accepts. A name that is not a command falls through to
 * the message a typo deserves rather than to an empty entry.
 *
 * Hidden commands answer here. `version` is out of the listing because it is a flag people type
 * rather than a verb worth teaching, which is not a reason to deny that it exists when asked.
 */
function helpFor(name: string): number {
  const command = COMMANDS[name];
  if (command === undefined) return unknown(name);

  info(`  ${teal(command.usage)}`);
  info(`  ${dim(command.summary)}`);
  info();
  info(`  ${dim('takes')}  ${[...command.flags, ...GLOBAL].map((f) => `--${f}`).join(', ')}`);
  if (command.refuses !== undefined) {
    info();
    info(`  ${dim('refuses')}`);
    for (const line of command.refuses) info(`    ${line}`);
  }
  info();
  info(dim(CODES));
  return 0;
}

/**
 * The installed version, read from the package rather than compiled in.
 *
 * A version baked into the source is a version somebody forgets to bump, and the point of
 * asking is to find out which build is on the PATH — an answer that can disagree with the
 * package it came from is worse than no answer.
 */
function version(): string {
  try {
    const pkg = readFileSync(join(__dirname, '..', 'package.json'), 'utf8');
    return (JSON.parse(pkg) as { version?: string }).version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/** `molly change <verb>` — grouped because they all operate on one bundle. */
async function change(corpus: Corpus, args: Args): Promise<number> {
  const verb = args.positional[0];
  if (verb !== 'new') {
    warn('molly change new "<title>"');
    return 1;
  }

  // Repeatable: `--alters specs/a --alters specs/b`. The parser keeps the last value for a
  // repeated flag, so these are collected here rather than read off the map.
  const alters: string[] = [];
  for (let i = 0; i < args.raw.length; i++) {
    if (args.raw[i] !== '--alters') continue;
    const value = args.raw[i + 1];
    if (value !== undefined && !value.startsWith('--')) alters.push(value);
  }

  return newChangeCommand(corpus, {
    title: args.positional.slice(1).join(' '),
    name: flag(args, 'name'),
    kind: flag(args, 'kind'),
    capability: flag(args, 'capability'),
    realises: flag(args, 'realises'),
    alters,
    lang: flag(args, 'lang'),
    at: new Date().toISOString(),
  });
}

/** `molly roadmap <verb>` — the planned stage, which is a document and no lifecycle. */
async function roadmap(corpus: Corpus, args: Args): Promise<number> {
  const verb = args.positional[0];
  if (verb !== 'new') {
    warn('molly roadmap new "<title>"');
    return 1;
  }

  return newRoadmapCommand(corpus, {
    title: args.positional.slice(1).join(' '),
    name: flag(args, 'name'),
    lang: flag(args, 'lang'),
  });
}

/** `molly capability <verb>` — grouped like `molly change`, though there is one verb so far. */
async function capability(corpus: Corpus, args: Args): Promise<number> {
  const verb = args.positional[0];
  if (verb !== 'new') {
    warn('molly capability new "<title>"');
    return 1;
  }

  return newCapabilityCommand(corpus, {
    title: args.positional.slice(1).join(' '),
    name: flag(args, 'name'),
    lang: flag(args, 'lang'),
  });
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // Answered before anything is located or loaded. "Which build is this" is the question
  // asked when the corpus is missing or broken, so it must not need one.
  if (args.command === 'version' || args.flags.has('version')) {
    info(version());
    process.exit(0);
  }
  // `molly help` is the listing; `molly help <command>` and `molly <command> --help` are one
  // command. Answered here, before `checkFlags` and before the corpus is located, because a
  // caller asking what a command needs is exactly the caller who has not set one up yet — and
  // because refusing a flag on the command that exists to list the flags answers nothing.
  if (args.command === 'help' || args.flags.has('help')) {
    const named = args.command === 'help' ? args.positional[0] : args.command;
    process.exit(named === undefined || named === 'help' ? help() : helpFor(named));
  }

  // Before anything is located, read or written. A flag that is going to be refused must be
  // refused while refusing is still free — after a write it is only an apology.
  checkFlags(args);

  // Before anything is located. An unknown command has its own better message below, and
  // answering "no corpus here" to `molly frobnicate` answers a question nobody asked — the same
  // argument `checkFlags` makes about refusing a flag before naming an unknown command.
  if (COMMANDS[args.command] === undefined) process.exit(unknown(args.command));

  const given = flag(args, 'root');

  // `init` creates rather than finds, so it is the one command that does not look for a corpus —
  // it is handed the working directory and the name of the directory to make.
  if (args.command === 'init') {
    // `--root` is passed as given rather than defaulted, because init has to tell *complete the
    // corpus that is here* from *make a second one*, and only the caller's silence says which.
    process.exit(await initCommand(process.cwd(), given, flag(args, 'lang')));
  }

  // Found once, here, rather than by seven commands each repeating the same guard with the same
  // message.
  const corpus = OUTSIDE.has(args.command) ? undefined : await locateCorpus(process.cwd(), given);
  if (corpus === undefined && !OUTSIDE.has(args.command)) {
    fail(
      'no corpus here',
      `nothing names one in ${process.cwd()} or above it — run \`molly init\`, or pass --root <dir>`,
    );
  }
  const found = corpus as Corpus;

  // Read once, here, and refused before any command runs. A configuration that will not parse
  // used to degrade silently into the old layout — `root:` could not be read, so the corpus was
  // taken to be the directory holding the file, and `molly status` reported an empty corpus and
  // exited 0 while the real one sat untouched beside it. Reporting success over something it
  // never looked at is the one failure this tool exists to prevent.
  if (found !== undefined) {
    const problems = (await readConfig(found.config)).problems;
    if (problems.length > 0) {
      fail(problems[0] as string, `fix ${found.config}, or delete it and run \`molly init\``);
    }
  }

  switch (args.command) {

    case 'capability':
      process.exit(await capability(found, args));
      break;

    case 'change':
      process.exit(await change(found, args));
      break;

    case 'roadmap':
      process.exit(await roadmap(found, args));
      break;

    case 'move':
      process.exit(
        await moveCommand(found, {
          change: args.positional[0],
          to: args.positional[1],
          // The clock is read here and nowhere deeper. Core is handed the timestamp, so the
          // same events fold the same way in a test as they do at a terminal.
          at: new Date().toISOString(),
        }),
      );
      break;

    case 'publish':
      process.exit(
        await publishCommand(found, {
          change: args.positional[0],
          dryRun: args.flags.has('dry-run'),
          at: new Date().toISOString(),
        }),
      );
      break;

    case 'agents':
      process.exit(
        await agentsCommand(process.cwd(), {
          tools: flag(args, 'tools'),
          check: args.flags.has('check'),
        }),
      );
      break;

    case 'status':
      process.exit(await statusCommand(found, { json: args.flags.has('json') }));
      break;

    default:
      process.exit(unknown(args.command));
  }
}

main().catch((cause: unknown) => {
  // An unexpected throw is a defect, not a refusal, and must not be mistaken for one:
  // exit 2 keeps it distinguishable from a refusal in a build log.
  process.stderr.write(`${(cause as Error).stack ?? String(cause)}\n`);
  process.exit(2);
});
