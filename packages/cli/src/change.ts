/**
 * `molly change new`
 *
 * Creates the bundle and stops. It asks nothing and checks nothing: the four documents are
 * written with the sections they are for, and a person fills them in.
 *
 * No template ships a requirement format. Whatever the template shows is what the corpus
 * fills up with, so a template that opened on Given/When/Then would make that the corpus's
 * form for ever — a slice supplies the form, and core supplies the sections.
 */

import {
  BUILT_IN_TEMPLATES,
  CAPABILITIES,
  CHANGES,
  ROADMAP,
  CHANGE_KINDS,
  ChangeKind,
  INITIAL_STATE,
  isChangeKind,
  qualify,
  unqualify,
} from '@mollyguard/core';
import {
  Corpus,
  appendEvent,
  readCapabilities,
  readRoadmap,
  writeChangeBundle,
} from '@mollyguard/store';
import { identity } from './identity';
import { langFor } from './lang';
import { nameFor } from './naming';
import { Choice, chooseFrom } from './pick';
import { bold, dim, fail, green, info, teal } from './ui';

export interface NewChangeOptions {
  readonly title: string;
  readonly name?: string | undefined;
  readonly kind?: string | undefined;
  /** Bare or qualified, as typed. Resolved before anything is written. */
  readonly capability?: string | undefined;
  /** The roadmap entry this is the specific form of. */
  readonly realises?: string | undefined;
  /** Knowledge-base documents this alters. Empty for a change that introduces new truth. */
  readonly alters: readonly string[];
  /** As typed. Resolved against the corpus when absent. */
  readonly lang?: string | undefined;
  /** ISO-8601. Read by the caller, because core and store are handed their timestamps. */
  readonly at: string;
}

export async function newChangeCommand(
  corpus: Corpus,
  options: NewChangeOptions,
): Promise<number> {
  const { root, dir } = corpus;
  if (!options.title.trim()) {
    fail('molly change new "<title>"', 'The title is what every listing shows.');
  }

  const kind: ChangeKind = options.kind === undefined ? 'feature' : requireKind(options.kind);
  const slug = await nameFor(corpus, CHANGES, options.title, options.name);

  // Resolved before anything is written, so a name that does not exist leaves no half-made
  // bundle behind — the same property the collision check has, and the same reason for it. And
  // asked before the write for the same reason: a person who walks away from the question leaves
  // nothing behind either.
  const capability = await resolveCapability(root, options.capability, options.alters.length);

  // Resolved the same way and for the same reason: the moment to catch a typo is while the author
  // is still at the terminal. `molly status` catches the other direction, where the entry is
  // retired later and the reference is left pointing at nothing.
  const realises = await resolveEntry(root, options.realises);

  const lang = await langFor(corpus, options.lang);

  const written = await writeChangeBundle(
    root,
    slug,
    {
      title: options.title,
      lang,
      kind,
      capability,
      realises,
      alters: options.alters,
    },
    BUILT_IN_TEMPLATES,
  );

  if ('collision' in written) {
    fail(`${written.collision} already exists`, 'Pass --name <name> to choose a different one.');
  }

  // Creation is recorded like every later move, so the first state is backed by a line rather
  // than by the absence of them — and so a bundle with no events at all becomes a signal:
  // something arrived without going through the tool.
  await appendEvent(root, {
    node: qualify(CHANGES, written.slug),
    at: options.at,
    kind: 'created',
    to: INITIAL_STATE,
    by: identity(),
  });

  info(`${green('+')} ${teal(qualify(CHANGES, written.slug))} ${dim(`${dir}/${written.dir}/`)}`);
  info();
  info(`  ${dim('change.md')}   what this change makes true, and why`);
  info(`  ${dim('plan.md')}     how it will be built`);
  info(`  ${dim('tasks.md')}    the work, in order`);
  info(`  ${dim('tests.md')}    what will prove it`);
  info();

  // An empty `alters` is the normal answer for a change that introduces new truth, so it is
  // not remarked on by itself. What has no answer at all is a change that alters nothing *and*
  // is filed nowhere: publishing would have neither a document to write into nor a capability
  // to file a new one under.
  //
  // Reported rather than refused, and it is now the *second* time the question is put — a person
  // at a terminal was offered the capabilities above and declined, which is a real answer. This
  // is what they get for declining, and what a scripted caller that was never asked gets too.
  if (options.alters.length === 0 && capability === undefined) {
    info(`  ${bold('nothing to publish into yet')} ${dim('— this alters nothing and is filed nowhere')}`);
    info(dim(`  add \`capability:\` for new truth, or \`alters:\` for what it changes`));
    info(dim(`  edit ${dir}/${written.dir}/change.md, or pass --capability / --alters`));
    info();
  }

  info(dim(`Fill them in. Nothing reads the prose — write it for whoever reviews the change.`));
  return 0;
}

