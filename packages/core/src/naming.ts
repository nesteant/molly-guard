/**
 * The shape of a name, where a corpus wants one.
 *
 * A name is lowercase ASCII and nothing here changes that. What this adds is *ordering*: a
 * corpus may want `0001-sign-in-with-entra-id` rather than `sign-in-with-entra-id`, so that a
 * directory listing is the order the work was taken up in.
 *
 * **The tool has no opinion about whether to.** A pattern is declared in `mollyguard.yml` or it
 * is not, and a corpus that declares none keeps exactly the names it has today. What the tool
 * refuses to leave to a person is the *allocation* — reading a listing to find the next free
 * number is a race between two people drafting on one afternoon, and a memory test for whoever
 * does it from memory instead. Neither produces a duplicate anybody notices: two directories
 * with the same ordinal sort next to each other and look like a pair.
 *
 * Pure, like the rest of core. Rendering a name and reading one back are string work; finding
 * out which numbers are taken is a directory scan and lives in the store.
 */

/** What a pattern may contain, beyond literal text. */
const TOKEN = /\{(?:slug|ordinal:(\d+))\}/g;

/** A slug, as a fragment of a larger pattern. Kept in step with `SLUG_RE` in `slug.ts`. */
const SLUG_FRAGMENT = '[a-z0-9]+(?:-[a-z0-9]+)*';

/** The pattern a corpus gets when it declares none: the name is the slug, as it always was. */
export const BARE = '{slug}';

/** What a rendered name is made of. */
export interface NameParts {
  readonly slug: string;
  /** Absent for a pattern that asks for no ordinal. */
  readonly ordinal?: number | undefined;
}

/**
 * Whether a pattern is one this can render and read back.
 *
 * Exactly one `{slug}`, because a name without its words is a number nobody can read and a name
 * with them twice is a name no reader can parse. At most one `{ordinal:n}`, for the same reason.
 * Everything else is literal.
 */
export function isNamePattern(pattern: unknown): pattern is string {
  if (typeof pattern !== 'string' || pattern === '') return false;

  const slugs = pattern.match(/\{slug\}/g)?.length ?? 0;
  const ordinals = pattern.match(/\{ordinal:\d+\}/g)?.length ?? 0;
  if (slugs !== 1 || ordinals > 1) return false;

  // Nothing else in braces. A typo like `{ordinal}` or `{name}` would otherwise survive as
  // literal text and be written into every name the corpus mints from then on.
  const leftovers = pattern.replace(TOKEN, '');
  return !leftovers.includes('{') && !leftovers.includes('}');
}

/** Whether a pattern needs a number allocated before a name can be rendered. */
export function needsOrdinal(pattern: string): boolean {
  return /\{ordinal:\d+\}/.test(pattern);
}

/**
 * The name a pattern gives these parts.
 *
 * An absent ordinal renders as nothing where the pattern asked for one, which cannot happen
 * through the store — `needsOrdinal` is what decides whether to allocate — and would be a defect
 * in the tool rather than a refusal if it did.
 */
export function renderName(pattern: string, parts: NameParts): string {
  return pattern.replace(TOKEN, (_match, width?: string) => {
    if (width === undefined) return parts.slug;
    return String(parts.ordinal ?? 0).padStart(Number(width), '0');
  });
}

/**
 * The parts a name was made of, or undefined where it was not made of these.
 *
 * Undefined is the ordinary answer, not an error: a corpus that adopts a pattern still holds
 * every name minted before it did, and a scan that refused them could not read its own history.
 * They are simply names this pattern did not produce, so they hold no ordinal to avoid.
 */
export function matchName(pattern: string, name: string): NameParts | undefined {
  let source = '^';
  let index = 0;
  let ordinalGroup: number | undefined;
  let group = 0;

  for (const match of pattern.matchAll(TOKEN)) {
    source += escape(pattern.slice(index, match.index));
    group++;
    if (match[1] === undefined) {
      source += `(${SLUG_FRAGMENT})`;
    } else {
      source += `(\\d{${match[1]}})`;
      ordinalGroup = group;
    }
    index = match.index + match[0].length;
  }
  source += `${escape(pattern.slice(index))}$`;

  const found = new RegExp(source).exec(name);
  if (found === null) return undefined;

  const slugGroup = ordinalGroup === 1 ? 2 : 1;
  const ordinal = ordinalGroup === undefined ? undefined : Number(found[ordinalGroup]);
  return { slug: found[slugGroup] as string, ordinal };
}

function escape(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
