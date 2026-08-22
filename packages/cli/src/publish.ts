/**
 * `molly publish <change> [--dry-run]`
 *
 * Files the documents a change carries into the knowledge base, archives the bundle, and
 * records that it happened. **It writes no prose and composes no text.** Every byte of every
 * published document was written by a person, or by an agent acting as one; the tool's
 * contribution is that nothing arrives unverified and unrecorded.
 *
 * Which makes the split worth stating. Whoever drafts compares the change against the base and
 * writes the new documents — and cannot be trusted, because it produces a proposal rather than
 * a fact. This command verifies that something real was written and files it — and cannot judge
 * whether the text is right. Whoever reads the diff accepts or rejects — and is replaced by
 * neither of the other two.
 *
 * So it approves nothing. It writes into the working tree and stops, which is why it behaves
 * identically at a terminal, in a pipeline, and inside a server.
 *
 * Everything is checked before anything is written. A half-applied publication leaves the base
 * holding part of a change with nothing to say which part — the precise state this command
 * exists to prevent, produced by the command meant to prevent it.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  AREAS,
  CHANGES,
  Located,
  TERMINAL,
  area,
  CHANGE_PUBLISH,
  isSlug,
  locate,
  matchName,
  needsOrdinal,
  renderName,
  stateOf,
  unqualify,
} from '@mollyguard/core';
import {
  Corpus,
  ProposedDocument,
  appendEvent,
  applyPublishSet,
  archiveChange,
  parseDocument,
  readCapabilities,
  readChanges,
  readHistory,
  readConfig,
  readPublishSet,
  patternFor,
  takenOrdinals,
  writeDeclaredState,
} from '@mollyguard/store';
import { identity } from './identity';
import { chooseChange } from './pick';
import { bold, dim, fail, green, info, teal, warn } from './ui';

export interface PublishOptions {
  readonly change: string | undefined;
  readonly dryRun: boolean;
  /** ISO-8601. Read by the caller, because core is handed its timestamps and never the clock. */
  readonly at: string;
}

/** The areas a change may write into, from the table rather than from a list kept here. */
const publishable = (): readonly string[] => AREAS.filter((a) => a.publishable).map((a) => a.name);

