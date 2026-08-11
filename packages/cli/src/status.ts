/**
 * `molly status [--json]`
 *
 * Where everything is. Every state on this table is folded from the ledger rather than read
 * off a document, so there is nothing here that could disagree with the log — a cached state
 * in frontmatter would eventually differ from it, and nothing would say which was right.
 *
 * **The corpus is read once and rendered twice.** A person gets a table; something automating
 * against this gets the same values as JSON. Two renderings of one gathered report rather than
 * two passes over the corpus, because a `--json` that walked the tree separately would be a
 * second answer to every question the table answers — the exact failure this tool exists to
 * prevent, committed by the command that reports it.
 *
 * The JSON is what makes the tool automatable at all. Exit codes say whether the corpus is
 * clean; they cannot say which change is in which state, and an orchestrator that had to scrape
 * a padded, coloured table would be reimplementing the fold against a format nothing promises
 * to keep.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  CHANGES,
  CHANGE_KINDS,
  STATES,
  State,
  TERMINAL,
  isRecorded,
  qualify,
  stateOf,
} from '@mollyguard/core';
import {
  CONFIG_FILE,
  readCapabilities,
  readChanges,
  readHistory,
  readArchivedChanges,
} from '@mollyguard/store';
import { amber, bold, dim, fail, info, red, teal, warn } from './ui';

/** What a change filed under nothing shows. Blank would read as a rendering that failed. */
const UNFILED = '—';

export interface StatusOptions {
  readonly json: boolean;
}

/**
 * What is wrong with the corpus, and whether it is wrong enough to fail.
 *
 * `fails` rather than a severity word, because there are exactly two behaviours and naming them
 * anything richer would invite a third that nothing acts on. A note is a true statement about
 * the corpus that is not a defect in it — a change predating the ledger is the only one so far,
 * and failing a build over history somebody never had is refusing the past.
 */
export interface Finding {
  readonly kind: 'unreadable' | 'drift' | 'dangling-capability' | 'unrecorded';
  /** The change it is about, where it is about one. */
  readonly change?: string;
  readonly message: string;
  readonly fails: boolean;
}

export interface ReportedChange {
  readonly name: string;
  /**
   * Qualified id: `changes/<name>`, always — including once the bundle has been archived.
   *
   * The ledger keys every event under the name a change had in flight and goes on doing so
   * after publication, so this is the string that correlates a listing with the record. It is
   * deliberately not where the files are: an archived bundle sits under `history/<name>`, which
   * `archived` says. Reporting the disk path here would hand a reader an id the ledger has
   * never heard of and no way to notice.
   */
  readonly node: string;
  /** Folded from the ledger. The one answer — never the document's `state:`. */
  readonly state: State;
  readonly kind: string;
  readonly capability: string | undefined;
  readonly title: string;
  /** Published and moved out of flight. Kept in the listing so the base reads whole. */
  readonly archived: boolean;
  /** What the document claims, where it claims anything. Equal to `state` unless it drifted. */
  readonly declared: State | undefined;
}

/**
 * The whole answer, and what a reader may rely on.
 *
 * **An absent field means nothing was declared, and is never written as null or empty string.**
 * That is the same rule the documents follow — a blank key reads as "answered, nothing" where
 * the truth is "not answered" — and it is stated here because a reader parsing this has no
 * document to check it against.
 *
 * `ok` is the exit code, said in the document. A reader that wants the data from a corpus with
 * findings in it should read this rather than branch on the process status, which is 1 for a
 * refusal as well.
 */
export interface Report {
  readonly corpus: string;
  readonly ok: boolean;
  readonly capabilities: readonly { readonly name: string; readonly title: string }[];
  readonly changes: readonly ReportedChange[];
  readonly findings: readonly Finding[];
}

export async function statusCommand(
  root: string,
  dir: string,
  options: StatusOptions = { json: false },
): Promise<number> {
  if (!existsSync(join(root, CONFIG_FILE))) {
    fail(`no corpus at ${dir}/`, 'run `molly init` first, or pass --root <dir>');
  }

  const report = await gather(root, dir);

  if (options.json) {
    // Findings go into the document rather than to stderr: a reader that asked for JSON asked
    // for all of it, and half the answer arriving on another stream is half an answer.
    info(JSON.stringify(report, null, 2));
    return report.ok ? 0 : 1;
  }

  for (const finding of report.findings) {
    if (finding.kind === 'unreadable') warn(dim(finding.message));
  }
  render(report, dir);
  return report.ok ? 0 : 1;
}

/**
 * Reads the corpus and says what it found.
 *
 * Everything both renderings need, and nothing either of them formats. Rendering below decides
 * how it looks; this decides what is true.
 */
