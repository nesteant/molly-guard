# What will prove it

Every one of these is an assertion in `scripts/smoke.sh`, run against a real corpus in a
temporary directory.

## The names

**A name is numbered where a pattern asks.** `changes: '{ordinal:4}-{slug}'` makes the first
change `0001-first-thing` and the next `0002-second-thing`.

**A deleted change does not free its number.** Two changes, the second deleted with `rm -rf`, and
the third is `0003` rather than `0002`. This is the assertion the whole design is for: it is the
case a person reading `ls` cannot get right, and the only source that still remembers is the
ledger.

**An area with no pattern is unnumbered.** `capability new` in the same corpus produces
`billing.md`. A policy is per area and silence means the name is the slug.

**A corpus with no policy at all is unchanged.** No `naming:` and no number anywhere — the
assertion that this is an offer rather than a default, which would look identical from the other
side if it were not.

**`--name` still overrides.** `--name legacy-name` produces exactly that, unnumbered. The
migration of a corpus onto a pattern is made of these.

## The names a publication writes

**A published name off the pattern is refused**, and the refusal names the folder to write
instead — `0001-feeding-schedule`, not merely "that is wrong". A name the author cannot see
before it is permanent is a name they will get wrong.

**Nothing was published.** The refusal is checked to have written no document, because a
publication is all of its documents or none of them.

**A name on the pattern goes straight through**, which is the assertion that this is a check and
not a rename.

**Replacing a document keeps its old name.** A corpus adopting a pattern after it has documents
is never asked to renumber them, and a change editing one is not blocked on doing so.

**A file joining an existing document is not new.** An `architecture.md` published into a folder
already in the base passes: a document is bundled, so *new* is a question about the folder rather
than about each file in it.

**A publication in a corpus with no policy is untouched**, in the same words as everywhere else
this offer is checked for being an offer.

## The configuration

**A pattern that will not parse is refused**, naming what a usable one looks like. `{ordinal}`
without a width is the realistic typo.

**An area nobody has is refused**, naming the areas there are. `chnages:` would otherwise be a
policy that never fires, and the corpus would believe it had one.

## The language

**A minted document takes the corpus's language.** `molly init --lang uk` then `change new`, and
`change.md` says `lang: uk`. So does a capability, and so does a roadmap entry. Before this they
all said `lang: en` inside a corpus that had declared otherwise.

**The flag still overrides it**, and a corpus declaring nothing is still English. Three answers in
order of who has the better claim to know.
