/**
 * Allocating the next name in an area.
 *
 * The half of a naming policy that cannot be pure: finding out which numbers are taken is a
 * directory scan. What it scans is the point — **a number is never reused, and "taken" is a
 * wider question than "is on disk right now."**
 *
 * Three places are asked, because each remembers something the others have forgotten:
 *
 * - the area itself, which holds what is in flight;
 * - its archive, because a published change moved to `history/` and its number went with it;
 * - the transition ledger, which is the only one of the three that survives a `rm -rf`. A change
 *   created and then deleted by hand leaves no directory anywhere and a `created` line for ever,
 *   and reusing its number would put two different pieces of work under one id in a record whose
 *   whole value is that it can be read back.
 *
 * The ledger is why this is worth the tool doing at all. A person reading `ls` sees the first
 * of the three.
 */

import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { area, matchName, needsOrdinal, renderName, unqualify } from '@mollyguard/core';
import { readHistory } from './history';
import { isDocumentName } from './layout';

/** The extension a file-holding area carries. */
const DOCUMENT = '.md';

/**
 * The name this slug gets in this area, under this pattern.
 *
 * A pattern asking for no ordinal needs no scan and no I/O beyond what the caller already did.
 */
export async function allocateName(
  root: string,
  areaName: string,
  pattern: string,
  slug: string,
): Promise<string> {
  if (!needsOrdinal(pattern)) return renderName(pattern, { slug });

  const taken = await takenOrdinals(root, areaName, pattern);
  const next = taken.size === 0 ? 1 : Math.max(...taken) + 1;
  return renderName(pattern, { slug, ordinal: next });
}

/**
 * Every ordinal this area has ever handed out, as far as anything still records it.
 *
 * Names that do not match the pattern are not in it — they are the corpus's own history, minted
 * before the policy existed, and a scan that refused them could not read the directory it is
 * meant to be counting.
 */
export async function takenOrdinals(
  root: string,
  areaName: string,
  pattern: string,
): Promise<ReadonlySet<number>> {
  const found = new Set<number>();
  const holds = area(areaName);

  const add = (name: string): void => {
    const parts = matchName(pattern, name);
    if (parts?.ordinal !== undefined) found.add(parts.ordinal);
  };

  const directories = [areaName, ...(holds?.archiveInto === undefined ? [] : [holds.archiveInto])];
  for (const directory of directories) {
    const path = join(root, directory);
    if (!existsSync(path)) continue;

    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (!isDocumentName(entry.name)) continue;
      // A bundled area holds folders and one holding files holds `<name>.md`; either way the
      // name is what is left once the extension is off.
      add(entry.name.endsWith(DOCUMENT) ? entry.name.slice(0, -DOCUMENT.length) : entry.name);
    }
  }

  // The one that outlives deletion. Every node the ledger has ever mentioned in this area
  // counts as taken, whether or not anything is still on disk under that name.
  const history = await readHistory(root);
  for (const event of history.events) {
    if (!event.node.startsWith(`${areaName}/`)) continue;
    add(unqualify(areaName, event.node));
  }

  return found;
}
