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
import { initCommand } from './init';
import { DEFAULT_ROOT } from '@mollyguard/store';
import { bold, dim, info, teal, warn } from './ui';

interface Args {
  readonly command: string;
  readonly positional: readonly string[];
  readonly flags: ReadonlyMap<string, string | true>;
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
    if (next !== undefined && !next.startsWith('--')) {
      flags.set(body, next);
      i++;
    } else {
      flags.set(body, true);
    }
  }

  return { command: positional[0] ?? 'help', positional: positional.slice(1), flags };
}

function flag(args: Args, name: string): string | undefined {
  const value = args.flags.get(name);
  return typeof value === 'string' ? value : undefined;
}

const HELP: readonly (readonly [string, string])[] = [
  ['molly init [--lang <tag>]', 'scaffold a corpus: every area, each explaining itself'],
];

function help(): number {
  info(`${bold('MollyGuard')} ${dim('— your specification guardian')}`);
  info();
  info(dim('  The unit of work is a change. The knowledge base is what changes merge into.'));
  info(dim('  The prose is the specification, and nothing reads it.'));
  info();
  for (const [usage, summary] of HELP) info(`  ${teal(usage.padEnd(30))} ${summary}`);
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

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // Answered before anything is located or loaded. "Which build is this" is the question
  // asked when the corpus is missing or broken, so it must not need one.
  if (args.command === 'version' || args.flags.has('version')) {
    info(version());
    process.exit(0);
  }
  if (args.command === 'help' || args.flags.has('help')) process.exit(help());

  const dir = flag(args, 'root') ?? DEFAULT_ROOT;

  switch (args.command) {
    case 'init':
      process.exit(await initCommand(join(process.cwd(), dir), dir, flag(args, 'lang') ?? 'en'));
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
