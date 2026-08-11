/**
 * Reading the record at the top of a document.
 *
 * The counterpart to core's `serializeFrontmatter`, and it lives here rather than beside it
 * because parsing needs a YAML reader — a dependency the engine does without, so that a slice
 * loading core loads nothing else.
 *
 * A block that does not parse is reported rather than treated as absent. A document whose
 * record silently reads as empty is specified as far as its author is concerned and blank as
 * far as every listing is concerned, and nothing says which.
 */

import { parse } from 'yaml';

export interface Document {
  /** The record as written. Nothing is coerced here — the shape is the caller's business. */
  readonly fields: Readonly<Record<string, unknown>>;
  readonly body: string;
}

const BLOCK = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

export function parseDocument(text: string): Document | { readonly unreadable: string } {
  const block = BLOCK.exec(text);

  // No frontmatter is a document with nothing declared, not a broken one. Three of the four
  // files in a change bundle are prose and have none by design.
  if (!block) return { fields: {}, body: text };

  let parsed: unknown;
  try {
    parsed = parse(block[1] ?? '');
  } catch (cause) {
    return { unreadable: (cause as Error).message.split('\n')[0] ?? 'unreadable frontmatter' };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { unreadable: 'frontmatter is not a record' };
  }

  return { fields: parsed as Record<string, unknown>, body: text.slice(block[0].length) };
}
