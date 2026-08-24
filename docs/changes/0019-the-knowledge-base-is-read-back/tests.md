---
title: The knowledge base is read back
lang: en
part: tests
---

# What will prove it

The fixture is the adopter path, because that is where the gap was found: init, a capability, a
change, publish — then ask the tool what is true.

## It says what is there

- After publishing one specification, `molly status` names it and the capability it is filed under.
- `molly status --json` carries it. Asserted on the JSON specifically: the measurement that started
  this change was `status --json` containing the string `specs` zero times in a corpus with a
  published specification in it.
- A published decision is listed, and **without a capability** — the area is not grouped, and a
  rendering that invented one would be inventing a rule the corpus has not got.
- An empty base says nothing about specifications rather than printing an empty heading.

## A published reference that has stopped resolving

- A specification filed under a capability, the capability deleted: reported, and `status` **exits
  1**. Same severity as the in-flight check, because truth nothing points at is worse than absent.
- The in-flight version of that check keeps its exact behaviour and wording.

## `alters:`, resolved at last

- A change naming `specs/loging-in` — a typo for a document that exists — is reported. This is the
  case that has been silently accepted at creation, through publication, for every version so far.
- It does **not** fail: the document may be arriving in this very change. Asserted, because failing
  here would refuse the ordinary case of a change that alters something it is also creating.
- A change altering a document that **is** there is not remarked on.
- An **archived** change naming a document since removed is not reported — the finished shape of
  the link, exactly as with `--realises`.

## What cannot be read is still listed

- A specification with broken frontmatter: reported, and its neighbours still appear in the
  listing. A listing that drops what it could not read vouches for a corpus it has not seen.
- It does not fail. The document is present and readable by a person; only its record is broken.

## What must not have changed

- `molly publish` still refuses at the write for a new document filed under a capability that does
  not exist. That refusal fires at the last recoverable moment and is not replaced by this report.
- The whole suite passes, including every assertion about the change listing, which shares the
  gather this touches.
