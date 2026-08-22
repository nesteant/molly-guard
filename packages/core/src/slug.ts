/**
 * Names.
 *
 * A slug is ASCII and derived once, at creation, from whatever language the author was
 * writing in. It is the one part of a corpus a translator never touches, which is what lets a
 * Ukrainian specification and its Japanese translation be cited by the same name.
 *
 * That reduction throws away whatever will not reduce, which is correct for an accent and
 * catastrophic for an alphabet: *Вхід через Entra ID* reduces to `entra-id`, a name two thirds
 * of its title has fallen out of. So the reduction is here and the *cost* of the reduction is
 * here beside it — `slugify` says what a title becomes, `lostWords` says what that cost was,
 * and both read the same `reduce` so the two can never answer about different behaviour.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Whether a run of text is a word at all, in any script.
 *
 * A letter or a digit, anywhere in it. Without this every `—`, `&` and `+` between two words is
 * a word that reduces to nothing, and a check that fires on every em dash is one people learn
 * to route around.
 */
const WORD_RE = /[\p{L}\p{N}]/u;

/** Long enough to stay readable, short enough to type and to fit a path. */
export const SLUG_LIMIT = 60;

export function isSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_RE.test(value);
}

/** The ASCII a piece of text reduces to. What a name is made of, and what it is judged by. */
function reduce(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugify(title: string): string {
  const full = reduce(title);

  if (full.length <= SLUG_LIMIT) return full;

  // Cut at a word boundary. Slicing at the limit produces names like `…-is-removed-rather-th`,
  // which read as corruption rather than as abbreviation — and a slug is a filename people
  // type. The hard cut is the fallback only when the first word is itself over the limit.
  const clipped = full.slice(0, SLUG_LIMIT);
  const boundary = clipped.lastIndexOf('-');
  return boundary > 0 ? clipped.slice(0, boundary) : clipped;
}

/**
 * The words a title would lose on its way to a name, in the order they were written.
 *
 * Empty for a title that survives whole, and empty for one that survives not at all — the
 * second is `slugify` returning nothing, which `isSlug` already refuses with a message that
 * reads better than any this could produce. What is left in between is the case worth
 * catching: a name that looks deliberate and is a fragment.
 *
 * Clipping is not loss. A title over `SLUG_LIMIT` drops its tail on purpose and visibly, and
 * nothing here remarks on it — this is about the alphabet, not the length.
 */
export function lostWords(title: string): readonly string[] {
  return title
    .split(/\s+/)
    .filter((word) => WORD_RE.test(word) && reduce(word) === '');
}
