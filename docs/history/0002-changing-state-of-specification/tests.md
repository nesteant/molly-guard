# What will prove it

In `scripts/smoke.sh`, across three sections — `the lifecycle`, `the state a document claims`
and `picking, not typing`. As before, mostly refusals: a check that silently stops refusing
looks exactly like one that is working, and nothing else in the system notices.

## The sequence is well formed

- The states are unique, `INITIAL` is the first of them and `TERMINAL` the last — run against
  the **built** package so it fails the build rather than being trusted. Reachability and
  dead-ends became vacuous the moment any state could follow any other; what remains is that
  everything reading a position reads it from a list that is coherent.

## Creation is recorded, and a move is a different kind of event

- Creating a change writes a line of kind `created` carrying `"to":"draft"`, and **no** `from`.
- Moving it writes a line of kind `transition`.
- A line written before kinds existed — carrying a `from` and no `kind` — is still read, proved
  by the fold arriving at the state only that line could have produced. An upgrade that
  silently emptied an audit trail would be the worst possible failure of one.

## A bundle the ledger has never heard of

- A change created, moved, then renamed with `mv` is reported by `status` as one the ledger has
  no record of, **and** its `state:` is reported as disagreeing with the fold. Two independent
  signals for one mistake, where before there were none: folding answered `draft` and the next
  refusal stated the wrong state with full confidence.

## A change starts in draft, and moving is recorded

- A freshly created change reports `draft`, with exactly one line in the ledger — its creation.
- `molly move <change> review` prints `draft → review` and exits 0.
- The ledger then holds two lines for that change, the second carrying both states, an `at`
  that parses as a date, and a `by`. Counts are taken **per change** rather than over the whole
  file, so an assertion measures the code rather than how many changes the harness happened to
  create before it.
- `molly status` reports `review` afterwards — the fold, not the printed message, is what is
  being checked.

## Any state may follow any other

The absence of enforcement is a decision, so it is asserted rather than left as the state of
things nothing happens to check.

- `molly move walks deployed` from `review` **succeeds** — three states at once.
- So does a jump backwards over several.
- The direction is derived: a forward jump records `advances`, a backward one `returns`, without
  either edge appearing in any list.
- `published` is **refused**, and the refusal names `molly publish`. Counted as well as read:
  a refused move appends nothing, which is the half that would fail silently.

Two refusals remain, and both are about the argument rather than the order:

- An unknown state is refused and names all eight.
- An unknown change is refused and points at the picker.

## Returns and the count

- From `review`, moving back to `draft` succeeds and appends a second line — the first is still
  there, asserted by **counting**, because "the log was rewritten" and "the log was appended
  to" produce the same final state and only the count tells them apart.
- Across a walk of eleven events the ledger holds exactly eleven lines for that change, counted
  **per node** rather than over the whole file, so the assertion measures the code rather than
  how many changes the harness happened to create before it.

## Idempotence

- Moving a change to the state it is already in exits **0**, says it is already there, and
  appends **no** line. Both halves matter: the exit code so a re-run does not fail a pipeline,
  the count so a re-run does not inflate the audit trail.

## The state a document claims

- A new change's `change.md` contains `state: draft`.
- After a move it contains `state: review`, **and still contains its title and the prose below
  it**. Both are asserted, because a re-serialisation would pass a check that only looked at
  the state field while having dropped everything the model does not represent.
- Only the entry carries it: `plan.md`, `tasks.md` and `tests.md` contain no `state:` at all.
  Two projections of one fact eventually disagree with each other as well as with the source.
- Hand-editing `state:` to something else makes `molly status` **exit 1**, name the change, and
  print both answers — `says deployed, the ledger says review`.
- With the two disagreeing, `molly move` is refused and the refusal names both.
- Correcting the field by hand clears it and `status` returns to exit 0.

## What cannot be read is said out loud

- A malformed ledger line is reported and skipped, and the lines around it still fold.
- A change folder with no `change.md`, and frontmatter that will not parse, are each named.
- A stray file where the area holds folders is reported. It used to be filtered out and never
  mentioned, which is the failure mode the store exists to prevent.
- The directory's own `README.md` is not reported, and nor is a dotfile — reporting those would
  make the report itself the noise.
- **A corpus whose only changes are unreadable is not called empty.** It exits 1 saying how many
  could not be read; a genuinely empty one exits 0 and says what puts something in it. Telling
  somebody their corpus is empty while their work sits in it unreadable is the worst of the
  available answers, and it was the one being given.

## The two failures found in review

Both were silent, which is why they are asserted rather than merely fixed.

- A document with `\r\n` endings is still updated by a move, **and keeps those endings** — no
  line left with a stripped carriage return, which every later diff would show as noise.
- A document with genuinely no frontmatter still reports that it has none. The fix must not
  have turned a real failure into a quiet success.
- A corpus whose `.mollyguard/` is missing creates a change without crashing, and the creation
  is recorded. Before, the bundle was written and the append threw, leaving a change on disk
  the ledger had never heard of.

## Who did it

- A recorded transition carries a `by`.
- Run with git configuration made unavailable, `by` is the literal `unknown` — never a guess
  from `$USER` or anything else. A ledger that attributes a transition to somebody who did not
  make it is worse than one that admits it does not know.

## Picking, asserted without a terminal

The lists are pure functions, so they are checked directly. A list only reachable by driving a
TTY is a list nothing checks.

- From `draft`, every other state is offered — nothing is withheld, because withholding would be
  policy.
- The order is the useful part: from `in_progress`, `implemented` first, then the rest forwards,
  then the ones that go back. Sorted by name, `approved` would sit above `draft` and the common
  case would be the hardest to find.
- Each choice carries its direction.
- From `published`, the way back is still offered — it is not a dead end, only a state a move
  may not *enter*. A change that sits there through an old ledger or a hand-edited record can
  still be walked back.
- It is not offered from anywhere else, because a list holding something that will be refused is
  a list that teaches the wrong thing.
- The state a change is already in is never offered.
- **A filter may narrow.** One that keeps only `advances` from `in_progress` yields
  `["implemented"]`; one that keeps a single change yields that change.
- **A filter may not widen.** One naming the state the change is already in — which was never
  offered — alongside a real one yields only the real one; one inventing a change out of an
  empty list yields nothing. This is the pair that stops an extension changing what the
  lifecycle means, and it is where sequence enforcement will live once a slice can supply it.
- With no terminal, `molly move` refuses rather than waiting, and the refusal names the changes
  there are. The same with a change given but no state, naming the states reachable.
- A terminal change asked for a state says nothing leaves it, rather than presenting an empty
  list.
- An unknown name points at the picker instead of only listing slugs.
- With no changes at all, `molly move` says so instead of prompting over an empty list.

## And the constraint holds

`@mollyguard/core` declares no dependencies, and a grep over its source finds no `node:`
import, no `Date.now` and no `new Date`. The timestamp and the identity both arrive as
arguments, which is what keeps a result reproducible.
