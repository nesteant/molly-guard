/**
 * Reading `mollyguard.yml`.
 *
 * Until now the file was written and never read: its presence marked a corpus and its `lang:`
 * was documentation for whoever opened it. A naming policy is the first thing in it the tool
 * acts on, which makes this the first place a typo in that file can change what commands do —
 * so everything here is checked and named rather than silently ignored.
 *
 * **An unreadable config is not an absent one.** A corpus whose policy will not parse gets a
 * refusal naming the line, not the default policy applied quietly. The alternative is a corpus
 * that mints unnumbered names for a week because somebody indented a key wrongly.
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { AREAS, BARE, isNamePattern } from '@mollyguard/core';
import { CONFIG_FILE } from './layout';

export interface CorpusConfig {
  /**
   * The directory the corpus is in, relative to the configuration.
   *
   * Absent in the old layout, where the file lived inside the corpus and the corpus was the
   * directory holding it. `locateCorpus` is what reads this; nothing else should need to.
   */
  readonly root: string | undefined;
  /** The language specifications are written in, where the file says. */
  readonly lang: string | undefined;
  /** Name pattern per area. Absent means `{slug}` — the name is the slug, as it always was. */
  readonly naming: Readonly<Record<string, string>>;
  /**
   * Conventional-commit types that must name a change, e.g. `['feat', 'fix']`.
   *
   * Empty is the default and means the tool requires a trailer of nothing. It still refuses one
   * that names a change which does not exist — that half is not a policy, because a trailer
   * pointing at nothing is wrong under every convention.
   */
  readonly commitRequires: readonly string[];
  /**
   * What in the file could not be used, one line each.
   *
   * Reported by the caller and never swallowed. A policy the tool could not read is a policy
   * the corpus believes it has.
   */
  readonly problems: readonly string[];
}

const EMPTY: CorpusConfig = { root: undefined, lang: undefined, naming: {}, commitRequires: [], problems: [] };

export async function readConfig(file: string): Promise<CorpusConfig> {
  if (!existsSync(file)) return EMPTY;

  let parsed: unknown;
  try {
    parsed = parse(await readFile(file, 'utf8'));
  } catch (cause) {
    const line = (cause as Error).message.split('\n')[0] ?? 'unreadable';
    return { ...EMPTY, problems: [`${CONFIG_FILE}: ${line}`] };
  }

  // An empty file parses to null, and a corpus with a config holding nothing is a corpus with
  // no policy rather than a broken one.
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return EMPTY;

  const fields = parsed as Record<string, unknown>;
  const lang = typeof fields['lang'] === 'string' ? fields['lang'] : undefined;
  const named = fields['root'];
  const root = typeof named === 'string' && named.trim() !== '' ? named.trim() : undefined;

  const naming: Record<string, string> = {};
  const problems: string[] = [];

  const declared = fields['naming'];
  if (declared !== undefined && declared !== null) {
    if (typeof declared !== 'object' || Array.isArray(declared)) {
      problems.push(`${CONFIG_FILE}: naming: must be a mapping of area to pattern`);
    } else {
      for (const [area, pattern] of Object.entries(declared as Record<string, unknown>)) {
        // An area nobody has is a policy that never fires. Silently ignoring it is how a corpus
        // spends a month believing it numbers its decisions because the key says `decsions`.
        if (!AREAS.some((a) => a.name === area)) {
          problems.push(
            `${CONFIG_FILE}: naming: "${area}" is not an area — one of: ${AREAS.map((a) => a.name).join(', ')}`,
          );
          continue;
        }
        if (!isNamePattern(pattern)) {
          problems.push(
            `${CONFIG_FILE}: naming: "${area}" is not a usable pattern — one {slug}, at most one {ordinal:n}, e.g. "{ordinal:4}-{slug}"`,
          );
          continue;
        }
        naming[area] = pattern;
      }
    }
  }

  return { root, lang, naming, commitRequires: commitRequires(fields, problems), problems };
}

/**
 * The types a corpus asks a change-naming trailer of.
 *
 * `commit: { requires: [...] }`. A shape that is not a list of strings is named rather than
 * quietly read as none — a policy the tool could not understand is one the repository believes
 * is being enforced, which is the failure this whole file is careful about.
 */
function commitRequires(fields: Record<string, unknown>, problems: string[]): readonly string[] {
  const declared = fields['commit'];
  if (declared === undefined || declared === null) return [];

  if (typeof declared !== 'object' || Array.isArray(declared)) {
    problems.push(`${CONFIG_FILE}: commit: must be a mapping, e.g. commit: { requires: [feat] }`);
    return [];
  }

  const requires = (declared as Record<string, unknown>)['requires'];
  if (requires === undefined || requires === null) return [];

  if (!Array.isArray(requires) || requires.some((type) => typeof type !== 'string')) {
    problems.push(`${CONFIG_FILE}: commit: requires: must be a list of commit types, e.g. [feat, fix]`);
    return [];
  }

  return (requires as string[]).map((type) => type.toLowerCase());
}

/** The pattern an area mints by. `{slug}` where nothing was declared. */
export function patternFor(config: CorpusConfig, area: string): string {
  return config.naming[area] ?? BARE;
}
