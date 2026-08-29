Written for whoever has to believe the claim afterwards. An item belongs here only if somebody
could observe it and answer yes or no.

# What will prove it

Every assertion below runs `molly init` twice in a throwaway directory with an edit in between,
which is the shape of the upgrade that produced the defect — the first run stands in for the
version that wrote the file, the edit for the version that changed the text.

**A file whose text differs is named.** `molly init`, edit `docs/changes/README.md`, `molly init`
again: the run names that path. Asserted on the path rather than on a count, because the count is
what the broken version already printed correctly.

**And it is left exactly as it was.** The same run, then the file still holds the edit, byte for
byte. This is the assertion that fails if somebody later reads the report as licence to repair
what it found — the same distinction `molly agents --check` holds between reporting and
installing, and the reason `0008` exists.

**The run still succeeds.** Exit `0`. A corpus holding an explainer this version has moved past is
not a failed initialisation, and treating it as one would make the upgrade path refuse itself.

**A corpus that is current names nothing.** `molly init` twice with no edit between: no differing
file, in a run that still reports what it kept. The positive case matters more than usual here —
a report that fires on every second `init` is one people stop reading, which is how the line it
replaces came to be believed.

**A filled-in `conventions.md` is not named.** `molly init`, write a convention into the file,
`molly init` again: the file is not reported as differing. It is placed empty as an invitation, so
a project that accepted the invitation is the designed outcome and must not be told it is behind.

**Nor is `.gitattributes` reported twice.** A corpus whose attributes file is somebody else's gets
the existing named remedy — the missing merge line, with the line to add — and does not also
appear as differing. One file, one message.

**Nor is a ledger with history in it.** `molly init`, create a change so the ledger has a line,
`molly init` again: the ledger is not named. It is placed empty and holds data, and it is the one
file here that may be large enough for the read to matter.

**The `added` line no longer claims what was not checked.** The corrected sentence appears and the
old one does not. Asserted as both a presence and an absence, because a report is prose and prose
that was wrong once can be reintroduced by an edit that reads like a tidy-up.

# What is not proven here

That the file which differs is *stale* rather than *edited on purpose*. The tool cannot tell those
apart and does not try — which is exactly why the outcome is a name and a decision rather than a
repair. The evidence that this was worth building is the upgrade that produced it: run against a
corpus holding 0.3.0's `changes/README.md`, this version names the file that the released one
reported as current.
