---
name: molly-corpus
description: How a MollyGuard corpus works - where accumulated truth lives, what may never be edited by hand, and how a document enters it. Use when the repository has a mollyguard.yml and any specification, decision or change is being read or written.
---

# MollyGuard

`mollyguard.yml` sits at the top of the repository and names the corpus directory —
`docs/` unless it says otherwise, and is found from anywhere inside. Paths below assume that.

`docs/specs/` and `docs/decisions/` are the knowledge base: what the product is currently
believed to be. **Nothing enters it except by publishing a change.** Never edit them directly: to
correct one, copy it into `docs/changes/<change>/publish/` at the same path and edit the copy —
the only route a sentence takes into a filed document, and the whole record that anybody agreed.

`molly help` lists the commands. Exit codes: `0` clean, `1` a refusal, `2` a defect in the tool.

## Read before writing

1. `molly status` — what is in flight, the capabilities that exist, and what is already
   intended in `docs/roadmap/`.
2. Every file in `docs/decisions/` — each is a constraint your work must respect.
3. `docs/conventions.md`, if it is there — this project's own rules for writing in this corpus.
   The rest of this skill is how MollyGuard works; that file is how *this* repository uses it,
   and where the two differ it wins.
4. `lang:` in `mollyguard.yml` — write all document prose in that language.

## The flow

```
molly change new "<title>" --capability <name> [--alters specs/<name>]
    then fill in docs/changes/<name>/{change,plan,tasks,tests}.md

molly move <change> <state>     draft → review → approved → in_progress
                                → implemented → verified → deployed

    then write docs/changes/<name>/publish/, mirroring the corpus:
    publish/specs/<name>/spec.md becomes docs/specs/<name>/spec.md

molly publish <change> [--dry-run]
```

## What you will otherwise get wrong

- **The engine composes no text.** You write every document; `molly publish` verifies and files
  it. A publication where nothing differs from the knowledge base is refused.
- **A document is replaced whole.** There is no delta format — no `## ADDED Requirements`, no
  patch, no merge of two texts. To change a specification, write the new version of it entire.
- **`publish/` mirrors the corpus**, and the path is the whole instruction. A new specification
  must carry its `spec.md`; a decision is one file at `publish/decisions/<name>.md`.
- **A decision is rare** — a live constraint, never a record: only a rule a check enforces that
  binds work not yet done. History is `history/` and the ledger, so one doing no work is deleted.
- **Never** edit `docs/.mollyguard/history.jsonl`, and never hand-write `state:` — `molly move`
  writes it, and a document disagreeing with the ledger is refused.
- **One claim per change.** A second claim is a second change.
- **Each of the four documents names the reader it is written for**, and that reader settles
  where a sentence goes: one its reader would not need moves to the document whose reader would.
- **Frontmatter is a closed record.** A change's is written by `molly change new`; a published
  document carries `title`, `lang`, and `capability` in `specs/`. Never a key to match a neighbour.
- `published` is reached only by `molly publish`, never by `molly move`.