async function gather(root: string, dir: string): Promise<Report> {
  const inFlight = await readChanges(root);
  const archived = await readArchivedChanges(root);
  const grouping = await readCapabilities(root);
  const history = await readHistory(root);

  const findings: Finding[] = [];

  // Something in `changes/` that could not be read, which **fails** — and used to depend on its
  // neighbours. A bundle with broken frontmatter exited 1 when it was the only change in the
  // corpus, through the "nothing else is here" branch below, and exited 0 the moment a readable
  // change sat beside it. The same damage gave a build two different answers depending on what
  // else happened to be there, which is the one property a gate may not have.
  //
  // It fails rather than reports because of what the listing does with it: a bundle that cannot
  // be read is dropped from the scan, so the inventory this command prints is *missing a change*
  // and says nothing about it having been left out. An orchestrator reading that answer acts on
  // a corpus it has not seen all of. Exiting 0 while a governed unit is invisible is the tool
  // vouching for something it could not look at.
  for (const message of [...inFlight.unreadable, ...archived.unreadable]) {
    findings.push({ kind: 'unreadable', message, fails: true });
  }

  // The same fact about the other areas, and it does not fail. Nothing is hidden by it: a
  // capability is named by its filename, so one whose record will not parse is still listed and
  // still resolves the references pointing at it, and the ledger is read leniently by design —
  // a line written before a field existed is understood rather than refused. Reported, because
  // what cannot be read is said out loud; not failed, because nothing is missing from the answer.
  for (const message of [...grouping.unreadable, ...history.unreadable]) {
    findings.push({ kind: 'unreadable', message, fails: false });
  }

  const known = new Set(grouping.capabilities.map((c) => c.slug));
  const changes: ReportedChange[] = [];

  for (const bundle of inFlight.bundles) {
    const state = stateOf(history.events, bundle.node);
    changes.push({
      name: bundle.slug,
      node: bundle.node,
      state,
      kind: bundle.record.kind,
      capability: bundle.record.capability,
      title: bundle.record.title,
      archived: false,
      declared: bundle.declared,
    });

    // A document's `state:` is a projection of the ledger. It can be edited by hand — which is
    // precisely the bypass worth catching — so the disagreement is named rather than resolved
    // silently in favour of either one.
    if (bundle.declared !== undefined && bundle.declared !== state) {
      findings.push({
        kind: 'drift',
        change: bundle.slug,
        message: `${bundle.slug} says ${bundle.declared}, the ledger says ${state}`,
        fails: true,
      });
    }

    // Creation is recorded, so a bundle the ledger has never heard of did not arrive through
    // the tool: written by hand, or a folder renamed with `mv`, which orphans everything
    // recorded under the old name. Reported rather than refused — a corpus predating this is
    // not broken, and failing a build over it would refuse somebody's history for existing.
    if (!isRecorded(history.events, bundle.node)) {
      findings.push({
        kind: 'unrecorded',
        change: bundle.slug,
        message: `the ledger has no record of ${bundle.slug}`,
        fails: false,
      });
    }

    // Declaring nothing is an answer. Declaring something that is not there is a broken
    // reference, and the author is long gone — so it is named rather than assumed to be a typo.
    const capability = bundle.record.capability;
    if (capability !== undefined && !known.has(capability)) {
      findings.push({
        kind: 'dangling-capability',
        change: bundle.slug,
        message: `${bundle.slug} is filed under ${capability}, which does not exist`,
        fails: true,
      });
    }
  }

  // Archived changes are done being read: listed so the base can be seen whole, and never
  // checked for drift — their state is settled and their bundle is sealed beside it.
  for (const bundle of archived.bundles) {
    changes.push({
      name: bundle.slug,
      node: qualify(CHANGES, bundle.slug),
      state: TERMINAL,
      kind: bundle.record.kind,
      capability: bundle.record.capability,
      title: bundle.record.title,
      archived: true,
      declared: bundle.declared,
    });
  }

  return {
    corpus: dir,
    ok: !findings.some((finding) => finding.fails),
    capabilities: grouping.capabilities.map((c) => ({ name: c.slug, title: c.record.title })),
    changes,
    findings,
  };
}

