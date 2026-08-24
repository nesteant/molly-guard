/**
 * Reading the knowledge base.
 *
 * `specs/` and `decisions/` are what the product is currently believed to be, and until this
 * existed `molly publish` filled them and no command looked at either again. A corpus is a claim
 * that what you are reading is what is true; a tool that cannot say what it holds is making that
 * claim about something it has not looked at.
 *
 * **Driven from the area table, not from two names.** Whether an area is bundled, and which file
 * carries its record, is already declared once in `AREAS` — so the next publishable area is
 * scanned without editing this, and cannot be scanned differently here than it is written by
 * `molly publish`.
 *
 * **Nothing here reads a body.** What is reported comes from frontmatter and from the path, which
 * is what leaves the prose in whatever language and whatever form its author chose.
 */

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AREAS, Area, isSlug, qualify } from '@mollyguard/core';
import { parseDocument } from './frontmatter';
import { isDocumentName } from './layout';

const DOCUMENT = '.md';

export interface BaseDocument {
  readonly slug: string;
  /** Qualified id: `specs/<slug>` or `decisions/<slug>`. The path is the id. */
  readonly node: string;
  readonly area: string;
  readonly title: string;
  readonly lang: string;
  /**
   * The capability it is filed under, where its area is read by one.
   *
   * Absent on a decision, always: the area table does not mark `decisions/` as grouped, because a
   * decision is found by whatever it constrains rather than by reading a slice. Reporting one
   * would be inventing a rule the corpus has not got.
   */
  readonly capability?: string | undefined;
}

export interface BaseScan {
  /** Everything filed, in area order then by name. */
  readonly documents: readonly BaseDocument[];
  /** One line per document that could not be read. Reported by the caller, never swallowed. */
  readonly unreadable: readonly string[];
}

export function documentsIn(scan: BaseScan, area: string): readonly BaseDocument[] {
  return scan.documents.filter((document) => document.area === area);
}

/** Everything a change has ever published, by name. */
export async function readBase(root: string): Promise<BaseScan> {
  const documents: BaseDocument[] = [];
  const unreadable: string[] = [];

  for (const area of AREAS.filter((candidate) => candidate.publishable === true)) {
    await scanArea(root, area, documents, unreadable);
  }

  return { documents, unreadable };
}

async function scanArea(
  root: string,
  area: Area,
  documents: BaseDocument[],
  unreadable: string[],
): Promise<void> {
  const dir = join(root, area.name);
  if (!existsSync(dir)) return;

  const found = (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entry of found) {
    if (!isDocumentName(entry.name)) continue;

    // A bundled area holds folders and a flat one holds files, so each reports the other shape
    // rather than passing over it — a stray file in `specs/` is a specification somebody wrote
    // that nothing will ever read.
    if (area.bundled !== entry.isDirectory()) {
      unreadable.push(
        area.bundled
          ? `${area.name}/${entry.name} is a file, and ${area.name}/ holds folders`
          : `${area.name}/${entry.name} is a folder, and ${area.name}/ holds files`,
      );
      continue;
    }

    const slug = area.bundled ? entry.name : entry.name.slice(0, -DOCUMENT.length);
    if (!area.bundled && !entry.name.endsWith(DOCUMENT)) {
      unreadable.push(`${area.name}/${entry.name} is not a markdown document`);
      continue;
    }
    if (!isSlug(slug)) {
      unreadable.push(`${area.name}/${entry.name} is not a usable name — lowercase ASCII, hyphenated`);
      continue;
    }

    const file = area.bundled ? join(dir, entry.name, area.entry ?? '') : join(dir, entry.name);
    if (!existsSync(file)) {
      unreadable.push(`${area.name}/${slug} has no ${area.entry} — the file that carries its record`);
      continue;
    }

    const node = qualify(area.name, slug);
    const parsed = parseDocument(await readFile(file, 'utf8'));
    if ('unreadable' in parsed) {
      // Reported, and still listed. The knowledge base is where the corpus's whole value sits, so
      // a listing that drops what it could not read vouches for a corpus it has not seen.
      unreadable.push(`${node}: ${parsed.unreadable}`);
      documents.push({ slug, node, area: area.name, title: slug, lang: '' });
      continue;
    }

    const title = parsed.fields['title'];
    const lang = parsed.fields['lang'];
    const capability = parsed.fields['capability'];

    documents.push({
      slug,
      node,
      area: area.name,
      // A missing title falls back to the name rather than dropping the document, exactly as a
      // capability's does: what was written fastest is what a reader most needs listed.
      title: typeof title === 'string' && title.trim() !== '' ? title : slug,
      lang: typeof lang === 'string' ? lang : '',
      capability:
        area.grouped === true && typeof capability === 'string' && capability.trim() !== ''
          ? capability
          : undefined,
    });
  }
}
