/**
 * `molly capability new`
 *
 * Writes one document and stops. A capability is a grouping rather than a claim about the
 * product, so no change alters one and nothing here records anything: the transition ledger is
 * a record of lifecycle events, and this document has none.
 *
 * What the command buys over writing the file by hand — which the README says is fine — is a
 * name minted by the same rule as every other name, a record at the top, and the sections
 * somebody fills in.
 */

import { BUILT_IN_TEMPLATES, CAPABILITIES } from '@mollyguard/core';
import { Corpus, writeCapability } from '@mollyguard/store';
import { langFor } from './lang';
import { nameFor } from './naming';
import { dim, fail, green, info, teal } from './ui';

export interface NewCapabilityOptions {
  readonly title: string;
  readonly name?: string | undefined;
  /** As typed. Resolved against the corpus when absent. */
  readonly lang?: string | undefined;
}

export async function newCapabilityCommand(
  corpus: Corpus,
  options: NewCapabilityOptions,
): Promise<number> {
  const { root, dir } = corpus;
  if (!options.title.trim()) {
    fail('molly capability new "<title>"', 'The title is what every listing shows.');
  }

  const slug = await nameFor(corpus, CAPABILITIES, options.title, options.name);

  const lang = await langFor(corpus, options.lang);

  const written = await writeCapability(
    root,
    slug,
    { title: options.title, lang },
    BUILT_IN_TEMPLATES,
  );

  if ('collision' in written) {
    fail(`${written.collision} already exists`, 'Pass --name <name> to choose a different one.');
  }

  info(`${green('+')} ${teal(written.node)} ${dim(`${dir}/${written.file}`)}`);
  info();
  info(dim('  A grouping, not a claim — no change alters one, and it has no state.'));
  info(dim('  Say where the edge is: a capability with no boundary collects everything.'));
  info();
  info(dim(`  File work under it: molly change new "<title>" --capability ${written.slug}`));
  return 0;
}