function render(report: Report, dir: string): void {
  const inFlight = report.changes.filter((change) => !change.archived);
  const archived = report.changes.filter((change) => change.archived);

  // Listed even when nothing points at one, because that is what every capability looks like on
  // the day it is made — and a listing that showed only the ones in use would hide exactly the
  // ones somebody needs reminding to use.
  if (report.capabilities.length > 0) {
    info();
    info(`  ${dim('capabilities')}  ${report.capabilities.map((c) => c.name).join(', ')}`);
  }

  if (report.changes.length === 0) {
    // Only the ones from `changes/`, which are exactly the failing ones. A capability that will
    // not load is worth reporting and is not a change — saying "1 change could not be read" over
    // it would name the wrong document and send somebody looking in the wrong directory.
    const unreadable = report.findings.filter((f) => f.kind === 'unreadable' && f.fails);
    // "Nothing here" and "nothing here could be read" are different facts, and saying the first
    // when the second is true tells somebody their corpus is empty while their work is sitting
    // in it unreadable.
    if (unreadable.length > 0) {
      info(`${red(`${unreadable.length} change(s) could not be read`)}, and nothing else is here`);
      info(dim('  fix what is reported above; nothing has been lost'));
      return;
    }
    // An empty table with headings reads as a broken query. Say the corpus is empty, and say
    // what puts something in it.
    info(`${dim('no changes yet')} — nothing is in flight, and nothing has been published`);
    info(dim(`  molly change new "<title>"`));
    return;
  }

  const state = Math.max(...STATES.map((s) => s.length));
  const kind = Math.max(...CHANGE_KINDS.map((k) => k.length));
  const name = Math.max(...report.changes.map((c) => c.name.length), 'change'.length);
  // Always shown, dash and all. A column that appeared only when something used it would make
  // the table's shape depend on the corpus, and a reader seeing none could not tell whether
  // nothing was filed or the tool had no such idea.
  const filed = Math.max(
    ...report.changes.map((c) => (c.capability ?? UNFILED).length),
    'capability'.length,
  );

  // The name leads, because it is the string every other command takes and a title need not
  // resemble it. Before this column existed, the only place a name was printed was a refusal.
  info();
  info(
    `  ${dim('change'.padEnd(name))}  ${dim('state'.padEnd(state))}  ${dim('kind'.padEnd(kind))}  ${dim('capability'.padEnd(filed))}  ${dim('title')}`,
  );

  const about = (change: string, kinds: readonly Finding['kind'][]): boolean =>
    report.findings.some((finding) => finding.change === change && kinds.includes(finding.kind));

  for (const change of inFlight) {
    const disagrees = about(change.name, ['drift']);
    const lost = about(change.name, ['dangling-capability']);
    const shown = change.state === TERMINAL ? bold(change.state.padEnd(state)) : teal(change.state.padEnd(state));
    const column = change.capability ?? UNFILED;
    info(
      `  ${change.name.padEnd(name)}  ${disagrees ? red(change.state.padEnd(state)) : shown}  ${dim(change.kind.padEnd(kind))}  ${lost ? red(column.padEnd(filed)) : dim(column.padEnd(filed))}  ${change.title}`,
    );
  }

  // Archived changes are dimmed throughout so nobody mistakes one for work in flight. Every
  // column still, because a row missing one reads as a rendering that failed rather than as a
  // change that is finished.
  for (const change of archived) {
    info(
      `  ${dim(change.name.padEnd(name))}  ${dim(TERMINAL.padEnd(state))}  ${dim(change.kind.padEnd(kind))}  ${dim((change.capability ?? UNFILED).padEnd(filed))}  ${dim(change.title)}`,
    );
  }
  info();

  const listing = (kind: Finding['kind']): readonly Finding[] =>
    report.findings.filter((finding) => finding.kind === kind);

  const unrecorded = listing('unrecorded');
  if (unrecorded.length > 0) {
    info(
      `  ${dim(`${unrecorded.length} change(s) the ledger has no record of: ${unrecorded.map((f) => f.change).join(', ')}`)}`,
    );
    info(dim('    written by hand, or a folder renamed outside the tool — history is kept by name'));
    info();
  }

  const drifted = listing('drift');
  if (drifted.length > 0) {
    info(`  ${amber('!')} ${drifted.length} change(s) disagree with the ledger`);
    for (const finding of drifted) info(`    ${dim(finding.message)}`);
    info(dim('    The ledger is the record. Correct `state:` in the document to match it.'));
    info();
  }

  // A reference that no longer resolves, which is what deleting or renaming a capability leaves
  // behind. Reported here rather than refused anywhere, because the document it breaks is one
  // people are told to edit by hand — but it fails, because a grouping that is quietly wrong is
  // worse than one that is missing.
  const dangling = listing('dangling-capability');
  if (dangling.length > 0) {
    info(`  ${amber('!')} ${dangling.length} change(s) name a capability that does not exist`);
    for (const finding of dangling) info(`    ${dim(finding.message)}`);
    info(dim('    Create it with `molly capability new`, or correct `capability:` in the change.'));
    info();
  }

  // Counted here, having been named on stderr as each scan reported it. The count rather than
  // the lines again: what could not be read is often a parser's complaint several lines long,
  // and printing it twice makes the report itself the noise. What the summary adds is that the
  // exit code has a reason — a stderr line above a table that otherwise reads as fine is a
  // thing people scroll past.
  const unreadable = listing('unreadable').filter((finding) => finding.fails);
  if (unreadable.length > 0) {
    info(`  ${amber('!')} ${unreadable.length} thing(s) in ${dir}/ could not be read, reported above`);
    info(dim('    a change the tool cannot read is a change it cannot govern'));
    info();
  }
}
