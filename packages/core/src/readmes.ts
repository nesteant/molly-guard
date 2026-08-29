/**
 * What each directory says about itself.
 *
 * Addressed to a person who has opened the directory and wants to know what belongs in it
 * and how something gets there. Nothing in the tool reads them — no gate, no command, and
 * not an agent either, which has its own generated instructions. That separation is what
 * lets these be prose rather than a format.
 *
 * They are also what makes the skeleton survive its first commit: git tracks no empty
 * directory, so without them `molly init` would produce a corpus that vanishes on clone.
 */

import { AREAS } from './areas';

/**
 * The file a project writes its own rules in, and the only one here it is expected to fill.
 *
 * Every other explainer says what a directory holds. This one is an invitation, and it exists
 * because the invitation was the half that was missing: four installed skills already point at
 * `<root>/conventions.md` and rank it above their own contents, and nothing anywhere told a
 * project to write one. The mechanism shipped without it, so the rules went into `CLAUDE.md` —
 * reaching one of the four directories `molly agents` writes into — and into the explainers this
 * module generates, where they cannot be told from the tool's own words.
 *
 * **Headings and an explanation of each, and not one convention.** The tool has no opinion about
 * how a project works, and a template that arrived holding one would make that opinion every
 * corpus's opinion — `init` seeds no example anywhere else for exactly this reason, and this is
 * the one file where a seeded opinion would be worst.
 *
 * A corpus that adopts this and writes nothing under the headings is a corpus with no project
 * rules, which is a real answer and the common one.
 */
export const CONVENTIONS_README = (dir: string): string => `# How this project works in its own corpus

The installed skills say how a MollyGuard corpus works in general. This says how **this** project
uses it, and the skills say that where the two differ, this file wins.

It is the one file in \`${dir}/\` you are expected to write. Nothing reads it but a person and
whatever agent they are driving, nothing checks it, and leaving it as it is means this project has
no rules of its own beyond the tool's — which is a real answer.

Everything below is a heading somebody found they needed. Delete the ones you do not.

## What needs a change, and what does not

Where the line falls here. Every project draws it somewhere, and an agent that guesses draws it
somewhere else each time.

## How this project writes a change

Anything about the four documents that is this project's taste rather than the tool's rule —
how much detail a plan carries, what evidence counts in \`tests.md\`, when a decision is warranted.

## What is never edited by hand

The tool refuses some of this and cannot refuse the rest. Say which files here are somebody's
output rather than somebody's work.

## References between documents

How a document points at another one. Worth stating, because publishing moves a change into
\`history/\` and a relative path written to a sibling change stops resolving when it does.

## Before finishing

The commands that have to pass. \`molly status\` exiting \`0\` is a reasonable definition of done
for the corpus; whatever builds and tests this project is the rest of it.
`;

export const ROOT_README = (dir: string): string => `# ${dir}/

The knowledge base, and the changes that alter it.

Two facts explain the whole layout. **A specification has no lifecycle** — it is what the
product is currently believed to be, and it is altered only by a change published into it. **A
change has one** — drafted, reviewed, approved, worked on, implemented, verified, deployed, and
finally published. So
the directory edited day to day is \`changes/\`; everything else is a grouping, accumulated
truth, or a record of what happened.

| Directory | Holds | How something gets there |
| --- | --- | --- |
| \`capabilities/\` | what the product is responsible for | \`molly capability new\` |
| \`specs/\` | accumulated truth | \`molly publish\` |
| \`decisions/\` | constraints outliving any one change | \`molly publish\` |
| \`roadmap/\` | intent not specified yet | \`molly roadmap new\` |
| \`changes/\` | work in flight | \`molly change new\` |
| \`history/\` | changes that were published, kept whole | \`molly publish\` |

Each one has a README saying what belongs in it.

\`conventions.md\` sits beside them and is **yours**. The installed agent skills say how
MollyGuard works and point at that file for how *this* project uses it — and say that where the
two differ, this project wins. Nothing reads it but a person and whatever agent they are driving.
It arrives empty of opinions, because the tool has none to put in it.

**Nothing enters the knowledge base except by publishing a change.** A change carries the
documents it proposes in \`changes/<name>/publish/\`, mirroring this directory, and
\`molly publish\` files them, archives the bundle into \`history/\` and records it. The tool
writes no prose: every document was written by a person, or by an agent acting as one.

\`.mollyguard/\` is the audit trail: an append-only transition history. Commit it, and never
edit it by hand — every state is folded from that history, so editing it is how a record
starts disagreeing with what happened.

\`mollyguard.yml\` is not in here. It sits at the top of the repository and names this directory,
which is what lets every command find the corpus from anywhere inside it.

The instructions an agent reads are installed *outside* this directory, where agent tools look —
\`molly init\` writes them and \`molly agents\` reinstalls them after an upgrade. They hold no
decision, capability or language: they say where those live, which is here.

Nothing here parses your prose. Every document is markdown; what the tool reads is the
frontmatter block at the top, and everything below it is text a person wrote for another
person. So a corpus can be written and read in any language with none of the tool left in it.
`;