export async function publishCommand(
  corpus: Corpus,
  options: PublishOptions,
): Promise<number> {
  const { root, dir } = corpus;
  const scanned = await readChanges(root);
  for (const line of scanned.unreadable) warn(dim(line));
  if (scanned.bundles.length === 0) {
    fail('there is nothing to publish', 'write one first: `molly change new "<title>"`');
  }

  const history = await readHistory(root);
  for (const line of history.unreadable) warn(dim(line));

  // Picked when it was not named, like `move`. Publishing is the one write that
  // cannot be undone from inside the tool, so seeing the change and its state at the moment of
  // choosing is worth more here than anywhere else.
  let slug: string;
  if (options.change === undefined) {
    slug = (
      await chooseChange(
        scanned.bundles.map((b) => ({
          node: b.node,
          slug: b.slug,
          title: b.record.title,
          state: stateOf(history.events, b.node),
        })),
        'molly publish <change>',
      )
    ).slug;
  } else {
    slug = unqualify(CHANGES, options.change);
  }

  const bundle = scanned.bundles.find((b) => b.slug === slug);
  if (bundle === undefined) {
    fail(
      `no change named "${slug}"`,
      `one of: ${scanned.bundles.map((b) => b.slug).join(', ')}`,
    );
  }

  const from = stateOf(history.events, bundle.node);

  // The same refusal `move` makes, for a stronger reason: publishing out of a disputed state
  // would write the knowledge base from a disagreement nobody has resolved.
  if (bundle.declared !== undefined && bundle.declared !== from) {
    fail(
      `${slug} says it is ${bundle.declared}, and the ledger says ${from}`,
      'The ledger is the record. Reconcile `state:` in change.md before publishing.',
    );
  }

  const into = area(CHANGES)?.archiveInto;
  if (into === undefined) fail('changes have nowhere to be archived', 'this is a defect in the tool');
  if (existsSync(join(root, into, slug))) {
    fail(`${into}/${slug} already exists`, 'that change has been published before');
  }

  const proposed = await readPublishSet(root, slug);
  for (const line of proposed.unreadable) warn(dim(line));

  if (!proposed.present) {
    fail(
      `${bundle.node} carries no publish/ folder`,
      `write what it should produce in ${dir}/${CHANGES}/${slug}/publish/, mirroring the corpus — e.g. publish/specs/<name>/spec.md`,
    );
  }
  // Refused rather than reported, unlike everywhere else a scan cannot read something. A listing
  // that skips what it cannot read is merely incomplete; a *publication* that skips it writes
  // part of a change into the knowledge base and calls the change finished, which is the one
  // outcome this command exists to prevent.
  if (proposed.unreadable.length > 0) {
    fail(
      `${proposed.unreadable.length} document(s) in ${bundle.node}/publish/ could not be read`,
      'a publication is all of its documents or none of them — nothing has been written',
    );
  }
  if (proposed.documents.length === 0) {
    fail(`${bundle.node}/publish/ is empty`, 'publishing nothing is not a way of publishing');
  }

  const known = new Set((await readCapabilities(root)).capabilities.map((c) => c.slug));
  const located = proposed.documents.map((document) => ({ document, ...verify(document, known) }));

  // A bundled document arriving without the file that carries its record is a document nothing
  // can read — and it would be reported as unreadable for ever afterwards. Checked across the
  // set rather than per document, because the entry may be its sibling in the same publication.
  for (const { at } of located) {
    const holds = area(at.area);
    if (holds?.bundled !== true || holds.entry === undefined) continue;
    if (existsSync(join(root, at.area, at.name, holds.entry))) continue;
    if (located.some((other) => other.at.node === at.node && other.at.file === holds.entry)) continue;

    fail(
      `${at.node} is new and brings no ${holds.entry}`,
      `a new document in ${at.area}/ must carry ${holds.entry}, which holds its record`,
    );
  }

  // A name the corpus's own policy would not have minted.
  //
  // The `new` commands mint through `nameFor`, so a change, a capability and a roadmap entry all
  // get the corpus's shape. A published document does not: its name is the folder the author
  // wrote inside `publish/`, because the path is the id and the path is the instruction. So a
  // corpus that orders an area had its ordering apply everywhere except the area the documents
  // actually land in — a numbered decision log being the case that wants it most.
  //
  // **Refused, and never renamed.** Writing `publish/decisions/retries/` into
  // `decisions/0007-retries/` would be the tool quietly filing a document somewhere other than
  // where it was addressed — and it would mint a *second* document the moment somebody wrote
  // `retries` meaning to replace `0003-retries`. So the name it would have to be is named, and
  // the author renames a folder.
  //
  // Only new documents are asked. One that replaces an existing document is already filed, and
  // its name is not this change's question — which is also what lets a corpus adopt a pattern
  // without renaming what it already has.
  const policy = await readConfig(corpus.config);
  for (const { document, at } of located) {
    if (document.replaces) continue;
    // A bundled document is new when its *folder* is. `replaces` is per file, and a second file
    // arriving into a folder already in the base is not a new document — refusing there would
    // refuse an author for adding an `architecture.md` to a specification a year old.
    if (area(at.area)?.bundled === true && existsSync(join(root, at.area, at.name))) continue;

    const pattern = patternFor(policy, at.area);
    if (!needsOrdinal(pattern) || matchName(pattern, at.name) !== undefined) continue;

    const ordinal = Math.max(0, ...(await takenOrdinals(root, at.area, pattern))) + 1;
    fail(
      `${at.node} is not the name this corpus mints`,
      `${at.area}/ is named "${pattern}" — rename the folder to ${renderName(pattern, { slug: at.name, ordinal })} in ${dir}/${CHANGES}/${slug}/${CHANGE_PUBLISH}/${at.area}/`,
    );
  }

  // New truth, and nowhere to read it.
  //
  // A specification is read as part of a capability — that is what a capability is for, and it
  // is how a corpus that no longer fits in one sitting stays readable. So a *new* specification
  // naming none is accumulated truth that is present and unreachable: nothing points at it, no
  // slice contains it, and nobody will know to look. That is worse than the document being
  // absent, because absence is visible.
  //
  // It was refused nowhere until now. `molly change new` reports it and moves on, which is
  // right — either half can be worked out after the bundle exists, and refusing at creation
  // would refuse an author for not yet knowing something they are about to decide. Publication
  // is the moment it has to be known, and the last one at which refusing is free.
  //
  // Only *new* documents, and only in an area read by capability. A document replacing one
  // already in the base is not being filed anywhere — it is already filed, and where it sits is
  // not this change's question. `alters:` is deliberately not consulted: it names documents
  // that exist, so it can say where an edit lands but never where a new document belongs.
  // The same refusal through the other door, and it has to be here rather than left to the
  // listing. `molly status` reports a change filed under a capability that does not exist, and
  // fails for it — but only while the change is in flight. Publishing archives the bundle, and
  // nothing scans the archive for dangling references, so a name that was merely wrong before
  // becomes a specification in the base filed under nothing, permanently, with the finding that
  // would have said so now sitting in a directory nothing checks. Refusing at the write is the
  // last moment the answer is still recoverable.
  const filedUnder = bundle.record.capability;
  if (filedUnder !== undefined && !known.has(filedUnder)) {
    fail(
      `${bundle.node} is filed under "${filedUnder}", which does not exist`,
      known.size === 0
        ? 'write it first: `molly capability new "<title>"`'
        : `one of: ${[...known].join(', ')}, or \`molly capability new "<title>"\``,
    );
  }

  const unfiled = located.filter(
    (l) => !l.document.replaces && area(l.at.area)?.grouped === true && l.capability === undefined,
  );
  if (unfiled.length > 0 && filedUnder === undefined) {
    fail(
      `${unfiled.map((l) => l.at.node).join(', ')} would be filed under no capability`,
      `a new document in a grouped area is read as part of a capability, and names none — add \`capability:\` to ${dir}/${CHANGES}/${slug}/change.md, or to the document itself`,
    );
  }

  // The check that catches a drafter — a person or an agent — reporting work it did not do.
  // Byte-level on purpose: the tool has no opinion about text, and "these differ" is the
  // strongest true statement it can make about a body it refuses to read.
  if (proposed.documents.every((document) => document.identical)) {
    fail(
      `nothing in ${bundle.node}/publish/ differs from the knowledge base`,
      'every document is byte-identical to what is already there, so publishing would record work that did not happen',
    );
  }

  const created = proposed.documents.filter((d) => !d.replaces);
  const replaced = proposed.documents.filter((d) => d.replaces);

  if (options.dryRun) {
    info(`${dim('~')} ${teal(bundle.node)} ${dim('would publish')}`);
    report(created, replaced, into, slug, dir);
    info();
    info(dim('  nothing was written'));
    return 0;
  }

  // Written, recorded, projected, then archived. If a later step fails the earlier facts are
  // still true, and saying so beats pretending they are not.
  await applyPublishSet(root, proposed.documents);

  const by = identity();
  if (from !== TERMINAL) {
    await appendEvent(root, {
      node: bundle.node,
      at: options.at,
      kind: 'transition',
      from,
      to: TERMINAL,
      by,
    });
  }

  const problem = await writeDeclaredState(root, slug, TERMINAL);
  if (problem !== undefined) {
    warn(`${dim(`recorded, but the document still says ${from}: ${problem}`)}`);
  }

  const failure = await archiveChange(root, slug, into);
  if (failure !== undefined) {
    warn(`${dim(`published and recorded, but the bundle was not archived: ${failure}`)}`);
    return 1;
  }

  info(`${green('*')} ${teal(bundle.node)} ${dim(`published — ${from} → ${TERMINAL}, ${by}`)}`);
  report(created, replaced, into, slug, dir);
  return 0;
}

