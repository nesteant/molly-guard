Written for whoever has to believe the claim afterwards. An item belongs here only if somebody
could observe it and answer yes or no.

# What will prove it

The claim is that the instructions say what a phase works from and what it leaves closed, so the
evidence is the installed text rather than a behaviour — every assertion below reads a file
`molly init` or `molly agents` just wrote into a throwaway directory, which is how the rest of
this harness asserts instructions and the only way to catch a rule that survives in the source
and never reaches an agent.

**The archive explainer refuses the read, and offers somewhere to go.** `molly init` into an
empty directory, then `docs/history/README.md` contains the word for reading alongside editing
and re-checking, and names `specs/`, `decisions/` and `molly status`. A seal that only refuses
is the failure this repository already published a finding about, so the destination is asserted
and not just the prohibition.

**The reference skill closes the archive.** `molly agents --tools agents`, then
`.agents/skills/molly-corpus/SKILL.md` says the archive is not read. Asserted on the installed
file rather than on `scaffold.ts`, because a rule that exists only in the generator is a rule no
agent has.

**The advance skill names what implementation works from.** The same install, then
`.agents/skills/molly-advance/SKILL.md` names the change's own documents and says a change is
moved back rather than edited in place.

**The task template refuses the payload.** `molly change new` in a throwaway corpus, then the
generated `tasks.md` says the payload is not a task. This is the one with a false-negative worth
naming: the drafting skill saying it is not evidence that the template does, and the template is
the surface the eleven task lists were written against.

**Every skill is still within its cap.** The existing assertions in `scripts/smoke.sh` — 64 for
the reference skill after this change, 30 each for the four workflow skills — run unchanged
except for the one number, and `molly-new` and `molly-advance` are asserted against 30 rather
than being exempted. A cap with a carve-out is a cap that gets edited.

**Every path the instructions name still exists in a corpus.** The harness already walks the
paths named in the installed skills and fails on one that is not there; the new lines name
`docs/history/`, which `init` creates, so that assertion covers them without being extended.

**Nothing new is refused.** `molly status`, `molly move` and `molly publish` behave exactly as
they did: a change whose `tasks.md` writes the payload is still drafted, still moved and still
published, and reading `history/` still fails nothing. Asserted as an absence, because the risk
this change carries is that somebody reads it as licence to add the check it declines to add.

# What is not proven here

That an agent obeys any of it. Nothing verifies that the instructions were followed, here as
everywhere in this specification, and the evidence for the rule working is the same shape as the
evidence that produced it: the next audit of an adopting repository finding no archived bundle in
a session's reads, and no payload task in a change drafted after this ships.
