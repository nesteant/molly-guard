---
title: Creating a change
lang: en
capability: the-change-flow
---

# What a change is, on disk

One unit of intent is four documents in one folder, written by one command that asks nothing
and checks nothing.

```
molly change new "<title>" [--name <name>] [--capability <name>] [--alters specs/<name>]
                           [--kind feature|bug|refactor|chore] [--lang <tag>]

docs/changes/<name>/
  change.md    what this change makes true, and why   ← the record
  plan.md      how it will be built
  tasks.md     the work, in order
  tests.md     what will prove it
```

All four are written every time, filled or not. **A change is not finished when its text is
written**: a specification with no design has not been thought through, a design with no task
order is not schedulable, and work with no tests is not verifiable. Creating all four at once
is what makes the missing ones visible — a folder with three filled files and one still
carrying its opening prose says exactly where the thinking stopped, where a change that never
created the file says nothing at all.

They are siblings in one folder rather than four documents in four places because they are
reviewed together, moved together, and archived together. A design that lives somewhere else
is a design nobody re-reads.

**Only `change.md` carries a record.** Its frontmatter holds the title, the language, the
kind, the capability the work is filed under, the state it starts in, and what in the
knowledge base it alters. The other three are prose from the first line. If each file declared
its own `title` and `kind` they would drift apart within a week, and nothing would say which
one was right.

An absent capability is omitted from the record entirely rather than written blank, because
"not answered" and "answered, nothing" are different facts. An empty `alters` is written as
`[]`, for the same reason read the other way round: nothing declared is the normal answer for
a change introducing new truth, and the file has to be able to say it.

# The name

The directory name is minted from the title: ASCII, lowercase, hyphenated, capped at 60
characters, and clipped at a word boundary rather than mid-word — `…-inside-the` reads as
abbreviation where `…-inside-the-li` reads as corruption, and a slug is a filename people type.
`--name` overrides the derived one.

A name is derived once, from whatever language its author was writing in, and never touched
afterwards. That is what lets one document be cited by the same name in every language it
exists in.

**It is derived from the whole title, or not at all.** A title that reduces only partly — *Вхід
через Entra ID* becoming `entra-id` — is refused, and the refusal names the words that would have
been lost as well as the name it declined to mint. Refusing costs one `--name`. Not refusing costs
a name for as long as the corpus lives: minted once and never translated is exactly what makes a
silently partial name permanent, and `entra-id` would be typed, cited and archived under a title
it no longer resembles.

Clipping is not loss. A title over the cap loses its tail deliberately and visibly and is not
refused — the rule is about the alphabet, not the length. A name given with `--name` is judged
only on being typable: the author looked at their title and chose.

# What it refuses, and what it merely reports

Every refusal names the remedy rather than the rule, and every one fires before anything is
written:

- no corpus at the root — where to run `molly init`, or to pass `--root`
- a missing title, and a title that reduces to no usable name — `--name` to choose one
- a title that reduces only partly, naming the words that would be lost and the partial name it
  refused to mint
- a `--kind` outside the four, which lists the four
- a `--capability` that does not exist, which lists the ones that do
- a directory already taken — `--name` to choose another

The bundle is composed in memory and written only once the target directory is known to be
free. A half-written bundle exists as far as a listing is concerned and is incomplete as far
as anything reading it is concerned, with nothing to say which.

**A change with nowhere to land is reported, not refused.** One that alters nothing *and* is
filed under no capability is told so — publishing it would have neither a document to write
into nor a place to put a new one — and the command still succeeds. Either half can be decided
after the bundle exists, and the moment to notice is while the author is still at the terminal.
An empty `alters` on its own is never remarked on; a tool that nagged about the normal answer
would be training people to ignore it.

# Creation is recorded

Writing the bundle appends one line to the transition ledger: the change was created, in
`draft`, by whom and when. The line carries no `from` — nothing preceded a creation, and a null
there would invite a reader to treat it as a state.

That costs one line and buys two things. The state the document declares is backed by a record
rather than by the absence of one. And a bundle the ledger has never heard of becomes a
*signal* — something arrived without going through the tool.

The event is appended after the bundle is on disk, so a refused collision leaves no event
behind for a change that does not exist.

# No format is imposed

The templates name the section and stop. Not one `given`, not one requirement keyword, not one
heading that presumes an acceptance-criteria methodology — because whatever the template shows
is what the corpus fills up with, and what it leaves blank is what stays blank. A template
opening on Given/When/Then would make Given/When/Then the corpus's form for ever, and would put
English keywords into text that is supposed to be translatable.

A team that wants a form installs the slice that supplies it: the slice replaces the templates
whole and adds the check that reads them.

The cost of getting this wrong is not that a document comes out badly shaped; it is that the
shape becomes unnegotiable. Every corpus created before the format was pluggable would carry
the built-in one, and every tool downstream would come to depend on it being there.

# Nothing is checked yet

There are no gates at creation. An unfinished bundle is not an error, and a document nobody
filled in still loads. Checking arrives on its own terms, once there is something worth
checking and somewhere to record the verdict.
