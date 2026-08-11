/**
 * The transition ledger.
 *
 * One JSON object per line, appended and never rewritten. Append-only is not a style
 * preference: it is what makes the file mergeable — two branches that each advanced a change
 * produce two lines rather than a conflict — and it is what makes the record an audit trail
 * rather than a status field that happens to live in a file.
 *
 * Nothing here folds. Reading is one pass returning every event; what the events mean is
 * core's business.
 */

import { existsSync } from 'node:fs';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { LifecycleEvent, State } from '@mollyguard/core';
import { HISTORY_FILE } from './layout';
import { readState } from './states';

export interface History {
  readonly events: readonly LifecycleEvent[];
  /**
   * One line per entry that could not be read, in file order.
   *
   * Reported, never silently dropped: a history that quietly ignores what it cannot parse
   * lies by omission, and the state folded from it is wrong with nothing saying so.
   */
  readonly unreadable: readonly string[];
}

export async function readHistory(root: string): Promise<History> {
  const file = join(root, HISTORY_FILE);

  // Absence is not emptiness. `molly init` writes the ledger, so a missing one means the
  // corpus was cut down rather than never used, and those are different facts.
  if (!existsSync(file)) {
    return { events: [], unreadable: [`${HISTORY_FILE} is missing — it is written by \`molly init\``] };
  }

  const events: LifecycleEvent[] = [];
  const unreadable: string[] = [];
  const lines = (await readFile(file, 'utf8')).split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() ?? '';
    if (line === '') continue;

    const event = readEvent(line);
    if (event === undefined) {
      unreadable.push(`${HISTORY_FILE}:${i + 1} is not a transition, and was skipped`);
      continue;
    }
    events.push(event);
  }

  return { events, unreadable };
}

/**
 * Appends one event.
 *
 * Never rewrites and never re-reads: a correction is another line, not an edit. A tool that
 * rewrote the log to fix a mistake would produce a record that disagrees with what happened,
 * and nothing downstream could tell.
 */
export async function appendEvent(root: string, event: LifecycleEvent): Promise<void> {
  // The directory is state the tool owns, so writing into it may create it. Without this, a
  // corpus whose `.mollyguard/` is absent — hand-made, or trimmed by someone tidying — crashed
  // with a stack trace *after* the bundle had already been written, leaving a change on disk
  // that the ledger had no record of. Reading still reports an absent ledger, which is where
  // that distinction belongs.
  await mkdir(dirname(join(root, HISTORY_FILE)), { recursive: true });

  // Field order is fixed here rather than left to the caller's object literal, so the file
  // greps and diffs the same way whoever wrote the line. `from` is omitted on a creation
  // rather than written as null: nothing preceded it, and a null would invite a reader to
  // treat it as a state.
  const line = JSON.stringify({
    node: event.node,
    at: event.at,
    kind: event.kind,
    ...(event.from === undefined ? {} : { from: event.from }),
    to: event.to,
    by: event.by,
  });
  await appendFile(join(root, HISTORY_FILE), `${line}\n`, 'utf8');
}

function readEvent(line: string): LifecycleEvent | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return undefined;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return undefined;

  const record = parsed as Record<string, unknown>;
  const { node, at, kind, from, to, by } = record;
  if (typeof node !== 'string' || typeof at !== 'string' || typeof by !== 'string') return undefined;

  const into = readState(to);
  const outof = readState(from);
  if (into === undefined) return undefined;

  // Written strictly, read leniently. A line from before `kind` existed carries a `from` and is
  // a transition; refusing it would mean an upgrade silently emptied somebody's audit trail,
  // which is the one thing a ledger may never do.
  const read = kind === 'created' || kind === 'transition' ? kind : outof !== undefined ? 'transition' : undefined;
  if (read === undefined) return undefined;
  if (read === 'transition' && outof === undefined) return undefined;

  return read === 'created'
    ? { node, at, kind: read, to: into, by }
    : { node, at, kind: read, from: outof as State, to: into, by };
}
