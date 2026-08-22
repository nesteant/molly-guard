/**
 * Reading and writing change bundles.
 *
 * The whole bundle is composed in memory and written only once every path is known to be
 * free, so a name collision leaves nothing behind. A half-written bundle is worse than none:
 * it exists as far as a listing is concerned and is incomplete as far as anything reading it
 * is concerned, and nothing says which.
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  CHANGES,
  CHANGE_PARTS,
  ChangeKind,
  ChangePart,
  ChangeRecord,
  INITIAL_STATE,
  State,
  Templates,
  area,
  isChangeKind,
  qualify,
  serializeDocument,
  withField,
} from '@mollyguard/core';
import { parseDocument } from './frontmatter';
import { isDocumentName } from './layout';
import { readState } from './states';

/** What `molly change new` writes when nobody says. An absent kind reads as that, not as blank. */
const DEFAULT_KIND: ChangeKind = 'feature';

export interface WrittenBundle {
  readonly slug: string;
  readonly dir: string;
  readonly files: readonly string[];
}

export interface ChangeBundle {
  readonly slug: string;
  /** Qualified id: `changes/<slug>`. The path is the id, and the ledger is keyed by it. */
  readonly node: string;
  readonly record: ChangeRecord;
  /**
   * The state the document claims, if it claims one.
   *
   * A projection of the ledger, not a second source of truth — which is exactly why it is kept
   * separate from the fold rather than merged into it. Undefined means the document predates
   * the field and is not a disagreement; a value that differs from the fold is.
   */
  readonly declared: State | undefined;
}

export interface BundleScan {
  readonly bundles: readonly ChangeBundle[];
  /** One line per bundle that could not be read. Reported by the caller, never swallowed. */
  readonly unreadable: readonly string[];
}

export async function writeChangeBundle(
  root: string,
  slug: string,
  record: ChangeRecord,
  templates: Templates,
): Promise<WrittenBundle | { readonly collision: string }> {
  const dir = join(CHANGES, slug);
  if (existsSync(join(root, dir))) return { collision: qualify(CHANGES, slug) };

  const documents = (Object.keys(CHANGE_PARTS) as ChangePart[]).map((part) => ({
    file: CHANGE_PARTS[part],
    // Only the entry carries the record. The other three are prose: a title repeated in four
    // files is a title that disagrees with itself by the end of the week.
    text:
      part === 'entry'
        ? serializeDocument(
            {
              title: record.title,
              lang: record.lang,
              kind: record.kind,
              // Omitted entirely when nobody declared one: a blank key reads as "answered,
              // nothing" where the truth is "not answered".
              capability: record.capability,
              realises: record.realises,
              state: INITIAL_STATE,
              alters: record.alters,
            },
            templates.bodyFor(part),
          )
        : templates.bodyFor(part),
  }));

  await mkdir(join(root, dir), { recursive: true });
  for (const document of documents) {
    await writeFile(join(root, dir, document.file), document.text, 'utf8');
  }

  return { slug, dir, files: documents.map((d) => d.file) };
}

/** Every change in flight, by name. */
export async function readChanges(root: string): Promise<BundleScan> {
  return scan(root, CHANGES);
}

/** Every change that has been published and archived. Empty until one has. */
export async function readArchivedChanges(root: string): Promise<BundleScan> {
  const into = area(CHANGES)?.archiveInto;
  return into === undefined ? { bundles: [], unreadable: [] } : scan(root, into);
}

async function scan(root: string, directory: string): Promise<BundleScan> {
  const dir = join(root, directory);
  if (!existsSync(dir)) return { bundles: [], unreadable: [] };

  const bundles: ChangeBundle[] = [];
  const unreadable: string[] = [];

  const entries = (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entry of entries) {
    // Machine-local clutter, and the explainer every directory carries. Neither is a document
    // and neither is a mistake — and the rule saying so lives in one place for every area.
    if (!isDocumentName(entry.name)) continue;

    // Anything else that is not a folder is reported rather than passed over. A file that
    // exists and does not load is specified as far as its author is concerned and absent as far
    // as everything else is concerned, and nothing downstream would ever mention it.
    if (!entry.isDirectory()) {
      unreadable.push(`${directory}/${entry.name} is a file, and ${directory}/ holds folders`);
      continue;
    }

    const file = join(dir, entry.name, CHANGE_PARTS.entry);
    if (!existsSync(file)) {
      unreadable.push(`${directory}/${entry.name} has no ${CHANGE_PARTS.entry}`);
      continue;
    }

    const document = parseDocument(await readFile(file, 'utf8'));
    if ('unreadable' in document) {
      unreadable.push(`${directory}/${entry.name}/${CHANGE_PARTS.entry}: ${document.unreadable}`);
      continue;
    }

    // Read through the same lenient reader as the ledger. A document written before the
    // terminal state was renamed still says the old word, and understanding it in one file and
    // not the other would report a disagreement where the two actually agree.
    bundles.push({
      slug: entry.name,
      node: qualify(directory, entry.name),
      record: recordFrom(document.fields, entry.name),
      declared: readState(document.fields['state']),
    });
  }

  return { bundles, unreadable };
}

/**
 * The record as a listing needs it.
 *
 * Nothing is refused here. A bundle with a damaged record still exists, and a scan that
 * dropped it would report a corpus smaller than the one on disk — so the fields fall back and
 * the change stays visible.
 */
function recordFrom(fields: Readonly<Record<string, unknown>>, slug: string): ChangeRecord {
  const title = fields['title'];
  const lang = fields['lang'];
  const kind = fields['kind'];
  const capability = fields['capability'];
  const realises = fields['realises'];
  const alters = fields['alters'];

  return {
    // The directory already names the change, so a missing title reads as something a person
    // can act on rather than as a blank column.
    title: typeof title === 'string' && title.trim() !== '' ? title : slug,
    lang: typeof lang === 'string' ? lang : '',
    kind: isChangeKind(kind) ? kind : DEFAULT_KIND,
    // Whatever it says, resolved by the caller against what is on disk. A name that no longer
    // exists is a finding rather than something to drop here, where nothing could report it.
    capability: typeof capability === 'string' && capability.trim() !== '' ? capability : undefined,
    realises: typeof realises === 'string' && realises.trim() !== '' ? realises : undefined,
    alters: Array.isArray(alters) ? alters.filter((a): a is string => typeof a === 'string') : [],
  };
}

/**
 * Writes the state a change document claims.
 *
 * One field is replaced and every other byte survives, because this file is prose somebody
 * wrote and the tool is only updating the label on it. Returns what went wrong rather than
 * throwing: a projection that could not be written is worth reporting, and is never worth
 * losing a recorded transition over.
 */
export async function writeDeclaredState(
  root: string,
  slug: string,
  state: State,
): Promise<string | undefined> {
  const file = join(root, CHANGES, slug, CHANGE_PARTS.entry);
  if (!existsSync(file)) return `${CHANGES}/${slug}/${CHANGE_PARTS.entry} is missing`;

  const updated = withField(await readFile(file, 'utf8'), 'state', state);
  if (updated === null) return `${CHANGES}/${slug}/${CHANGE_PARTS.entry} has no frontmatter block`;

  await writeFile(file, updated, 'utf8');
  return undefined;
}
