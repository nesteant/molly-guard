# What will prove it

**Every document the tool opens names a reader.** A corpus made with `molly init`, a change made
with `molly change new`, a capability and a roadmap slice: each generated body says who it is for
before its first heading. Asserted in `scripts/smoke.sh` over what the commands write, so a template
that loses its lead paragraph fails the build rather than the next author.

**A change arrives with somewhere to put a question.** `change.md` carries `# What is not settled`,
and the prose under it says that an answer is recorded by rewriting the document it belongs in.
Asserted on the generated file.

**Nothing reads any of it.** A change whose *What is not settled* holds a question moves through
every state and publishes. `molly status` reports no finding about it, and `molly publish` refuses
nothing for it. This is the assertion that keeps the change honest about being placement rather than
form, and it is the one that would fail if somebody later added the check the proposals asked for.

**The caps still hold.** `molly-corpus` at 60 lines or fewer, each workflow skill at 30 or fewer —
the existing assertions, which now have to pass with more said in them.

**The rules that were already asserted are still there.** *Never edit them directly* in
`molly-corpus`, *Never guess* in `molly-new` with `change.md` named within two lines and the
sentence about the tool refusing nothing within three. Those assertions exist because each rule is
one somebody could delete without anything noticing, and this change rewrites the paragraphs around
all of them.

**The skills still name only real commands and real paths.** The harness resolves every `molly <cmd>`
against `molly help` and every `docs/…` path against a corpus made by `init`; the new text names
`publish/` paths and a heading, so it is the run that catches a path that reads well and does not
exist.
