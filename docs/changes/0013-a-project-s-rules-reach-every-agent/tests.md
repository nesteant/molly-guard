# What will prove it

The harness already asserts the shape of every installed skill; these are the additions.

**Every skill still stands on its own.** Each of the four names where the corpus is, because only
one may be loaded and a skill depending on another being open is a skill that is sometimes wrong.

**The skills name no capability, no decision and not the corpus language.** Already asserted, and
it is the assertion this change had to be written *around*: composing `conventions.md` into the
skills would have broken it, and pointing at the file does not.

**The reference skill stays under 60 lines and the workflow skills under 30.** Four skills load
their name and description into every session that starts, so the cap is the point rather than an
inconvenience — and this change adds to two of them.

**`molly agents --check` passes on a fresh install** and still fails on a hand edit, naming it.
The installed copies in this repository are regenerated, so the check is asserting the text this
change actually ships.

**The instructions name only real commands.** The harness cross-checks every command named in a
skill against `molly help`, which is what stops guidance drifting into describing a tool that does
not exist — the failure this whole change is about, arriving through the door it came in.