function requireKind(value: string): ChangeKind {
  if (isChangeKind(value)) return value;
  fail(`"${value}" is not a kind of change`, `one of: ${CHANGE_KINDS.join(', ')}`);
}

/**
 * A scanned document, as something a person can be offered.
 *
 * Both areas store the title inside the record and the name outside it, so this is the one
 * shape conversion rather than four inline copies of it.
 */
function offered(
  items: readonly { readonly slug: string; readonly record: { readonly title: string } }[],
): readonly Choice[] {
  return items.map((item) => ({ slug: item.slug, title: item.record.title }));
}

/**
 * The roadmap entry this change realises, resolved against what is on disk.
 *
 * An entry is a note rather than a governed unit, so this refuses a name that is not there and
 * nothing more — it does not ask whether the entry is ready, or whether anything it mentions has
 * shipped first. Ordering planned work against itself is a planning tool's job.
 *
 * Offered when it was not given, per `decisions/a-command-that-needs-a-choice-offers-it`: the
 * corpus can list every entry, so a person is asked which one rather than left to discover that
 * the flag existed. Declining is the ordinary answer — most changes realise nothing — so with
 * nobody reading input this stays silent instead of refusing.
 */
async function resolveEntry(root: string, given: string | undefined): Promise<string | undefined> {
  const { entries } = await readRoadmap(root);
  const known = (slug: string): boolean => entries.some((entry) => entry.slug === slug);

  if (given !== undefined) {
    const slug = unqualify(ROADMAP, given);
    if (known(slug)) return slug;
    return chooseFrom(offered(entries), {
      message: 'Which does it realise?',
      usage: `no roadmap entry named "${slug}"`,
      empty: `there are none — an entry is a document you write in ${ROADMAP}/`,
      problem: `no roadmap entry named "${slug}"`,
      decline: 'none of these — it realises nothing planned',
    });
  }

  // Nothing planned, so there is nothing to offer and nothing missing. Silence rather than a
  // refusal: a corpus with an empty roadmap is the ordinary starting state, not a mistake.
  if (entries.length === 0) return undefined;

  return chooseFrom(offered(entries), {
    message: 'Which roadmap entry does it realise?',
    usage: 'molly change new "<title>" --realises <entry>',
    empty: `there are none — an entry is a document you write in ${ROADMAP}/`,
    decline: 'none of these — it realises nothing planned',
  });
}

/**
 * The capability this work is filed under, resolved against what is on disk.
 *
 * Refused rather than reported when it is given and wrong, because unlike `alters` there is
 * something to check against: a capability exists or it does not. The moment to catch a typo is
 * while the author is still at the terminal — `molly status` catches the other case, where the
 * capability is deleted afterwards.
 *
 * Offered when it was not given, and this is the case the rule was written for. Filing is what
 * decides whether the change can publish new truth at all, and the old behaviour — write the
 * bundle, print a note, exit `0` — put that question to the author days later through
 * `molly publish`, about a decision they had stopped thinking about.
 *
 * **Not asked when the change already alters something.** A change that alters existing documents
 * publishes into them, and each already declares its own capability, so there is nothing for this
 * one to decide. Asking anyway would be a menu with no consequence, which teaches people to
 * dismiss menus.
 */
async function resolveCapability(
  root: string,
  given: string | undefined,
  alters: number,
): Promise<string | undefined> {
  const { capabilities } = await readCapabilities(root);
  const known = (slug: string): boolean => capabilities.some((c) => c.slug === slug);
  const empty =
    'there are none yet — write one first: `molly capability new "<title>"`';
  const decline = 'none of these — file it later';

  if (given !== undefined) {
    const slug = unqualify(CAPABILITIES, given);
    if (known(slug)) return slug;
    return chooseFrom(offered(capabilities), {
      message: 'Which capability?',
      usage: `no capability named "${slug}"`,
      empty,
      problem: `no capability named "${slug}"`,
      decline,
    });
  }

  if (alters > 0) return undefined;
  // Nothing to offer. The note printed after the write already names the remedy, and refusing
  // here would refuse the first change in a corpus for being first.
  if (capabilities.length === 0) return undefined;

  return chooseFrom(offered(capabilities), {
    message: 'Which capability is this filed under?',
    usage: 'molly change new "<title>" --capability <name>',
    empty,
    decline,
  });
}
