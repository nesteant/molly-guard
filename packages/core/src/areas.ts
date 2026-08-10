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
  /** Where a document goes when its lifecycle reaches the terminal state. */
  readonly archiveInto?: string;
}

export const AREAS: readonly Area[] = [
  {
    name: 'capabilities',
    describes: 'what the product is responsible for, and where the edges are',
    bundled: false,
  },
  {
    name: 'specs',
    describes: 'accumulated truth: the business specification and its architecture',
    bundled: true,
    entry: 'spec.md',
  },
  {
    name: 'decisions',
    describes: 'constraints that outlive any one change',
    bundled: false,
  },
  {
    name: 'roadmap',
    describes: 'intent that has not become a change yet',
    bundled: false,
  },
  {
    name: 'changes',
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

/** The area an archive directory holds, or undefined if it is not an archive. */
export function archivedArea(directory: string): string | undefined {
  return AREAS.find((a) => a.archiveInto === directory)?.name;
}
