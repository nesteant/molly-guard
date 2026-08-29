Written for whoever will build it, with the codebase open. Every reason that needed the codebase
to explain belongs here, including the ones that would not fit `change.md`: told only what may
not go there, an author deletes the argument instead of moving it.

# How it will be built

`place()` in `packages/store/src/skeleton.ts` gains a third outcome, and `packages/cli/src/init.ts`
reports it. That is the whole of the change; nothing else calls `place`.

```ts
export type Placement = 'created' | 'kept' | 'differs';
```

**The asymmetry with `writeScaffold` is real and survives.** Its neighbour in the same package has
had three outcomes since it was written, and its header says why: a writer that could not tell
*already there* from *just written* forces `--check` to implement the same comparison a second
time. The reason it also *replaces* what differs is ownership — it writes the tool's own
`molly`-namespaced files at the repository root. `place()` writes into `docs/`, a directory the
tool did not make, so it may compare and it may not replace. `decisions/the-tool-writes-only-what-it-owns`
is the constraint, `0008` is where it was decided, and the skeleton module's own header already
states it. What was missing was never the write; it was the report.

## Which files are compared, and which are not

Three of the files `init` places are not documents whose whole text this tool owns, and comparing
them would produce a finding on the healthy case — the failure mode this corpus has already
refused once, in the frontmatter check that fires on the evolution it should permit.

| file | compared | because |
| --- | --- | --- |
| the area explainers, `README.md`, `.mollyguard/README.md` | yes | the tool writes the whole text, and a later version rewriting it is exactly the case |
| `conventions.md` | no | it is placed empty *as an invitation*. A project that filled it in is the designed outcome, and reporting that as behind would teach people to read past the line |
| `.gitattributes` | no | it already has its own named remedy — the missing merge line, printed with the line to add. Two messages about one file is one too many |
| `.mollyguard/history.jsonl` | no | it is placed empty and holds data. Comparing a file against `''` can only ever say *differs*, which carries no information, and the ledger is the one file here that may be large |

The last three are excluded **by the caller**, using the constants `init` already imports and
already special-cases for all three. `place` itself skips the read when the text it was given is
empty, which is the general form of the ledger's case and is worth stating as a rule rather than
as an exception: a file the tool places empty has no version to be behind.

## What the report says

`differs` is still `kept` for counting — the file was kept, and the count of what the run left
alone must not change meaning. What is added is a named line, in the shape `init` already uses for
what it kept and `agents --check` already uses for what is stale:

```
  config      mollyguard.yml — left exactly as it is
  added       nothing — every file this version writes was already there
  kept        11 file(s) — everything that was already there
  ! 1 file(s) hold text this version has changed, and were left alone
      differs  changes/README.md
```

**The `added` line loses its false half and keeps its true one.** *It already had everything this
version writes* becomes *every file this version writes was already there*, which is what
existence actually establishes. That correction is worth making even where nothing differs,
because it is the sentence that was wrong.

**Named, never counted, and the remedy is the one already printed for an explainer**: delete it
and run again. `init` says that today for the files it kept, and it is the right answer here for
the same reason — an explainer is prose nothing reads, so replacing it costs nothing, and that is
precisely why the tool must not do it unasked.

## What is not built

**No `molly init --check`.** It is the obvious next flag and it is a second claim: `agents --check`
exists because agent instructions go stale between upgrades and there is a command whose whole job
is reinstalling them, and the same argument has to be made for a corpus rather than assumed from
the shape. The report at the end of a normal `init` is what the failure above needed, and it is
what an operator running an upgrade is looking at. If a corpus later needs to be asked without
being written to, that is a change with its own evidence.

**No diff.** Naming the file is the whole of what somebody needs to run `molly init` in an empty
directory and look. Printing one would make this command a differ and put the tool in the business
of explaining prose it does not own.

**Nothing is replaced, and no flag replaces it.** A `--force` would be the request underneath this
one, and it is the thing `0008` refuses.

# What this constrains afterwards

None new. The rule it rests on — nothing an install finds is overwritten, lost or hidden — is
already in force and already published; this makes the *report* honour the half of it that says
**hidden**.
