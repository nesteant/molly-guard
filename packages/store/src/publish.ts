/**
 * The knowledge base a change proposes, and the act of filing it.
 *
 * A change carries `publish/`, a partial mirror of the corpus: `publish/specs/feeding/spec.md`
 * is the document that becomes `specs/feeding/spec.md`. The path is the id, so the path is also
 * the instruction — nothing here decides where a document goes, and nothing here reads one.
 *
 * The set is read whole before anything is written. A half-applied publication leaves the
 * knowledge base holding part of a change with nothing to say which part, which is the exact
 * state the command exists to prevent.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { CHANGES, CHANGE_PUBLISH } from '@mollyguard/core';
import { isDocumentName } from './layout';

export interface ProposedDocument {
  /**
   * Where it lands, relative to the corpus root: `specs/feeding/spec.md`.
   *
   * Always POSIX-separated, because this string is an id as well as a path — it is printed,
   * compared and refused by name, and an id that reads differently on Windows is two ids.
   */
  readonly path: string;
  readonly text: string;
  /** Whether something is already at that path. Decides created against replaced. */
  readonly replaces: boolean;
  /** Byte-identical to what is there, which means nothing was actually written. */
  readonly identical: boolean;
}

export interface PublishSet {
  readonly documents: readonly ProposedDocument[];
  /** One line per entry that could not be read. Reported by the caller, never swallowed. */
  readonly unreadable: readonly string[];
  /** False when the change carries no `publish/` at all — a different fact from carrying none. */
  readonly present: boolean;
}

/** Every document a change proposes, with its destination and whether it changes anything. */
export async function readPublishSet(root: string, slug: string): Promise<PublishSet> {
  const from = join(root, CHANGES, slug, CHANGE_PUBLISH);
  if (!existsSync(from)) return { documents: [], unreadable: [], present: false };

  const documents: ProposedDocument[] = [];
  const unreadable: string[] = [];
  await walk(root, from, [], documents, unreadable);

  return { documents, unreadable, present: true };
}

async function walk(
  root: string,
  dir: string,
  trail: readonly string[],
  documents: ProposedDocument[],
  unreadable: string[],
): Promise<void> {
  const entries = (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entry of entries) {
    // The same exclusion every scan makes: an explainer is documentation, a dotfile is clutter,
    // and neither is a document somebody meant to publish.
    if (!isDocumentName(entry.name)) continue;

    const here = [...trail, entry.name];
    if (entry.isDirectory()) {
      await walk(root, join(dir, entry.name), here, documents, unreadable);
      continue;
    }

    const path = here.join(posix.sep);
    const text = await readFile(join(dir, entry.name), 'utf8').catch(() => undefined);
    if (text === undefined) {
      unreadable.push(`${CHANGE_PUBLISH}/${path} could not be read`);
      continue;
    }

    const target = join(root, ...here);
    const replaces = existsSync(target);
    const current = replaces ? await readFile(target, 'utf8').catch(() => undefined) : undefined;
    documents.push({ path, text, replaces, identical: current === text });
  }
}

/** Writes the set. Directories are made; a document already there is replaced whole. */
export async function applyPublishSet(
  root: string,
  documents: readonly ProposedDocument[],
): Promise<void> {
  for (const document of documents) {
    const target = join(root, ...document.path.split(posix.sep));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, document.text, 'utf8');
  }
}

/**
 * Moves a published bundle into the archive, whole.
 *
 * Whole, including `publish/`: the archive is what answers "what did this change actually
 * write" without consulting git. Refused rather than overwritten where the name is taken — an
 * archive something can overwrite is not an archive.
 */
export async function archiveChange(
  root: string,
  slug: string,
  into: string,
): Promise<string | undefined> {
  const from = join(root, CHANGES, slug);
  const to = join(root, into, slug);
  if (!existsSync(from)) return `${CHANGES}/${slug} is not there to archive`;
  if (existsSync(to)) return `${into}/${slug} already exists`;

  await mkdir(dirname(to), { recursive: true });
  await rename(from, to);
  return undefined;
}
