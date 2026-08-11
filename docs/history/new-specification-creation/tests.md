# What will prove it

Nineteen assertions in `scripts/smoke.sh`, under `change new`. Nearly all of them are
refusals, because a check that silently stops refusing looks exactly like one that is working
and nothing else in the system notices.

**The bundle is four documents, and one of them is the record.**

- `molly change new` reports the change it created, and `change.md`, `plan.md`, `tasks.md`
  and `tests.md` all exist afterwards.
- `change.md` carries `title:` and the `alters:` list.
- `plan.md` contains no `---` anywhere. This is the one that would fail silently if a later
  edit started writing frontmatter into the parts — four titles that disagree produce no error
  at all, so the absence has to be asserted rather than assumed.

**A name is minted, and a bad one is refused.**

- A title over the limit produces `a-title-so-long-that-it-cannot-possibly-fit-inside-the` —
  clipped at the hyphen, not mid-word.
- `--name short-name` overrides the derived one.
- `"!!! ???"` is refused with *does not reduce to a name*, rather than producing a directory
  named for nothing.
- Creating the same name twice is refused with *already exists*, and the assertion runs after
  a successful create so it is the collision being caught rather than a missing corpus.

**Every refusal names its remedy.**

- `--kind epic` is refused, and the refusal lists `feature, bug, refactor, chore`. Both halves
  are asserted separately: a refusal that does not say what the valid answers are sends the
  reader to the source.
- `molly change new` outside a corpus reports *no corpus at* rather than creating one.

**A change with nowhere to land is reported, not refused.**

- Creating one that alters nothing and is filed under no capability prints *nothing to publish
  into yet*, and exits 0.
- Its `change.md` contains `alters: []` — the empty list, written. Asserting the literal text
  is what distinguishes "asked, nothing declared" from "the key was never written".
- A change that only *creates* — no `alters`, but a capability — is **not** remarked on. An
  empty `alters` is the normal answer for new truth, and a tool that nagged about it would be
  training people to ignore it.

**Creation reaches the ledger.**

- The new change has a line of kind `created`, carrying `"to":"draft"`.
- That line has **no** `from`. Nothing preceded a creation, and a null would invite a reader to
  treat it as a state.

**No format is imposed.** Two refutations over every file in a generated bundle:

- nothing contains `given:`
- nothing contains `SHALL`

These are the assertions that defend the extension seam rather than the behaviour. They fail
the moment someone adds a helpful example to a template, which is exactly when the corpus
would quietly acquire a house form nobody chose.

**And the constraint the design leaves behind is checked as a property, not a promise:**
a grep over `packages/core/src` for any `node:` import, `Date.now` or `new Date` must find
nothing.
