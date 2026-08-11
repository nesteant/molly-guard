---
description: Write what a change puts into the knowledge base, then publish it
disable-model-invocation: true
---

# Publish a change

The corpus is the directory holding `mollyguard.yml` — `docs/` unless a command was
given `--root <dir>`. Paths below assume the default; read them against the root you find.

1. Read the change's four documents, and the knowledge-base documents it alters.
2. Write `docs/changes/<change>/publish/`, mirroring the corpus. Each file is the **whole** new
   version of the document at that path — never a delta, never an append. A new specification
   carries its `spec.md`, and its `architecture.md` where the design is worth keeping.
3. **A decision is rare.** Write `publish/decisions/<name>.md` only for a rule a check enforces
   and that binds work not yet done; a rule the specification already states belongs there, not
   in a second document. It records no history — the archived change does — so whoever reviews
   the diff may delete one that is not doing work, and nothing is lost.
4. `molly publish <change> --dry-run`, then without it once the plan reads correctly.

The engine composes no text: you write every document and it verifies and files them. Everything
it writes is in the working tree and nothing is committed. Report what landed so it can be
reviewed as a diff.
