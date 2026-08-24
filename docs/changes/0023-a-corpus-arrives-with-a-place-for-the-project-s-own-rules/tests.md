# What will prove it

**`molly init` in an empty repository leaves `docs/conventions.md`**, and the four installed skills
name a path that resolves. The second half is the assertion that matters and the one the
specification already demands of every other path a skill names: resolved against a corpus `init`
has just made, not against the text the skill was generated from.

**An existing `docs/conventions.md` survives, and is named.** The same assertion `docs/README.md`
already carries — byte-identical afterwards, and its path in the `kept` summary. A corpus adopting
MollyGuard on top of a repository that happens to have that file must not lose it.

**`molly agents` names the absent file once, and says nothing when it is there.** Both directions,
because a line that always fires is a line people stop reading.

**`molly init` exits `0` and `molly status` reports no finding on a corpus whose `conventions.md`
is the stub as written.** The file is optional, and a fresh corpus must not open with a complaint
about a file the tool just wrote.

**Nothing reads it.** A `conventions.md` holding invalid YAML, a null byte, or one megabyte of text
changes no command's behaviour and fails no run. Asserted rather than assumed, because the whole
value of the pointer is that the tool has no opinion about what is behind it.
