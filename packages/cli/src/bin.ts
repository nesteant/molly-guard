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
import { Corpus, DEFAULT_ROOT, locateCorpus, readConfig } from '@mollyguard/store';
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

/** Taken everywhere, so no command has to list them. */
const GLOBAL: readonly string[] = ['root', 'help', 'version'];

/**
 * Every flag each command takes, and the reason this table exists at all.
 *
 * An unrecognised flag used to be parsed, stored and never read, which is the same behaviour as
 * not having typed it. That is tolerable for a listing and unacceptable for a write: `molly
 * publish <change> --dryrun` — one hyphen short of the flag that exists — published for real,
 * archived the bundle and recorded it, because the misspelling landed in the map under a key
 * nothing looks up. A safety flag that silently does nothing is worse than no safety flag,
 * since the caller has been told what they asked for and believes it.
 *
 * So an unknown flag is refused by name. It is the same argument the parser already makes about
 * word order above: a command that quietly does something other than what was typed cannot be
 * automated against, because the only way to discover the difference is the damage — and for
 * the one flag whose whole purpose is to prevent a write, the damage is the write.
 *
 * Keyed by command rather than by command-and-verb. `molly change new` and a later `molly change
 * <something else>` would take the same flags or the verb would be a different command.
 */
const FLAGS: Readonly<Record<string, readonly string[]>> = {
  init: ['lang'],
  capability: ['name', 'lang'],
  change: ['name', 'kind', 'capability', 'realises', 'alters', 'lang'],
  move: [],
  publish: ['dry-run'],
  status: ['json'],
  roadmap: ['name', 'lang'],
  agents: ['tools', 'check'],
  version: [],
  help: [],
};

/** Refuses a flag the command does not take, naming the ones it does. */
function checkFlags(args: Args): void {
  const known = FLAGS[args.command];
  // An unknown *command* is reported by the switch below, with its own better message. Checking
  // flags first would answer a question nobody asked.
  if (known === undefined) return;

  const takes = [...known, ...GLOBAL];
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

const HELP: readonly (readonly [string, string])[] = [
  ['molly init [--lang <tag>]', 'scaffold a corpus: every area, each explaining itself'],
  ['molly capability new "<title>"', 'a grouping: what the product is responsible for'],
  ['molly change new "<title>"', 'the four documents one change is made of'],
  ['molly roadmap new "<title>"', 'a slice of planned work: its features, in order'],
  ['molly move [<change>] [<state>]', 'one edge of the lifecycle, forwards or back'],
  ['molly publish [<change>]', 'file its documents into the knowledge base'],
  ['molly status [--json]', 'every change, and where it is; --json for a reader that is not a person'],
  ['molly agents [--tools <list>]', 'the skills an agent reads; --check verifies them'],
  // Listed although it is what is being read. Every command named in a generated README, skill
  // or command file must appear here — a name missing from this list is one the harness reports
  // as not being a command, and that check is only worth having if it is complete.
  ['molly help', 'this'],
];

function help(): number {
  info(`${bold('MollyGuard')} ${dim('— your specification guardian')}`);
  info();
  info(dim('  The unit of work is a change. The knowledge base is what changes publish into.'));
  info(dim('  The prose is the specification, and nothing reads it.'));
  info();
  for (const [usage, summary] of HELP) info(`  ${teal(usage.padEnd(32))} ${summary}`);
  info();
  info(dim('  exit 0 clean · 1 a refusal · 2 a defect in the tool'));
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
  if (args.command === 'help' || args.flags.has('help')) process.exit(help());

  // Before anything is located, read or written. A flag that is going to be refused must be
  // refused while refusing is still free — after a write it is only an apology.
  checkFlags(args);

  // Before anything is located. An unknown command has its own better message below, and
  // answering "no corpus here" to `molly frobnicate` answers a question nobody asked — the same
  // argument `checkFlags` makes about refusing a flag before naming an unknown command.
  if (FLAGS[args.command] === undefined) {
    warn(`unknown command "${args.command}" — run \`molly help\``);
    process.exit(1);
  }

  const given = flag(args, 'root');

  // `init` creates rather than finds, so it is the one command that does not look for a corpus —
  // it is handed the working directory and the name of the directory to make.
  if (args.command === 'init') {
    process.exit(await initCommand(process.cwd(), given ?? DEFAULT_ROOT, flag(args, 'lang')));
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
      warn(`unknown command "${args.command}" — run \`molly help\``);
      process.exit(1);
  }
}

main().catch((cause: unknown) => {
  // An unexpected throw is a defect, not a refusal, and must not be mistaken for one:
  // exit 2 keeps it distinguishable from a refusal in a build log.
  process.stderr.write(`${(cause as Error).stack ?? String(cause)}\n`);
  process.exit(2);
});
