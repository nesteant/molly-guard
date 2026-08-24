# What will prove it

**The case that happened.** A corpus with two changes in flight, one referencing the other by
`../<other>/change.md`. Publishing the referenced one reports the referring file, its line, the
path that broke, and where it went — and the referring document is byte-identical afterwards. The
last clause is the assertion that matters: this change is defined as much by what it does not touch.

**A link that still resolves is not reported.** A change referencing the roadmap entry or the
published specification — the two targets that stay put — produces no finding. That is the bypass
this makes cheap, and it must be visibly free.

**Pre-existing breakage is not attributed to this publication.** A corpus holding a link that was
already broken before the command ran publishes with no finding about it. Otherwise the report
becomes a list nobody reads on the day somebody inherits an untidy corpus.

**Links inside the archived bundle are not reported.** The change being published references a
sibling; after archiving, that link is wrong. Nothing is said, because `history/` is sealed.

**Absolute and external links are untouched.** A `https://` link and a repository-root path in a
live document produce no findings.

**The exit code is `0` with findings present**, and the published documents are all in place. A
publication that reported a consequence still happened, and a caller automating against exit codes
must not see a refusal.

**It reports nothing when nothing pointed there**, which is the ordinary publication — asserted so
the common case is proven quiet.
