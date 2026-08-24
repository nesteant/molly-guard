---
title: The knowledge base is read back
lang: en
kind: feature
capability: the-corpus
realises: what-mollyguard-still-owes
state: draft
alters:
  - specs/what-a-command-may-never-do-silently
  - specs/creating-a-change
---

# What this change makes true

**`molly status` reports what is in the knowledge base**, in the table and in the JSON: the
specifications in force, grouped by the capability each declares, and the decisions that bind.
Until now `molly publish` filled `specs/` and `decisions/` and no command looked at either again.

**A published document's `capability:` is resolved.** The check that fails a build for a change in
flight naming a capability nobody wrote now covers the half of the corpus that is permanent. A
specification filed under a capability that has gone is reported and fails, for the same reason its
in-flight counterpart does: it is truth that is present and unreachable.

**`alters:` resolves.** A change naming a document that is not in the base is reported. It does not
fail — the document may be arriving in the same change, or in one still in flight — but it is said,
every run, because a change that claims to alter `specs/loging-in` and never does is a claim
nothing has ever checked.

**A scan that cannot read a document says so, and the document is still listed.** The knowledge
base is where the corpus's whole value sits, so a specification with broken frontmatter is reported
and its neighbours still appear. Nothing is dropped from a listing in silence.

# Why

The product's claim is that the knowledge base stays true. Before this, nothing could say what was
in it.

Run the adopter path on a clean repository — `init`, a capability, a change, publish — and the
specification lands on disk and is never mentioned by any command again. `molly status --json`
contained the string `specs` zero times in a corpus with a published specification in it. Somebody
evaluating the tool publishes their first document and the tool goes quiet about the one thing it
exists to protect.

**Three gaps, one missing piece, and that is the argument for the shape.** Reporting the base,
resolving a published `capability:`, and resolving `alters:` are three features and one scan; built
separately they would be three passes over the same directories that eventually disagree about what
they found. The scan is written once and the three answers are taken from it.

**The reason `alters:` was deferred has expired.** It was left unresolved because it named documents
in empty directories, and a check that passes for want of anything to fail it is indistinguishable
from one that does not work. There are eight specifications and four decisions now. Meanwhile
`--alters specs/loging-in` — a typo — is accepted at creation, survives publication, and is never
mentioned: a lie in frontmatter that nothing has ever been able to catch.

**What this does not do**, and both are deliberate. It does not read a body: what is reported comes
from frontmatter and from the path, so the prose stays in whatever language and shape its author
chose. And it does not offer a bounded read of one capability, or render an overview — those follow
from this scan and are separate work, kept out so that the thing every command needs lands first.
