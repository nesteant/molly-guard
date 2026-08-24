/**
 * What a new document opens on.
 *
 * **These carry no format.** Not one `given`, not one `SHALL`, not one heading that presumes
 * an acceptance-criteria methodology — because the moment a template ships a form, that form
 * is the corpus's form for ever: whatever the template shows is what every document fills up
 * with, and what it leaves blank is what stays blank.
 *
 * A team that wants a form installs the slice that supplies it. `@mollyguard/gherkin` would
 * replace `bodyFor` with templates that open on Given/When/Then and contribute the check that
 * reads them. That substitution is the whole reason this is a lookup rather than four string
 * constants inlined at the call site.
 *
 * The matching architectural commitment lives in core generally: **nothing here parses a
 * body.** A body is an opaque string to the engine, which is what leaves every format — and
 * every language — available.
 */

import { ChangePart } from './change';

/**
 * Every opening body the tool writes: the four parts of a change bundle, and each document
 * that stands on its own.
 *
 * One key rather than a method per document kind, so a format slice still substitutes `bodyFor`
 * whole and the next standalone document is one more member of this union.
 */
export type DocumentPart = ChangePart | 'capability' | 'roadmap';

export interface Templates {
  /** The name reported by `molly plugins`, so a corpus can say whose templates it writes. */
  readonly name: string;
  /** Opening body for one document, or one part of a bundle. Frontmatter is added by the caller. */
  bodyFor(part: DocumentPart): string;
}

const BUILT_IN: Readonly<Record<DocumentPart, string>> = {
  entry: `# What this change makes true

One claim, stated so that someone who did not write it could tell whether it holds. A second
claim is a second change.

# Why

What breaks without it, and what it costs to do. This is the part a future reader argues with
when they want to go somewhere else, and it is the only place the reasoning will ever live.
`,

  plan: `# How it will be built

The approach, and what it rules out. Enough that whoever picks the work up is not left
inheriting the design decision along with the deadline.

# What this constrains afterwards

A rule later work has to respect, if this design leaves one behind. Most changes leave none,
and saying so is a real answer.
`,

  tasks: `# The work, in order

The order is the part that matters — it is the difference between a list of work and a plan
for doing it. Each item should deliver something this change declares.
`,

  tests: `# What will prove it

What would have to be observed for the claim above to be believed. Written before the work,
because evidence chosen afterwards is chosen to fit what happened.
`,

  roadmap: `# What this slice is for

The business need this body of work answers, in the terms whoever asked for it used. Not a plan
for building it — that is each change's business.

# The features, in order

What is in this slice, in the order they are wanted, each with a line on why it sits where it
sits. The order is an argument and not a number: "this comes first because it unblocks the other
three" is worth more than a rank, and it is what somebody reads to decide what to do next.

Say what matters most where it differs from what comes first. They are different questions.

# What has been decided

Choices already made about this slice, so they are not relitigated once per change. A constraint
that binds work beyond this slice is a decision, and belongs in \`decisions/\` by way of a change.

# What is done

Features already realised, and the change that realised each. Moving a feature here is a normal
edit — no change alters a slice, so keeping this true is somebody writing it down.
`,

  capability: `# What this is responsible for

The area of the product this groups, in the terms whoever works on it already uses. Not a
description of how it is built — that belongs to the specifications filed under it.

# Where the edge is

What is deliberately outside, and why it belongs to something else. State the edge rather than
the centre: a capability with no stated boundary collects every specification nobody else
wanted.
`,
};

export const BUILT_IN_TEMPLATES: Templates = {
  name: 'built-in',
  bodyFor: (part) => BUILT_IN[part],
};
