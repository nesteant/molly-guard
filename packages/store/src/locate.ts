/**
 * Finding the corpus.
 *
 * **The configuration sits at the top of the repository and names the directory the corpus is
 * in.** It used to sit *inside* that directory, which made `mollyguard.yml` both the marker and
 * the contents — and cost every command a `--root` flag. A corpus at `kb/` meant typing
 * `--root kb` on every invocation for ever, and standing one directory down meant nothing worked
 * at all, because there was no searching: the tool looked at `docs/` under the working directory
 * and nowhere else.
 *
 * So a corpus is now located the way every other repository tool locates its project — walk up
 * until the configuration appears. `molly status` works from anywhere inside the repository, and
 * the flag becomes what a flag should be: the odd case, not the daily one.
 *
 * **Both layouts are read.** A configuration with no `root:` is the old shape, where the file
 * lived in the corpus, and the corpus is the directory holding it. Nothing has to be migrated for
 * a corpus written before this, and a repository that never migrates never notices — the rule is
 * one line and it is not a deprecation.
 */

import { existsSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { readConfig } from './config';
import { CONFIG_FILE, DEFAULT_ROOT } from './layout';

export interface Corpus {
  /** Absolute path of the corpus directory: where the areas are. */
  readonly root: string;
  /** How it is named in a message — relative to where the command was run, e.g. `docs`. */
  readonly dir: string;
  /** Absolute path of `mollyguard.yml`, which is not necessarily inside `root`. */
  readonly config: string;
}

/**
 * The corpus a command should act on, or undefined where there is none.
 *
 * `given` is `--root <dir>`, and it names the corpus directory rather than the configuration —
 * so it keeps working for a corpus in the old layout, and skips the search entirely.
 */
export async function locateCorpus(cwd: string, given?: string): Promise<Corpus | undefined> {
  if (given !== undefined) {
    const root = isAbsolute(given) ? given : resolve(cwd, given);
    // Inside the corpus is the old layout, and it wins here: somebody who passed `--root kb`
    // meant that directory, and its own configuration is the one describing it.
    const inside = join(root, CONFIG_FILE);
    const config = existsSync(inside) ? inside : join(cwd, CONFIG_FILE);
    const declared = existsSync(config) ? (await readConfig(config)).root : undefined;
    return { root, dir: name(declared, root), config };
  }

  for (let at = resolve(cwd); ; at = dirname(at)) {
    const found = await corpusAt(at);
    if (found !== undefined) return found;
    if (dirname(at) === at) return undefined;
  }
}

/**
 * The corpus configured at exactly one directory, in either layout — no searching upward.
 *
 * What `init` asks, and the difference matters: a repository may hold a corpus at its top and
 * another in a package below it, and asking the wider question would refuse the second for the
 * existence of the first. Discovery walks up, so the nearest configuration wins, which is the
 * right answer for a nested one. What must not happen twice is *in one directory*, because one
 * configuration names one corpus.
 */
export async function corpusAt(at: string): Promise<Corpus | undefined> {
  const config = join(at, CONFIG_FILE);
  if (existsSync(config)) {
    // `root:` is what distinguishes the layouts. With it the file is a pointer at the top of a
    // repository; without it the file is the marker and the corpus is the directory holding it.
    const declared = (await readConfig(config)).root;
    const root = declared === undefined ? at : resolve(at, declared);
    return { root, dir: name(declared, root), config };
  }

  // The old default, which the search above cannot reach: it lies *below* the working directory
  // rather than above it, so a repository that never migrated would otherwise stop being found
  // from its own root — the one place everybody runs commands from.
  const legacy = join(at, DEFAULT_ROOT, CONFIG_FILE);
  if (existsSync(legacy)) {
    return { root: join(at, DEFAULT_ROOT), dir: DEFAULT_ROOT, config: legacy };
  }

  return undefined;
}

/**
 * What to call the corpus in a message.
 *
 * The name it has in the repository — `docs` — and never a path computed from where the command
 * happened to be run. Those differ the moment somebody is standing in a subdirectory, and a tool
 * that calls the same corpus `docs` from one shell and `../../../docs` from another is a tool
 * whose output cannot be pasted anywhere or compared with anything.
 *
 * It matches how the rest of the corpus is addressed, too: a document is `specs/invoicing`
 * wherever you are, because the path is the id.
 */
function name(declared: string | undefined, root: string): string {
  return declared ?? basename(root);
}
