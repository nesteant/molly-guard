/**
 * Reading and writing capabilities.
 *
 * The first area that holds **files** rather than folders, which inverts what a scan reports:
 * here a folder is the thing that does not belong, and it is named rather than passed over for
 * the same reason a stray file in `changes/` is.
 *
 * Nothing here appends to the transition ledger. A capability has no lifecycle, so an event
 * would have to carry a state it does not have — see `the-ledger-holds-only-what-has-a-lifecycle`.
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  CAPABILITIES,
  CapabilityRecord,
  isSlug,
  qualify,
  serializeDocument,
  Templates,
} from '@mollyguard/core';
import { parseDocument } from './frontmatter';
import { isDocumentName } from './layout';

/** The extension every document in this area carries. */
const DOCUMENT = '.md';

export interface WrittenCapability {
  readonly slug: string;
  readonly node: string;
  readonly file: string;
}

export interface Capability {
  readonly slug: string;
  /** Qualified id: `capabilities/<slug>`. The path is the id. */
  readonly node: string;
  readonly record: CapabilityRecord;
}

export interface CapabilityScan {
  readonly capabilities: readonly Capability[];
  /** One line per document that could not be read. Reported by the caller, never swallowed. */
  readonly unreadable: readonly string[];
}

export async function writeCapability(
  root: string,
  slug: string,
  record: CapabilityRecord,
  templates: Templates,
): Promise<WrittenCapability | { readonly collision: string }> {
  const file = join(CAPABILITIES, `${slug}${DOCUMENT}`);
  if (existsSync(join(root, file))) return { collision: qualify(CAPABILITIES, slug) };

  // No `state`. A capability is current or it is edited; it has nothing to move through, and a
  // document carrying the field would invite something to try.
  const text = serializeDocument(
    { title: record.title, lang: record.lang },
    templates.bodyFor('capability'),
  );

  await mkdir(join(root, CAPABILITIES), { recursive: true });
  await writeFile(join(root, file), text, 'utf8');

  return { slug, node: qualify(CAPABILITIES, slug), file };
}

/** Every capability, by name. */
export async function readCapabilities(root: string): Promise<CapabilityScan> {
  const dir = join(root, CAPABILITIES);
  if (!existsSync(dir)) return { capabilities: [], unreadable: [] };

  const capabilities: Capability[] = [];
  const unreadable: string[] = [];

  const entries = (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entry of entries) {
    if (!isDocumentName(entry.name)) continue;

    // The mirror of the report `changes/` makes. A folder here is not a capability and is not
    // nothing either: something was filed in the wrong shape, and a silent skip means nothing
    // downstream will ever mention it.
    if (entry.isDirectory()) {
      unreadable.push(`${CAPABILITIES}/${entry.name} is a folder, and ${CAPABILITIES}/ holds files`);
      continue;
    }
    if (!entry.name.endsWith(DOCUMENT)) {
      unreadable.push(`${CAPABILITIES}/${entry.name} is not a markdown document`);
      continue;
    }

    // The same rule creation enforces, enforced on the way back in. Without it the rule held
    // only for names the tool minted: a hand-written `Billing Reports.md` listed as a
    // capability called `Billing Reports`, and a change could be filed under it — a name with
    // a space in it, in a corpus whose names are meant to survive being typed and translated.
    const slug = entry.name.slice(0, -DOCUMENT.length);
    if (!isSlug(slug)) {
      unreadable.push(
        `${CAPABILITIES}/${entry.name} is not a usable name — lowercase ASCII, hyphenated`,
      );
      continue;
    }

    const document = parseDocument(await readFile(join(dir, entry.name), 'utf8'));
    if ('unreadable' in document) {
      unreadable.push(`${CAPABILITIES}/${entry.name}: ${document.unreadable}`);
      continue;
    }

    capabilities.push({
      slug,
      node: qualify(CAPABILITIES, slug),
      record: recordFrom(document.fields, slug),
    });
  }

  return { capabilities, unreadable };
}

/**
 * The record as a listing needs it.
 *
 * Nothing is refused. A capability with a damaged record still groups the specifications filed
 * under it, and a scan that dropped it would report a corpus smaller than the one on disk —
 * and would break every reference pointing at it in the process.
 */
function recordFrom(fields: Readonly<Record<string, unknown>>, slug: string): CapabilityRecord {
  const title = fields['title'];
  const lang = fields['lang'];

  return {
    title: typeof title === 'string' && title.trim() !== '' ? title : slug,
    lang: typeof lang === 'string' ? lang : '',
  };
}
