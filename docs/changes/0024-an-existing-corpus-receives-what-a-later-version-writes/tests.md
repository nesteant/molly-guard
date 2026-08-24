# What will prove it

**A corpus missing `<root>/.gitattributes` gains it.** Built by deleting that file from a corpus
`init` made, then running `init` again. This is the case `0017` shipped and existing corpora could
not receive, and it is the one worth asserting by name rather than as one of a list.

**A corpus missing an area gains it and its explainer.** The general form, built the same way.

**Everything already there survives, byte for byte, and is named.** Each area README,
`docs/README.md`, `mollyguard.yml` and `history.jsonl` hashed before and after. The ledger is
asserted on its own, as it already is elsewhere: it is the one file that cannot be written again
from anything, and the workaround this change replaces is the one that puts it at risk.

**A hand-written explainer is kept.** An area README replaced with the project's own text is
byte-identical after a completing run, and appears in the kept summary. The tool must never be the
reason somebody's file changed.

**A second `mollyguard.yml` is still refused.** `molly init --root elsewhere` in a repository that
already has one names the configuring file and writes nothing — the refusal this change narrows is
asserted to still fire on the thing it was written for.

**A completing run and a creating run print different summaries**, asserted directly: the value of
the second run is telling somebody what it did and did not touch.

**Running it twice changes nothing the second time.** No file written, nothing new in `kept`,
exit `0`.

**`molly status` reports what is missing, and stops.** Present before the completing run, absent
after, exit `0` in both cases.
