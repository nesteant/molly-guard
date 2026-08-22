---
title: New Specification Creation
lang: en
kind: feature
capability: the-change-flow
state: published
alters: []
---

# What this change makes true

A change is created as four documents in one folder — the specification, the architectural
plan, the task sequence, and the tests — from a single command that asks nothing and checks
nothing. One of the four carries the record; the other three are prose. The tool writes the
sections and a person writes the content, and nothing the tool writes presumes a format for
what goes inside them.

```
molly change new "<title>" [--capability <name>] [--alters specs/<name>] [--kind …]

docs/changes/<name>/
  change.md    what this change makes true, and why   ← the record
  plan.md      how it will be built
  tasks.md     the work, in order
  tests.md     what will prove it
```

# Why

**Four documents, because a change is not finished when its text is written.** A
specification with no design has not been thought through. A design with no task order is not
schedulable. Work with no tests is not verifiable. Creating all four at once is what makes
the missing ones visible — a folder with three filled files and one still carrying its
opening prose says exactly where the thinking stopped, and a change that never created the
file says nothing at all.

They are siblings in one folder rather than four documents in four places because they are
reviewed together, moved together, and archived together. A design that lives somewhere else
is a design nobody re-reads.

**One record, because four titles disagree.** Only `change.md` carries frontmatter. If each
file declared its own `title` and `kind`, they would drift apart within a week, and nothing
would say which one was right. The other three are prose from the first line.

**No format, because whatever the template shows is what the corpus fills up with.** A
template opening on Given/When/Then makes Given/When/Then the corpus's form for ever — and
puts English keywords into text that is supposed to be translatable. The built-in templates
name the section and stop. A team that wants a form installs the slice that supplies it, and
that slice replaces the templates and adds the check that reads them.

The cost of getting this wrong is not that a document comes out badly shaped; it is that the
shape becomes unnegotiable. Every corpus created before the format was pluggable would carry
the built-in one, and every tool downstream would come to depend on it being there.

**Creation is recorded.** Writing the bundle appends one line to the transition ledger saying
the change was created, in `draft`, by whom and when. That costs one line and buys two things:
the state the document declares is backed by a record rather than by the absence of one, and a
bundle the ledger has never heard of becomes a *signal* — something arrived without going
through the tool.

**Nothing is checked yet, and that is deliberate.** There are no gates at this stage: an
unfinished bundle is not an error, and a document nobody filled in still loads. Checking
arrives as its own change, once there is something worth checking and somewhere to record the
verdict. The one thing reported at creation is a change with nowhere to land — one that alters
nothing and is filed under no capability — because publishing would then have neither a
document to write into nor a place to put a new one.
