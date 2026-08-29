Written for whoever will build it, with the codebase open. Every reason that needed the codebase
to explain belongs here, including the ones that would not fit `change.md`: told only what may
not go there, an author deletes the argument instead of moving it.

# How it will be built

All of it is text in `packages/core/src/scaffold.ts`, `packages/core/src/readmes.ts` and
`packages/core/src/templates.ts` — the three files that hold what an agent reads. Nothing new is
parsed, nothing is refused, no command gains a flag. `specs/agent-instructions` § *Which surface
carries a rule is decided by where the rule is broken* decides where each of the three lines
goes, and the answers are not the same surface:

| rule | surface | because |
| --- | --- | --- |
| the archive is not read | `molly-corpus`, and the `history/` explainer | it binds *before* any document is open, when an agent decides where to look for prior art — the reference skill is the only one loaded then, and the explainer already states the seal and stops one word short of this |
| what implementation works from | `molly-advance` | it binds at the transition into `in_progress`, which is the one moment that skill is loaded and the one moment the boundary is actionable |
| the payload is not a task | the `tasks.md` template, and `molly-new` | it binds at the keystroke where the task is written, which is the template's moment — and the skill carries it too because a task list is rewritten in later sessions the template is no longer in front of |

**The explainer is the load-bearing edit, not the skills.** `history/README.md` today says
*nothing here is edited, and nothing here is re-checked*, which reads as a complete seal and is
two-thirds of one. The sentence is finished rather than a fourth added: sealed against editing,
against re-checking, and against reading, with the destination in the same breath — `specs/` and
`decisions/` for what is in force, `molly status` for what exists, `roadmap/` for what is
intended. A prohibition needs a destination, and the reason is published: the rule about hand
editing `docs/specs/` was in three places and broken anyway, because it was said as *never* to
somebody holding a correction and offered no alternative.

**`molly-advance` is where the phase boundary is stated, and it is one line plus its
consequence.** Implementation works from the change's four documents; the knowledge base was
read while drafting and the decision it produced is `plan.md`. A plan that turns out to be wrong
is not edited from inside the implementation — the change moves back, which the same skill
already describes as how work reopens, and a *published* specification found wrong is a new
change. Both halves already exist as mechanisms; what is added is the sentence naming when each
applies.

## The caps, and which of them moves

The harness caps the reference skill at 60 lines and the four workflow skills at 30 each
(`scripts/smoke.sh`, *the skill stays short*). The reference skill is at 60 and `molly-new` is
at 30, so two of the three edits have no room and the third has five lines.

**`molly-new` and `molly-advance` fit without the cap moving.** `molly-advance` is at 25.
`molly-new`'s clause goes inside step 4's existing sentence about what each document is for,
which is where a reader is already being told what `tasks.md` holds; it is re-wrapped, not
appended.

**The reference skill's cap moves to 64, and that is a claim this change has to make rather than
assume.** The cap exists because a skill has to earn its room, and the published reason is that
*every skill's name and description load into every session that starts*. That is a fact about
the name and the description, not about the body: a body loads only once a model has decided the
work is ours. So what these four lines are weighed against is not every session — it is the
sessions already doing corpus work, and in those the thing they prevent an agent from loading is
an archived change bundle, which is four documents and a payload. One archived `tasks.md` in this
corpus is longer than the whole reference skill. The cap is raised by the smallest amount that
fits, and the harness keeps asserting it.

## What is not built

**No check, no refusal, no hook.** An agent that reads `history/` is not stopped by anything
here, and the specification says so in the same words it uses for every other instruction: the
tool approves nothing. Making the seal executable was drafted alongside this and refused on
scope — a `PreToolUse` hook is a third kind of file outside a corpus, it needs the settings entry
this tool took out on principle, and it is the verification the specification declines to do.
The refusal is in the roadmap slice under *What has been decided*, and the instrument belongs to
the project: an adopting repository enforcing its own rule in its own harness is exactly what
`conventions.md` is for.

**Nothing is said about `git show`.** The archive is in the repository's history regardless, and
an instruction that pretended otherwise would be the kind of claim that teaches a reader the rest
are decorative.

**No new area, no new frontmatter key, no `phase:` field.** The phases already exist as the states
of a change, and the boundary is a property of the instructions rather than of a document. A field
would be a second answer to a question the ledger already answers.

# What this constrains afterwards

None. The rule is text an agent reads, nothing enforces it, and nothing later work does can fail
against it. What it leaves behind is a place for the next instance to go: the surface table in the
specification gains three rows, so a fourth phase boundary is placed by the same test rather than
by habit.
