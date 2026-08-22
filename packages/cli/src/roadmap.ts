/**
 * `molly roadmap new "<title>" [--capability <name>]`
 *
 * Writes one document and stops, exactly as `molly capability new` does — an entry has no
 * lifecycle, so nothing is recorded and there is no state for anything to move.
 *
 * **It models a note, not a backlog.** No `needs:`, no ordering between entries, nothing that
 * computes what may be started. That is a planning tool, and a corpus wanting one can put
 * anything it likes in this directory; what the tool owns is that an entry has a name every
 * other command can take, and that the plan and the knowledge base cannot silently disagree
 * about whether something has shipped — which is `--realises` on a change and the finding
 * `molly status` makes when a realised entry is still sitting there.
 */

import { BUILT_IN_TEMPLATES, CAPABILITIES, ROADMAP, unqualify } from '@mollyguard/core';
import { Corpus, readCapabilities, writeRoadmapEntry } from '@mollyguard/store';
import { langFor } from './lang';
import { nameFor } from './naming';
import { dim, fail, green, info, teal } from './ui';

export interface NewEntryOptions {
  readonly title: string;
  readonly name?: string | undefined;
  readonly capability?: string | undefined;
  /** As typed. Resolved against the corpus when absent. */
  readonly lang?: string | undefined;
}

export async function newRoadmapCommand(
  corpus: Corpus,
  options: NewEntryOptions,
): Promise<number> {
  const { root, dir } = corpus;
  if (!options.title.trim()) {
    fail('molly roadmap new "<title>"', 'The title is the intent, in one line.');
  }

  const slug = await nameFor(corpus, ROADMAP, options.title, options.name);

  // Checked when given, like a change's. Unlike a change's it is optional and stays optional at
  // every later point: an entry is a note, and refusing one for naming a capability nobody has
  // written yet would refuse the ordinary order of planning.
  let capability: string | undefined;
  if (options.capability !== undefined) {
    capability = unqualify(CAPABILITIES, options.capability);
    const { capabilities } = await readCapabilities(root);
    if (!capabilities.some((known) => known.slug === capability)) {
      fail(
        `no capability named "${capability}"`,
        capabilities.length === 0
          ? 'there are none yet — write one first: `molly capability new "<title>"`'
          : `one of: ${capabilities.map((c) => c.slug).join(', ')}`,
      );
    }
  }

  const lang = await langFor(corpus, options.lang);

  const written = await writeRoadmapEntry(
    root,
    slug,
    { title: options.title, lang, capability },
    BUILT_IN_TEMPLATES,
  );

  if ('collision' in written) {
    fail(`${written.collision} already exists`, 'Pass --name <name> to choose a different one.');
  }

  info(`${green('+')} ${teal(written.node)} ${dim(`${dir}/${written.file}`)}`);
  info();
  info(dim('  what is meant to be true later, and why it is not a change yet'));
  info(dim(`  \`molly change new "<title>" --realises ${written.slug}\` when it becomes one`));
  return 0;
}
