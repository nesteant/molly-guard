/**
 * Reading the roadmap.
 *
 * The same scan `readCapabilities` makes, over the other area that holds files rather than
 * folders and has no lifecycle: a folder here is reported, a name that could not be typed is
 * reported, a record that will not parse is reported, and none of the three fails.
 *
 * **A writer that guards nothing.** No change alters an entry, so unlike a publication there is
 * nothing here to verify: `writeRoadmapEntry` refuses a collision and stops. Writing one by hand
 * stays entirely fine, which is what the README says. What the command buys is what
 * `writeCapability` buys next door — a name minted by the same rule as every other name, and a
 * record at the top — and the name is the half that matters, because a hand-written
 * `Seven Years.md` is reported as unusable by the scan below for as long as it sits there.
 */

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  ROADMAP,
  RoadmapRecord,
  Templates,
  isSlug,
  qualify,
  serializeDocument,
} from '@mollyguard/core';
import { parseDocument } from './frontmatter';
import { isDocumentName } from './layout';

/** The extension every document in this area carries. */
const DOCUMENT = '.md';

export interface RoadmapEntry {
  readonly slug: string;
  /** Qualified id: `roadmap/<slug>`. The path is the id. */
  readonly node: string;
  readonly record: RoadmapRecord;
}

export interface RoadmapScan {
  readonly entries: readonly RoadmapEntry[];
  /** One line per document that could not be read. Reported by the caller, never swallowed. */
  readonly unreadable: readonly string[];
}

export interface WrittenEntry {
  readonly slug: string;
  readonly node: string;
  readonly file: string;
}

export async function writeRoadmapEntry(
  root: string,
  slug: string,
  record: RoadmapRecord,
  templates: Templates,
): Promise<WrittenEntry | { readonly collision: string }> {
  const file = join(ROADMAP, `${slug}${DOCUMENT}`);
  if (existsSync(join(root, file))) return { collision: qualify(ROADMAP, slug) };

  // No `state`. An entry is open, or it is answered by a change that landed, and neither is
  // recorded — a document carrying the field would invite something to try moving it.
  const text = serializeDocument(
    { title: record.title, lang: record.lang, capability: record.capability },
    templates.bodyFor('roadmap'),
  );

  await mkdir(join(root, ROADMAP), { recursive: true });
  await writeFile(join(root, file), text, 'utf8');

  return { slug, node: qualify(ROADMAP, slug), file };
}

/** Every entry, by name. */
export async function readRoadmap(root: string): Promise<RoadmapScan> {
  const dir = join(root, ROADMAP);
  if (!existsSync(dir)) return { entries: [], unreadable: [] };

  const entries: RoadmapEntry[] = [];
  const unreadable: string[] = [];

  const found = (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entry of found) {
    if (!isDocumentName(entry.name)) continue;

    if (entry.isDirectory()) {
      unreadable.push(`${ROADMAP}/${entry.name} is a folder, and ${ROADMAP}/ holds files`);
      continue;
    }
    if (!entry.name.endsWith(DOCUMENT)) {
      unreadable.push(`${ROADMAP}/${entry.name} is not a markdown document`);
      continue;
    }

    // The rule creation enforces, enforced here for a document creation never touched. Every
    // entry in this area is hand-written, so this is the only place the rule can hold at all.
    const slug = entry.name.slice(0, -DOCUMENT.length);
    if (!isSlug(slug)) {
      unreadable.push(`${ROADMAP}/${entry.name} is not a usable name — lowercase ASCII, hyphenated`);
      continue;
    }

    const document = parseDocument(await readFile(join(dir, entry.name), 'utf8'));
    if ('unreadable' in document) {
      unreadable.push(`${ROADMAP}/${entry.name}: ${document.unreadable}`);
      continue;
    }

    entries.push({
      slug,
      node: qualify(ROADMAP, slug),
      record: recordFrom(document.fields, slug),
    });
  }

  return { entries, unreadable };
}

/**
 * The record as a listing needs it.
 *
 * Nothing is refused, and a missing title falls back to the name. An entry is a note somebody
 * wrote while planning; dropping it for having no frontmatter would hide exactly the entries
 * written fastest, which are the ones a planner most needs to be reminded of.
 */
function recordFrom(fields: Readonly<Record<string, unknown>>, slug: string): RoadmapRecord {
  const title = fields['title'];
  const lang = fields['lang'];
  const capability = fields['capability'];

  return {
    title: typeof title === 'string' && title.trim() !== '' ? title : slug,
    lang: typeof lang === 'string' ? lang : '',
    capability: typeof capability === 'string' && capability.trim() !== '' ? capability : undefined,
  };
}
