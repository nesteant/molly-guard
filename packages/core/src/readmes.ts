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

export const ROOT_README = (dir: string): string => `# ${dir}/

The knowledge base, and the changes that alter it.

Two facts explain the whole layout. **A specification has no lifecycle** — it is what the
product is currently believed to be, and it is altered only by a change merging into it. **A
change has one** — it is drafted, reviewed, approved, implemented, verified, and merged. So
the directory edited day to day is \`changes/\`; everything else is a grouping, accumulated
truth, or a record of what happened.

| Directory | Holds | How something gets there |
| --- | --- | --- |
| \`capabilities/\` | what the product is responsible for | written directly |
| \`specs/\` | accumulated truth | a change merges into it |
| \`decisions/\` | constraints outliving any one change | extracted from a design at merge |
| \`roadmap/\` | intent not specified yet | written directly |
| \`changes/\` | work in flight | \`molly change new\` |
| \`history/\` | merged changes, kept verbatim | \`molly merge\` |

Each one has a README saying what belongs in it.

\`.mollyguard/\` is the audit trail: an append-only transition history. Commit it, and never
edit it by hand — every state is folded from that history, so editing it is how a record
starts disagreeing with what happened.

Nothing here parses your prose. Every document is markdown, and the machine-readable part
rides in HTML comments that render as nothing, so a corpus can be written and read in any
language with none of the tool left in the text.
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

One file per capability. A capability is a grouping: a specification names the capability it
belongs to, and reading is scoped by it — which is what keeps a corpus readable once it no
longer fits in one sitting.

Written directly. No change alters one, because a grouping is not a claim about the product;
it is how the claims are filed.

State the edge rather than the centre. A capability with no stated boundary collects every
specification nobody else wanted.
`,

  specs: `# specs/

Accumulated truth: what the product is currently believed to be.

One folder per specification. \`spec.md\` is the business specification and \`architecture.md\`
is how it is built — siblings, so the two are reviewed and moved together instead of drifting
apart.

**Not edited here.** A specification arrives, and is altered, only by a change merging into
it. Editing this directory bypasses every check there is.

A specification has no state; it is current, or superseded. What has a lifecycle is the change
altering it.
`,

  decisions: `# decisions/

Constraints that outlive any one change.

One file per decision: a rule later work has to respect. Not a description of how something is
built — that is a specification's \`architecture.md\`.

They are not written here by hand. A design in \`changes/<name>/plan.md\` marks the part of
itself that is a standing constraint, and the merge extracts it into this directory. Extracted
at merge rather than at approval, because until a change is verified its design is a proposal,
and recording it as binding earlier would hold later work to something that might be reverted.

A decision is in force, or superseded by a change that says so.
`,

  roadmap: `# roadmap/

Intent that has not become a change yet.

One file per entry: what is meant to be true later, and why. Written directly — no change
alters one.

It is read while planning, so a new change does not quietly contradict something already
intended. An entry is open, or realised by a change that landed.

Keep an entry to the shape of a record — a title, a statement of intent, the capability it
belongs to. A long plan is not that shape, and belongs outside the corpus.
`,

  changes: `# changes/

Work in flight. This is the directory you edit.

One folder per change. \`change.md\` is the delta — what this change alters, in the knowledge
base's terms — and it is the only file required to exist.

A change moves \`draft → review → approved → in_progress → implemented → verified → merged\`,
one state at a time. \`molly move <change> <state>\` advances it; \`molly merge\` folds it into
the knowledge base and archives what is left.

Nothing outside a marker is read. The prose around it is for whoever reviews the change.
`,

  history: `# history/

Merged changes, kept verbatim.

A change that merges is archived here rather than deleted. Nothing here is edited, and nothing
here is re-checked — a merged delta has already been applied, so asking whether it still
applies would fail on its own success.

A correction after a merge is a new change. \`merged\` is terminal.
`,
};

/** The explainer for one directory, falling back to what the area says it holds. */
export function readmeFor(directory: string): string {
  const known = AREA_READMES[directory];
  if (known) return known;

  const describes = AREAS.find((a) => a.name === directory)?.describes ?? '';
  return `# ${directory}/\n\n${describes.charAt(0).toUpperCase()}${describes.slice(1)}.\n`;
}