function report(
  created: readonly ProposedDocument[],
  replaced: readonly ProposedDocument[],
  into: string,
  slug: string,
  dir: string,
): void {
  info();
  for (const document of created) info(`  ${green('+')} ${document.path}`);
  for (const document of replaced) {
    info(`  ${document.identical ? dim('=') : bold('~')} ${document.path}`);
  }
  info(`  ${dim(`→ ${dir}/${into}/${slug}/`)} ${dim('the bundle, kept whole')}`);
}

/** Where a document lands, and what it says it is filed under. */
interface Verified {
  readonly at: Located;
  /** Its own `capability:`, where it declares one. Already checked to exist. */
  readonly capability: string | undefined;
}

/**
 * Everything checkable about one proposed document, none of which reads its prose.
 *
 * Each refusal names the remedy rather than the rule, and each fires before anything has been
 * written — so a refused publication leaves the corpus exactly as it was.
 */
function verify(document: ProposedDocument, capabilities: ReadonlySet<string>): Verified {
  const at = locate(document.path);
  if (at === undefined) {
    fail(
      `publish/${document.path} is not a shape the corpus holds`,
      'a bundled area takes <area>/<name>/<file>, one holding files takes <area>/<name>.md',
    );
  }

  const holds = area(at.area);
  if (holds === undefined) {
    fail(`publish/${document.path} names no area`, `one of: ${AREAS.map((a) => a.name).join(', ')}`);
  }
  if (holds.publishable !== true) {
    fail(
      `publish/${document.path} is not a change's to write`,
      `${at.area}/ is written directly. A change publishes into: ${publishable().join(', ')}`,
    );
  }
  if (!isSlug(at.name)) {
    fail(
      `"${at.name}" is not a usable name`,
      'lowercase ASCII, hyphenated, so a name survives translation',
    );
  }

  const parsed = parseDocument(document.text);
  if ('unreadable' in parsed) {
    fail(`publish/${document.path}: ${parsed.unreadable}`, 'the record at the top must parse');
  }

  const capability = parsed.fields['capability'];
  if (typeof capability === 'string' && !capabilities.has(capability)) {
    fail(
      `${at.node} names capability "${capability}", which does not exist`,
      capabilities.size === 0
        ? 'write one first: `molly capability new "<title>"`'
        : `one of: ${[...capabilities].join(', ')}`,
    );
  }

  return { at, capability: typeof capability === 'string' ? capability : undefined };
}
