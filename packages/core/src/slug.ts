/**
 * Names.
 *
 * A slug is ASCII and derived once, at creation, from whatever language the author was
 * writing in. It is the one part of a corpus a translator never touches, which is what lets a
 * Ukrainian specification and its Japanese translation be cited by the same name.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Long enough to stay readable, short enough to type and to fit a path. */
export const SLUG_LIMIT = 60;

export function isSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_RE.test(value);
}

export function slugify(title: string): string {
  const full = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (full.length <= SLUG_LIMIT) return full;

  // Cut at a word boundary. Slicing at the limit produces names like `…-is-removed-rather-th`,
  // which read as corruption rather than as abbreviation — and a slug is a filename people
  // type. The hard cut is the fallback only when the first word is itself over the limit.
  const clipped = full.slice(0, SLUG_LIMIT);
  const boundary = clipped.lastIndexOf('-');
  return boundary > 0 ? clipped.slice(0, boundary) : clipped;
}
