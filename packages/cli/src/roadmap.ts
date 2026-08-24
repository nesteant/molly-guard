/**
 * `molly roadmap new "<title>"`
 *
 * Writes one document and stops, exactly as `molly capability new` does — a slice has no
 * lifecycle, so nothing is recorded and there is no state for anything to move.
 *
 * **A slice, not a note.** One document holds a body of planned work: what it is for, the
 * features in it in the order they are wanted, what has been decided, and what is done. The
 * area held one note per idea until it was used for the first time, and sixteen notes with the
 * ordering in nobody's reach is not a plan.
 *
 * **The shape is written and taught, never checked.** The template puts the headings there so a
 * slice is born readable, and the `molly-roadmap` skill teaches an agent to read one and draft
 * the next change from it. Nothing between the two is parsed: the order is an argument, and the
 * reader that can act on an argument is a model rather than the engine.
 *
 * **It still models no backlog.** No `needs:`, no `order:`, no `priority:`, nothing that computes
 * what may be started. Those make it a planning tool competing with the ones a team already has.
 * What the tool owns is that a slice has a name every other command can take, and that the plan
 * and the knowledge base cannot silently disagree about what has shipped — which is `--realises`
 * on a change and the finding `molly status` makes about a slice its changes have published.
 *
 * **No `--capability`.** A slice crosses them by design; see `RoadmapRecord`.
 */

import { BUILT_IN_TEMPLATES, ROADMAP } from '@mollyguard/core';
import { Corpus, writeRoadmapEntry } from '@mollyguard/store';
import { langFor } from './lang';
import { nameFor } from './naming';
import { dim, fail, green, info, teal } from './ui';

export interface NewEntryOptions {
  readonly title: string;
  readonly name?: string | undefined;
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

  const lang = await langFor(corpus, options.lang);

  const written = await writeRoadmapEntry(
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
  info(dim('  what this slice is for, the features in order, what is decided, what is done'));
  info(dim(`  \`molly change new "<title>" --realises ${written.slug}\` for each feature in it`));
  return 0;
}
