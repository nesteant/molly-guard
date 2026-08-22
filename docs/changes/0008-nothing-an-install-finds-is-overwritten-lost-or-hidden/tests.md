# What will prove it

Every one of these is an assertion in `scripts/smoke.sh`, run against a real corpus in a
temporary directory. All three defects are about what happens on a filesystem that already has
something on it, so all three are asserted against one.

## What an install finds

**The file survives.** A `docs/README.md` written by hand, holding a line nothing in this tool
would ever produce, still holds that line after `molly init`. This is the reported defect, said
directly.

**And the run says so.** The output names the path it kept. A skip nobody is told about is a
different failure from an overwrite and not a smaller one — the reader believes the explainer
in front of them is the one init writes.

**And the corpus is still made.** Exit `0`, `corpus initialised`, and the areas that were absent
have their explainers. Keeping a file is not a refusal; the run did everything it could do.

**The ledger is not truncated.** A `docs/.mollyguard/history.jsonl` with a line in it, and no
`mollyguard.yml` beside it, still has that line afterwards. This is the case the reported one
was a mild instance of: a README can be written again from the tool, and a ledger cannot be
written again from anything.

**A written file is still written.** In a directory with nothing in it, init creates every
explainer and keeps none — the assertion that `place` did not turn into a no-op, which would
look exactly like a fix from the other side.

## The name a title is given

**A mixed-script title is refused.** `molly change new "Вхід через Entra ID"` exits `1` and
names the words it would have lost. The reported defect: the same command exited `0` and made
`entra-id`.

**And shows what it refused to mint.** The message contains `entra-id`. A refusal that says a
name would be partial without saying which name is one the reader cannot check.

**And `--name` still works.** The same title with `--name entra-login` creates the change. The
refusal is about deriving a name, not about the title — a corpus written in Ukrainian has to
remain usable, which was the point of the complaint.

**A title that reduces to nothing keeps its message.** `"!!! ???"` still exits `1` with
`does not reduce to a name`. Two refusals, and the one that already read well is not replaced by
one that would say the name is `""`.

**Punctuation is not a lost word.** `"Refunds — and their edges"` creates
`refunds-and-their-edges` and is not refused. Without the letter-or-digit test, every em dash in
every title becomes a refusal — a check that fires on everything is as useless as one that never
fires.

**A name given by hand is judged on its own.** `--name "Not A Slug"` is refused for not being
typable, and says so. It used to be refused by the message about the title not reducing, which
named a derivation that never happened.

**A capability is named by the same rule.** `molly capability new "Облік expenses"` is refused
too. The block was duplicated before this change and duplicated code is fixed once. The title is
mixed on purpose: `"Облік витрат"` reduces to nothing and would be caught by the refusal that
was already there, proving the old rule rather than this one.

## The area a planner reads

**An entry appears in the table.** A file in `docs/roadmap/` shows up in `molly status`, by
name. This is the defect: it did not.

**And in `--json`.** With its title, for a reader that is not a person. The table and the
document are two renderings of one gathered report, so an entry in one and not the other is the
disagreement this command is built to make impossible.

**And its capability.** An entry declaring one carries it; an entry declaring none has no such
field at all — absent means undeclared, which is the rule the rest of the report already keeps.

**Its README is not an entry.** `roadmap/README.md` is documentation in every area, and an area
that holds files is where that rule is load-bearing.

**An entry with no frontmatter is still listed**, under its filename. Dropping it would hide
exactly the entries written fastest, which are the ones a planner most needs to be reminded of.

**A corpus with nothing intended says nothing about it.** No `roadmap` line where the directory
is empty — a young corpus is not a broken one, and a report that announces every empty area is
one people stop reading.

**What cannot be read is said, and does not fail.** A folder in `roadmap/` is reported and the
exit code stays `0`. The contrast is asserted rather than assumed: the same shape of damage in
`changes/` fails, and the two answers are the difference between a governed unit and a note.
