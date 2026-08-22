# How it will be built

Almost entirely in the table. `TOOLS` in `packages/core/src/scaffold.ts` already carries a row
per tool with the directory it reads and whether it is a default, and `scaffoldFor` already
deduplicates by path — so five rows and two `byDefault` marks are the feature. Nothing in the
writer, the check or the CLI needs to know that there are now four directories rather than two.

That is the payoff of the shape the previous change chose, and it is worth saying out loud: the
cost of covering a new tool is a row and an assertion, which is what makes "verified, one at a
time" an affordable rule rather than a good intention.

```ts
{ id: 'goose',     title: 'Goose',      skills: '.agents/skills' }
{ id: 'roo',       title: 'Roo Code',   skills: '.agents/skills' }
{ id: 'openhands', title: 'OpenHands',  skills: '.agents/skills' }
{ id: 'junie',     title: 'Junie',      skills: '.junie/skills', byDefault: true }
{ id: 'kiro',      title: 'Kiro',       skills: '.kiro/skills',  byDefault: true }
```

`readers()` already reports who else a directory serves and skips directories with a single
reader, so `--tools junie` says nothing beyond the path it wrote — which is correct, because
naming the one tool a directory belongs to says nothing its path did not.

## Where the verification lives

Each row's source is a URL and a date, and neither belongs in the code: a comment holding twelve
links is a comment nobody re-reads, and it would be the second answer to a question the entry
document already answers. The table's comment says the rows were read from vendor documentation
on a date, and the entry document holds the finding. The code keeps the claim; the change keeps
the evidence.

## The assertions

`--tools junie` writes `.junie/skills/` and **not** the shared root, asserted as an absence, in
the shape the Cline assertion already has — those two rows are the ones a tidy-minded person
would fold into the majority, and an absence is the only thing that catches it.

The count assertions move: the default is sixteen files rather than eight. That is the number
worth stating in a test, because it is the one that changes when somebody adds a directory
without meaning to.

# What this constrains afterwards

<!-- decision: a-tool-row-is-read-from-that-vendors-documentation -->

**A row in the tool table is admitted on the vendor's own documentation, and on nothing else.**
Not a comparison table, not an aggregator, not a plausible inference from a fork's parent — and
not a documented location that the vendor's own issue tracker says is not honoured.

The reason is that the failure is silent. A file written where nothing reads it produces no
error, no warning and no difference a person would notice; the tool reports an install, the
directory exists, and the agent working there has no instructions. There is no run-time signal
to fall back on, so the only check available is the source, applied before the row exists.

This cuts both ways and the second direction is the one that gets forgotten: a tool that reads
a directory nobody expected earns a row just as much as a tool that does not read the one
everybody assumed. Junie and Kiro were found by reading; so was Cline, the other way round.

The rule has a cost and it is accepted: the table lags the ecosystem, and a tool nobody here has
checked is absent rather than guessed at. Absent is recoverable in one row. Wrong is not
recoverable at all, because nothing announces it.