export const STATE_README = `# .mollyguard/

The audit trail. Written by the tool, read by the tool.

\`history.jsonl\` is every lifecycle event, appended and never rewritten. A change's state is
folded from it rather than stored, which is what lets a change advance without its content
moving — an approval pinned to text that changed on every transition would expire on the
very next step.

Commit it. It is what makes an approval reconstructable months later.

**Never edit it by hand.** It is the record of what happened; editing it is how that record
starts to disagree with what happened, and nothing downstream can tell.
`;

const AREA_READMES: Readonly<Record<string, string>> = {
  capabilities: `# capabilities/

What the product is responsible for, and where the edges are.

One file per capability, written by \`molly capability new "<title>"\` or by hand — both are
fine, because no change alters a capability. A grouping is not a claim about the product; it is
how the claims are filed. A change says which capability its work belongs to, and the name it
gives has to be one of these.

**No lifecycle, and nothing here reaches the ledger.** A capability is current; it has no state
to move through, so creating one records nothing. The ledger is the record of what happened to
things that are in flight.

State the edge rather than the centre. A capability with no stated boundary collects every
specification nobody else wanted.
`,

  specs: `# specs/

Accumulated truth: what the product is currently believed to be.

One folder per specification. \`spec.md\` is the business specification and \`architecture.md\`
is how it is built — siblings, so the two are reviewed and moved together instead of drifting
apart.

**Not edited here.** A specification arrives, and is altered, only by \`molly publish\` filing
a change's documents into this directory — so an edit made here has no change behind it, and
nothing in the history to say where it came from.

A change replaces a document **whole** rather than patching part of it. Whoever drafts writes
the new version; nothing combines two texts, which is what keeps a page something a person
wrote rather than a pile of applied deltas.

A specification has no state; it is current, or superseded. What has a lifecycle is the change
altering it.
`,

  decisions: `# decisions/

Constraints that outlive any one change.

One file per decision: a rule later work has to respect. Not a description of how something is
built — that is a specification's \`architecture.md\`.

They are not written here by hand. A design in \`changes/<name>/plan.md\` marks the part of
itself that is a standing constraint, and whoever prepares the change writes that constraint as
a document in \`changes/<name>/publish/decisions/\`, which \`molly publish\` files here.

Filed at publication rather than at approval, because until a change is verified its design is
a proposal, and recording it as binding earlier would hold later work to something that might
be reverted.

A decision is in force, or superseded by a change that says so.
`,

  roadmap: `# roadmap/

Intent that has not become a change yet.

One file per entry: what is meant to be true later, and why. Written by
\`molly roadmap new "<title>"\` or by hand — both are fine, because no change alters an entry.
The command mints the name by the same rule as every other name, which a hand-written file does
not get: this area is scanned, and a name nobody could type is reported for as long as it sits
here.

It is read while planning, so a new change does not quietly contradict something already
intended. \`molly status\` lists what is here beside the capabilities, which is what makes that
possible without knowing the directory exists. An entry is open, or realised by a change that
landed — and a change says which, with \`--realises <entry>\`, so that publishing one leaves
\`molly status\` saying this entry is still planning something that already exists.

Keep an entry to the shape of a record — a title, a statement of intent, the capability it
belongs to. A long plan is not that shape, and belongs outside the corpus.
`,

  changes: `# changes/

Work in flight. This is the directory you edit.

One folder per change, and four documents in it: \`change.md\` says what this change makes true
and why, \`plan.md\` how it will be built, \`tasks.md\` the work in order, and \`tests.md\` what
will prove it. Only \`change.md\` carries a frontmatter record — a title repeated in four files
is a title that disagrees with itself by the end of the week.

**Each is written for a different reader, and the reader is what settles where a sentence goes** —
\`change.md\` for somebody deciding whether the work should happen at all, who will not open the
codebase; \`plan.md\` for whoever will build it; \`tasks.md\` for whoever picks it up part-done;
\`tests.md\` for whoever has to believe the claim afterwards. A subject is something a writer
classifies and a reader is something they can ask, which is why the documents say who theirs is.
A sentence that fails one document's reader belongs to another's; it is moved, not dropped.

**They state what is in force, not how they came to say it.** A change corrected later is
rewritten as though it had always said the new thing — git and the ledger hold the history, and a
document that holds it too gives a reviewer two accounts and no way to choose.

A change has a state, in this sequence:

\`\`\`
draft → review → approved → in_progress → implemented → verified → deployed → published
\`\`\`

\`molly move\` records a move; run it with no arguments and it asks which change and which
state. \`molly status\` says where everything is.

A fifth thing may sit beside the four documents: \`publish/\`, a mirror of the corpus holding
the documents this change puts into the knowledge base — \`publish/specs/<name>/spec.md\`
becomes \`specs/<name>/spec.md\`. \`molly publish\` files them and archives the bundle.

**The sequence is an order, not a rule.** Any state may follow any other, and nothing here
refuses a move on those grounds — what one requires is policy, and policy belongs to an
extension or to whatever orchestrates the work. The order still decides what a picker offers
first, and whether a move is recorded as going forwards or back.

The last state is the one exception, and it is not about order: \`published\` is reached by
\`molly publish\`, which writes the change's documents into the knowledge base. \`molly move\`
refuses it, because recording it would claim a publication that never happened.

Nothing outside the frontmatter is read. The prose is for whoever reviews the change.
`,

  history: `# history/

Merged changes, kept verbatim.

A change that is published is archived here rather than deleted. Nothing here is edited,
nothing here is re-checked, and **nothing here is read while work is being drafted or built** —
what it claimed is now in the knowledge base, so asking whether it still applies would fail on
its own success.

The third is the one that looks like diligence at the moment it happens. An archived change is a
retired shape presented by the corpus itself, and copying it forward is how a decision nobody
holds any more gets made again. What is in force is in \`specs/\` and \`decisions/\`; what exists
is what \`molly status\` lists; what is intended is in \`roadmap/\`. Those are the three questions
an archived change gets opened to answer, and each of them has an answer that is current.

\`molly publish\` puts a change here, whole — including the \`publish/\` folder it carried, so
this directory answers "what did that change actually write into the base" on its own.

A correction after a publication is meant to be a new change rather than a retreat. Nothing
enforces that yet: \`published\` is still reachable by \`molly move\`, which would claim a
publication that never happened.
`,
};

/** The explainer for one directory, falling back to what the area says it holds. */
export function readmeFor(directory: string): string {
  const known = AREA_READMES[directory];
  if (known) return known;

  const describes = AREAS.find((a) => a.name === directory)?.describes ?? '';
  return `# ${directory}/\n\n${describes.charAt(0).toUpperCase()}${describes.slice(1)}.\n`;
}
