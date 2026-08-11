---
title: Commands every tool spells its own way
lang: en
kind: feature
capability: the-corpus
state: draft
alters: []
---

# What this change makes true

`molly agents` installs **two** surfaces rather than one. The skills are unchanged and go where
they always went; beside them go command files, in the seven directories whose tools read one:

```
molly agents          .claude/commands/molly/new.md      typed as  /molly:new
                      .junie/commands/molly-new.md       typed as  /molly-new
                      .kiro/prompts/molly-new.prompt.md  typed as  /molly-new

molly agents --tools gemini,cursor,copilot,opencode      the other four
```

The name is not declared in any file. Every one of these tools reads it off the path, and the
two shapes are the two answers vendors gave to the same question: **Claude Code and Gemini CLI**
turn a subdirectory into a prefix, so `commands/molly/new` registers `molly:new`; **Cursor,
GitHub Copilot, OpenCode, Junie and Kiro** take the filename whole, so the prefix has to be
inside it — `molly-new`. The install prints which spelling it just made typable, per tool.

Both surfaces carry the same body, from the same table, byte for byte. What differs is one line
of frontmatter: a skill's `description` ends in the conditions under which a model should load
it, and a command's is the same sentence with that half removed, because the reader of a palette
has already chosen and is looking for the entry they meant.

**One action is one entry, in each of the two places an entry can appear.** Claude Code reads
both directories into a single namespace — a file under `commands/` *is* a skill there — so a
tool given both surfaces would offer `/molly:new` and `/molly-new` side by side, and describe
four things to the model twice over. Its two copies say which half each is for: the skill is
`user-invocable: false`, out of the menu and still in the model's context with the description
written for it; the command is `disable-model-invocation: true`, in the menu and out of the
context. Those keys go into that tool's copy only. No other tool merges the two namespaces, and
none of them is handed a key its own specification does not have.

# Why

A skill is loaded by a model that decided, on its own, that a request is ours. That is the right
surface for somebody who has never read this README and describes what they want in their own
words — and it is the wrong one for somebody who knows exactly what they want. They have to
describe the work to get the thing they could have named, and a description can miss.

The four skills were the whole of the install because the shared skills format is what makes one
installation serve sixteen tools, and a command file per vendor is four incompatible shapes to
keep true. That trade was read the wrong way round. The shapes differ in a **path and a
frontmatter key**, not in the text; the text is one string in one table, and every tool gets a
wrapper around it. The cost of the second surface is the table, and the table was already there.

What it costs is honest to state: seven paths that are claims about somebody else's software,
which will drift when a vendor moves a directory, and a wrong path is invisible — the file
writes, the install reports success, and nothing is ever typable. The mitigation is the same one
the skills already have. Every path is checked by `molly agents --check`, every one was read
from that vendor's own documentation, and the run prints the spelling rather than leaving it to
be guessed.
