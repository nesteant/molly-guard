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
 *
 * **What they do carry is placement, and the line between the two is the one to hold.** Each
 * opens by naming the reader it is written for and the one question that settles whether a
 * sentence belongs — and where a sentence that fails it goes instead, because an author told
 * only what may not go in a document deletes the material rather than moving it. That is this
 * tool's to say: the four documents and what each is for are the model, and partitioning them by
 * *subject* asks a writer to classify their own prose, which is the judgement people and agents
 * make differently every time. A reader is not a judgement.
 *
 * The test for anything added here later: could the engine tell whether the rule was followed
 * without reading a body? Naming a reader, a destination or a path is placement and passes it. A
 * keyword, a required section or a heading that presumes a methodology is form, and does not.
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
  entry: `Written for somebody deciding whether this should happen, who will not open the codebase and
does not know this corpus exists. A sentence belongs here only if the decision changes when it
stops being true; one that changes only *how* the work is done belongs in \`plan.md\` — moved
there, not dropped.

# What this change makes true

One claim, stated so that someone who did not write it could tell whether it holds. A second
claim is a second change.

# Why

What breaks without it, and what it costs to do. This is the part a future reader argues with
when they want to go somewhere else, and it is the only place the reasoning will ever live.

# What is not settled

What this change cannot answer yet, in the words you would ask it, and nothing guessed at in
place of an answer. An answer is recorded by rewriting the document it belongs in and deleting
the question from here — one that stays in the conversation it was given in is one the next
reader does not have. Most changes settle everything before review, and "nothing" is the answer
when they do.
`,

  plan: `Written for whoever will build it, with the codebase open. Every reason that needed the codebase
to explain belongs here, including the ones that would not fit \`change.md\`: told only what may
not go there, an author deletes the argument instead of moving it.

# How it will be built

The approach, and what it rules out. Enough that whoever picks the work up is not left
inheriting the design decision along with the deadline.

# What this constrains afterwards

A rule later work has to respect, if this design leaves one behind. Mark one only where a check
enforces it and it binds work not yet done — restating the design is not a constraint, and what
is written here is a proposal whoever reviews may drop. Most changes leave none, and saying so
is a real answer.
`,

  tasks: `Written for whoever picks the work up part-done. An item belongs here only if somebody could look
at the repository and say whether it is finished.

# The work, in order

The order is the part that matters — it is the difference between a list of work and a plan
for doing it. Each item should deliver something this change declares. When the plan changes the
list is rewritten: a task that is no longer wanted is deleted rather than struck through, because
git holds what it used to say and a list holding both is one nobody can act on.
`,

  tests: `Written for whoever has to believe the claim afterwards. An item belongs here only if somebody
could observe it and answer yes or no.

# What will prove it

What would have to be observed for the claim above to be believed. Written before the work,
because evidence chosen afterwards is chosen to fit what happened.
`,

  roadmap: `Written for whoever decides what to do next. A sentence belongs here only if it changes what is
done next, or in what order — how a feature is built is each change's business.

# What this slice is for

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

  capability: `Written for somebody deciding where a specification belongs. A sentence belongs here only if it
would settle that question for a document nobody has written yet.

# What this is responsible for

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
