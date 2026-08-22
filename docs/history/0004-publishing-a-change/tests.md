# What will prove it

In `scripts/smoke.sh`, under `publishing`. Mostly refusals, and — because this is the first
command that writes in four places — several assertions about what is *still there* after one.

## A publication lands where its paths say

- A change with `publish/specs/<name>/spec.md` produces `docs/specs/<name>/spec.md`, with the
  text intact. No flag named the destination; the mirrored path did.
- Several documents land together, both as siblings in one specification and as **two whole
  specifications in one publication**. The second is the sweeping-edit case — a component
  renamed across the base touches many documents at once — and it must be ordinary rather than
  a special mode.
- A document that replaces an existing one **replaces it whole** — the old text is gone, not
  appended to.

## The change is finished, and the archive holds everything

- The bundle is no longer in `changes/` and is in `history/<slug>/`.
- `change.md` in the archive declares the terminal state, and the ledger's last line for that
  change carries it too.
- **The archive still holds `publish/`.** Asserted because it is the assertion that would
  silently stop being true: the archive is what answers "what did this change actually write"
  without consulting git.
- `molly status` lists it as published rather than as work in flight.

## Nothing is written unless everything can be

Every refusal fires before anything is written. Three of them are asserted twice — that they
refuse, *and* that the corpus is untouched afterwards — chosen as the ones latest in the order,
where a half-application would be possible at all. A refusal that half-applies is worse than no
check, and the two halves fail independently.

- **No `publish/` folder** — refused, naming what to create.
- **An empty one** — refused. Publishing nothing is not a no-op.
- **A document outside a publishable area.** `publish/capabilities/x.md` is refused and says
  why: a capability is written directly, not by a change. So is `publish/changes/…`.
- **A name that is not a usable slug** — the same rule creation enforces.
- **A new specification with no `spec.md`** — the area is bundled and that file carries the
  record.
- **A capability that does not resolve** — refused by name, listing the ones there are.
- **A document that cannot be read** — refused, not skipped. Asserted with a dangling symlink,
  which fails to read for anybody rather than only for a user without permission.
- **Every document identical to what is already there** — refused, and the change is left in
  flight. The last gate before anything is written, so the one where a half-application would
  show. This is the check that catches a drafter reporting work it did not do, and it is the
  reason the command can be pointed at an agent at all.
- **A change that does not exist** — refused, pointing at what does.
- **A change whose `state:` disagrees with the ledger** — refused, the same refusal `move`
  makes, because publishing out of a disputed state writes the knowledge base from a
  disagreement.
- **An archive already holding that name** — refused rather than overwritten.

## Both areas a change may write into

- A specification lands as a folder with its `spec.md`.
- **A decision lands as a file** — `publish/decisions/<name>.md` becomes
  `decisions/<name>.md`. The other shape, and the one the specification case would not catch.

## `--dry-run` decides identically and writes nothing

- It prints what would be written, and exits 0.
- Afterwards `docs/specs/` is unchanged and the bundle is still in `changes/`.
- **It refuses what the real run refuses**, asserted on at least one refusal, because a dry run
  that disagrees with the real one is worse than none.
- **It may be written before the change name.** A flag taking no value must not swallow the
  argument after it — before this, `--dry-run <change>` consumed the change as the flag's value
  and the command refused for having no change, naming the very argument just typed.

## The terminal state is reached here and nowhere else

- `molly move <change> published` is refused, and the refusal names `molly publish <change>`.
- **The refusal appends nothing**, counted per change — a refusal that half-applied would be
  worse than no check at all, and only the count tells the two apart.
- The picker does not offer it from any other state, and still offers the way back *from* it.

## The terminal state carries the command's name, and the old one still reads

- The sequence ends in `published`, and `molly move` names it among the eight.
- A ledger line recording `"to":"merged"` — written before the rename — **still folds**, and to
  `published`. Asserted with a refutation beside it: that line is not reported as unreadable
  either. An upgrade that silently emptied part of an audit trail would be the worst failure
  available to one, so both halves are checked.

## And the constraint holds

`@mollyguard/core` still declares no dependencies and its source contains no `node:` import, no
`Date.now` and no `new Date`. Publishing reads and writes more of the corpus than anything
before it, and none of that reached the engine.
