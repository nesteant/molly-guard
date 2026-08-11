/**
 * The areas a corpus is divided into.
 *
 * **The path is the id.** `docs/specs/invoice-immutability/` is the specification named
 * `specs/invoice-immutability`, and no index has to be consulted to know that. The
 * containing directory already says what kind of thing a document is, so the id does not
 * repeat it — which removes a class of disagreement no prefix scheme can prevent, because
 * a `SPEC-` file sitting in the decisions directory cannot be expressed.
 *
 * Pure: no filesystem, no clock. This file is data and rules about data.
 */

export interface Area {
  /** Directory under the corpus root. Lowercase, plural where natural. */
  readonly name: string;
  /** What it holds, in one line. Shown by `molly help` and used in a generated README. */
  readonly describes: string;
  /**
   * Whether a document here is a folder of several files rather than one file.
   *
   * A specification carries its business text and its architecture; a change carries its
   * delta, design, work and evidence. Siblings in one folder are reviewed together, moved
   * together and archived together.
   */
  readonly bundled: boolean;
  /** For a bundled area, the file carrying the record itself. */
  readonly entry?: string;
  /**
   * Whether a change may write documents here by publishing.
   *
   * The knowledge base is made of the areas that are true of the product — a specification and
   * a decision, both of which arrive only through a change. A capability and a roadmap entry
   * are written directly, and `changes/` and `history/` are not knowledge at all.
   *
   * Declared here rather than listed inside the publish command, so the next area added answers
   * the question in the same place it answers every other one.
   */
  readonly publishable?: boolean;
  /**
   * Whether a document here is read as part of a capability.
   *
   * A capability groups specifications: it is how a corpus that no longer fits in one sitting
   * is read a slice at a time. So a *new* specification that names no capability is truth that
   * is present and unreachable — nothing points at it and no slice contains it — which is what
   * makes filing checkable at publication rather than a matter of taste.
   *
   * A decision is not grouped this way. It is a constraint later work has to respect, found by
   * whatever it constrains rather than by reading a slice, and requiring a capability on one
   * would be inventing a rule the corpus does not have.
   *
   * Declared here for the same reason `publishable` is: the next area added answers the question
   * in the place every other one is answered, instead of in a list inside a command.
   */
  readonly grouped?: boolean;
  /** Where a document goes when its lifecycle reaches the terminal state. */
  readonly archiveInto?: string;
}

/**
 * The areas something else has to name.
 *
 * A directory name written twice is a directory name that gets renamed once. These are the two
 * a command or a store module refers to by hand; the rest are reached through `AREAS`.
 */
export const CAPABILITIES = 'capabilities';
export const CHANGES = 'changes';

export const AREAS: readonly Area[] = [
  {
    name: CAPABILITIES,
    describes: 'what the product is responsible for, and where the edges are',
    bundled: false,
  },
  {
    name: 'specs',
    describes: 'accumulated truth: the business specification and its architecture',
    bundled: true,
    entry: 'spec.md',
    publishable: true,
    grouped: true,
  },
  {
    name: 'decisions',
    describes: 'constraints that outlive any one change',
    bundled: false,
    publishable: true,
  },
  {
    name: 'roadmap',
    describes: 'intent that has not become a change yet',
    bundled: false,
  },
  {
    name: CHANGES,
    describes: 'one unit of intent, with its delta, design, work and evidence',
    bundled: true,
    entry: 'change.md',
    archiveInto: 'history',
  },
];

export function area(name: string): Area | undefined {
  return AREAS.find((a) => a.name === name);
}

/** Every directory a corpus contains, archives included, in the order they are created. */
export function allDirectories(): readonly string[] {
  return AREAS.flatMap((a) => (a.archiveInto ? [a.name, a.archiveInto] : [a.name]));
}

/** The id of a document: its area and its name, which together are its path. */
export function qualify(area: string, slug: string): string {
  return `${area}/${slug}`;
}

/** What a path inside the corpus refers to, read off the path alone. */
export interface Located {
  /** The directory it lands in. Not necessarily an area that exists. */
  readonly area: string;
  /** The document's name, without the extension a file-holding area carries. */
  readonly name: string;
  /** The file within it, for a bundled area. Empty where the document *is* the file. */
  readonly file: string;
  /** `specs/feeding`. What a reference to this document would say. */
  readonly node: string;
}

/**
 * Reads a corpus-relative path as the document it addresses.
 *
 * Pure string work, because the path *is* the id: `specs/feeding/spec.md` is the specification
 * named `specs/feeding`, and `decisions/one-write.md` is the decision named
 * `decisions/one-write`. Nothing has to be consulted to know that, which is the whole point of
 * path identity — and it is why publishing needs no flag saying where a document goes.
 *
 * Returns undefined for a shape no area could hold: nothing at all, or a bare file where the
 * area keeps folders.
 */
export function locate(path: string): Located | undefined {
  const parts = path.split('/').filter((part) => part !== '');
  const [area, ...rest] = parts;
  if (area === undefined || rest.length === 0) return undefined;

  const bundled = AREAS.find((a) => a.name === area)?.bundled ?? false;
  if (bundled) {
    const [name, ...within] = rest;
    if (name === undefined || within.length !== 1) return undefined;
    return { area, name, file: within[0] as string, node: qualify(area, name) };
  }

  if (rest.length !== 1) return undefined;
  const file = rest[0] as string;
  const name = file.endsWith('.md') ? file.slice(0, -'.md'.length) : file;
  return { area, name, file, node: qualify(area, name) };
}

/**
 * The bare name, from either form.
 *
 * A field that admits exactly one area takes a bare name — `capability: billing` can only mean
 * a capability, so there is nothing for a prefix to disambiguate. The qualified form is still
 * accepted wherever a person types one, because somebody who has read a path will type the path.
 *
 * A *different* area's prefix is left alone rather than stripped: `capabilities/x` given where a
 * change is expected stays wrong, and is refused by name instead of silently resolving to `x`.
 */
export function unqualify(area: string, given: string): string {
  const prefix = `${area}/`;
  return given.startsWith(prefix) ? given.slice(prefix.length) : given;
}
