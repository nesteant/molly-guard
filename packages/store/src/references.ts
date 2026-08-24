/**
 * What pointed at a path that has just moved.
 *
 * Publishing is a corpus-wide event and only one actor knows it happened. `molly publish` moves
 * `changes/<name>/` into `history/<name>/`, and every relative link that resolved into that
 * directory stops resolving — in documents belonging to changes nobody touched. Until this, the
 * break surfaced days later as a red build in somebody else's work, and the file that had to be
 * edited had nothing to do with the change that was published.
 *
 * **It reports and never repairs.** `capabilities/the-corpus` states the edge: nothing here
 * rewrites a reference to keep it valid, because editing documents nobody asked to change is how
 * a tidying operation silently revokes a review — and where the reference is an `alters:` line,
 * rewriting it moves that change's content hash and un-approves every change in flight against a
 * document somebody merely tidied.
 *
 * So the whole remedy is saying so, at the moment it happens, to the person who caused it.
 *
 * **Two conditions, and both are required.** A link is reported when it resolves to nothing *and*
 * the path it names is inside what just moved. The first alone would report every link anybody
 * has broken since the corpus was made, on the day somebody inherits an untidy one. The second
 * alone would report links that still resolve because a file of that name exists elsewhere.
 *
 * Nothing here reads prose. A link is a path, an anchor inside a document is not resolved, and
 * whether the link should have existed is not a question this can ask.
 */

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, posix, resolve as resolvePath } from 'node:path';

export interface BrokenReference {
  /** Corpus-relative path of the document holding the link. */
  readonly file: string;
  /** 1-indexed, so it can be pasted into an editor. */
  readonly line: number;
  /** The target exactly as it was written, which is what somebody has to find and change. */
  readonly target: string;
}

/**
 * Markdown's two ways of writing a link, and no third.
 *
 * Inline `[text](target)` carries an optional title after the path, which is why the capture
 * stops at whitespace. A reference definition `[id]: target` sits at the start of a line.
 *
 * Autolinks and bare URLs are not matched, and do not need to be: neither can name a relative
 * path inside the corpus.
 */
const INLINE = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const DEFINITION = /^\s{0,3}\[[^\]]+\]:\s*(\S+)/;

/** A target this tool has no business resolving: another host, another scheme, or an absolute path. */
function isRelative(target: string): boolean {
  if (target.startsWith('#')) return false;
  if (target.startsWith('/')) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(target);
}

/** Every markdown file under one directory, corpus-relative, in a stable order. */
async function markdownIn(root: string, area: string): Promise<readonly string[]> {
  const found: string[] = [];

  const walk = async (dir: string): Promise<void> => {
    let entries;
    try {
      entries = await readdir(join(root, dir), { withFileTypes: true });
    } catch {
      // A directory that is not there is an area this corpus does not have, which is not this
      // command's finding to make.
      return;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.')) continue;
      const at = posix.join(dir, entry.name);
      if (entry.isDirectory()) await walk(at);
      else if (entry.name.endsWith('.md')) found.push(at);
    }
  };

  await walk(area);
  return found;
}

/**
 * Every relative link, in the given areas, that resolved into `moved` and now resolves to nothing.
 *
 * `moved` is corpus-relative and is the path as it was *before* the move — `changes/<name>` — so
 * this is asked after the move, about a directory that is no longer there. That order is not an
 * optimisation: the reference is broken *by* the move, so checking beforehand would be checking a
 * corpus that no longer exists.
 *
 * The areas are passed in rather than read from the table, because the one area that must not be
 * walked is `history/`: an archived bundle is sealed and never re-checked, so a link inside one
 * pointing at a sibling is wrong from the moment it is archived and is deliberately not this
 * tool's business.
 */
export async function referencesInto(
  root: string,
  areas: readonly string[],
  moved: string,
): Promise<readonly BrokenReference[]> {
  const broken: BrokenReference[] = [];
  const movedAbsolute = resolvePath(join(root, moved));

  for (const area of areas) {
    for (const file of await markdownIn(root, area)) {
      let text: string;
      try {
        text = await readFile(join(root, file), 'utf8');
      } catch {
        // Unreadable here is not this command's finding either. `publish` has already refused a
        // payload it could not read; a document elsewhere in the corpus that will not open is the
        // listing's business.
        continue;
      }

      const from = posix.dirname(file);
      text.split('\n').forEach((line, index) => {
        for (const target of targetsIn(line)) {
          if (!isRelative(target)) continue;

          // An anchor addresses a place inside a document, and this resolves documents.
          const path = target.split('#')[0];
          if (path === undefined || path === '') continue;

          const at = resolvePath(join(root, posix.join(from, path)));
          if (existsSync(at)) continue;
          if (at !== movedAbsolute && !at.startsWith(`${movedAbsolute}/`)) continue;

          broken.push({ file, line: index + 1, target });
        }
      });
    }
  }

  return broken;
}

/** Both link shapes on one line. A line may hold several, and often does. */
function targetsIn(line: string): readonly string[] {
  const targets: string[] = [];

  const definition = DEFINITION.exec(line);
  if (definition?.[1] !== undefined) targets.push(definition[1]);

  // A fresh lastIndex per line: the regex is module-scoped and `g` makes it stateful, which is
  // the classic way a scan silently skips every other match.
  INLINE.lastIndex = 0;
  let match = INLINE.exec(line);
  while (match !== null) {
    if (match[1] !== undefined) targets.push(match[1]);
    match = INLINE.exec(line);
  }

  return targets;
}
