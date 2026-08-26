# How it will be built

Three surfaces, and which one carries a rule is decided by when the rule is broken.

**`packages/core/src/templates.ts` — the templates, and the first thing an author sees.** Each of
the six bodies gains a lead paragraph before its first heading, naming the reader and the one
question that settles a sentence, and naming the destination for a sentence that fails it. A rule
that only bites while a specific document is being written is stated in that document's template and
nowhere else: `tasks.md` carries *delete a task that is no longer wanted rather than striking it
through*, and `plan.md` absorbs the standing-constraint paragraph currently sitting in the
`molly-new` skill, which is about `plan.md` and is read three steps away from it.

`change.md` gains a third heading, `# What is not settled`, with prose saying that an answer is
recorded by rewriting the document it belongs in and deleting the question, and that "nothing" is
the ordinary answer. This is the whole of what remains of the removed question log: a heading, no
command, no ledger event, no hash. It works because the approval gate is a person reading, and a
question in a document is in front of them.

**`packages/core/src/scaffold.ts` — the skills, which are what a model has open.** `molly-corpus`
gains the correction path in its positive form and the closed frontmatter record. `molly-new`
restates step 4 by reader and gains one line saying that revising is rewriting. `molly-advance`
gains one line: a change whose *What is not settled* still holds a question is not one to approve.
`molly-publish` gains the frontmatter record for a published document and one clause saying a
payload's links are written for where the document lands.

**`packages/core/src/readmes.ts` — the `changes/` explainer, which is the model stated once.** The
sentence describing the four documents names their four readers, and one sentence says the documents
state what is in force rather than how they got there.

# What this constrains afterwards

**A scaffold states placement and never form.** Naming the reader of a document, the destination of
a sentence, or the path a correction takes is placement, and is this tool's to state because the
four-document model is this tool's. A keyword, a required section, a heading that presumes an
acceptance-criteria methodology, or any check that reads below the frontmatter is form, and remains
refused — `creating-a-change` § *No format is imposed* and the decision
[core never parses a document body](../../decisions/core-never-parses-a-body.md) both stand
unchanged. The test for a future scaffold edit is whether the engine would have to read a body to
know the rule was followed; if it would, the rule is form.

# What this does not do

Nothing here is checked. `molly status` gains no finding, `molly publish` gains no refusal, and no
command reads a heading. A change whose *What is not settled* holds five questions publishes exactly
as one that holds none, because that is a judgement about readiness and readiness is process. The
harness asserts what the tool *writes* — that each generated document names its reader, that the
caps still hold — and never what somebody wrote under it.

# The budget this is built inside

The workflow skills are capped at 30 lines each and the reference skill at 60, asserted in
`scripts/smoke.sh`. `molly-new` and `molly-roadmap` are at 30 today, so `molly-new` gains nothing
without giving something back — the standing-constraint paragraph moving into the `plan.md` template
is what pays for the two lines added to it, and it belongs there anyway. That constraint is why the
templates carry most of this: they are the one surface with no per-session cost, because they are
written once into a change and read by whoever opens it.
