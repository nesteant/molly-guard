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
  // bundle behind — the same property the collision check has, and the same reason for it.
  const capability =
    options.capability === undefined ? undefined : await requireCapability(root, options.capability);

  // Checked the same way and for the same reason: the moment to catch a typo is while the author
  // is still at the terminal. `molly status` catches the other direction, where the entry is
  // retired later and the reference is left pointing at nothing.
  const realises =
    options.realises === undefined ? undefined : await requireEntry(root, options.realises);

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
  // to file a new one under. Reported rather than refused, because either half can be decided
  // later and neither has to be known while the bundle is being created.
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
 * The roadmap entry this change realises, checked against what is on disk.
 *
 * An entry is a note rather than a governed unit, so this refuses a name that is not there and
 * nothing more — it does not ask whether the entry is ready, or whether anything it mentions has
 * shipped first. Ordering planned work against itself is a planning tool's job.
 */
async function requireEntry(root: string, given: string): Promise<string> {
  const slug = unqualify(ROADMAP, given);
  const { entries } = await readRoadmap(root);
  if (entries.some((entry) => entry.slug === slug)) return slug;

  fail(
    `no roadmap entry named "${slug}"`,
    entries.length === 0
      ? `there are none — an entry is a document you write in ${ROADMAP}/`
      : `one of: ${entries.map((e) => e.slug).join(', ')}`,
  );
}

/**
 * The capability this work is filed under, checked against what is on disk.
 *
 * Refused rather than reported, because unlike `alters` there is something to check against:
 * a capability exists or it does not. The moment to catch a typo is while the author is still
 * at the terminal — `molly status` catches the other case, where the capability is deleted
 * afterwards.
 */
async function requireCapability(root: string, given: string): Promise<string> {
  const slug = unqualify(CAPABILITIES, given);
  const { capabilities } = await readCapabilities(root);
  if (capabilities.some((capability) => capability.slug === slug)) return slug;

  fail(
    `no capability named "${slug}"`,
    capabilities.length === 0
      ? 'there are none yet — write one first: `molly capability new "<title>"`'
      : `one of: ${capabilities.map((c) => c.slug).join(', ')}, or \`molly capability new "<title>"\``,
  );
}
