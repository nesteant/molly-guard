---
title: An install stays honest on somebody else's machine
lang: en
capability: the-corpus
---

# What is meant to be true later

**What `molly` writes outside its corpus is current, complete and correct — and can say so.**
Everything here is invisible in this repository and paid for entirely by everybody else.

## In rough order of what it costs to be wrong

**1. `molly init` writes the `merge=union` line.** Two branches that each advanced a change have
both appended at the end of `history.jsonl`, and git cannot know both additions are wanted. Union
merge is the correct resolution for a file whose lines are independent facts — and why nothing else
in the corpus gets that treatment. `molly init` creates the ledger, so a corpus it makes without
that line conflicts on its first concurrent branch. Written as a delimited block: rewrite between
markers, leave the rest of the file alone. An hour of work, and the one setup step a new corpus
silently misses.

**2. An install removes what a previous version wrote.** `molly agents` installs and compares, and
the comparison only looks at files it already knows the name of. Renaming or dropping a skill
leaves an orphan that `--check` cheerfully calls current — the exact failure the check exists to
prevent, one level up — and an agent then loads instructions no version of this tool would write
today.

The tool owns `molly-*` directories under the skill roots it writes, so a directory matching that
shape and not in the current set is an orphan: reported by `--check`, removed by an install. **The
blast radius wants stating before the code, because this is the first thing MollyGuard does that
deletes rather than writes, and it deletes outside its own corpus:** only directly under a root
this run wrote, only `molly-` prefixed, only containing a `SKILL.md`.

**3. The tools nobody has read yet.** A row is a claim about where somebody else's software looks,
and the only acceptable source is that vendor's documentation. That is a finding rather than a
scruple: the most-cited comparison table had Cline on the shared root and Windsurf off it, both the
wrong way round, and believing it would have written two files where nothing reads them — which
looks exactly like working.

*Not read yet:* Continue, Augment, Warp, Trae. Each is a row, a vendor page and an assertion, and
each arrives when somebody wants that tool.

*Refused with a reason, so the next reader starts from the finding:*

| tool | what its documentation says | why there is no row |
| --- | --- | --- |
| Kilo Code | reads `.agents/skills/` and `.claude/skills/` | an open report that it loads neither, so the claim is contradicted at the source |
| Qwen Code | reads `.qwen/skills/` only | a fifth directory for one tool; the request for the shared root is open |

Both are worth re-reading rather than re-deciding: Kilo's is a bug report that may close, Qwen's a
feature request that may land, and either turns a paragraph into a row.

**4. Translating the skills — undecided, and nothing is broken.** The half that matters works: an
English instruction produces Ukrainian documents. Translating the instructions themselves means
either shipping a translation per language, which goes stale silently, or generating one, which
puts model output into a file the tool claims to own — contradicting the rule the scaffold rests
on, that everything written outside the corpus is regenerable byte-for-byte, which is what makes
`--check` mean anything. Reopened by somebody running a corpus in a language they cannot instruct
an agent in, not by somebody tidying.

# Why it is not a change yet

1 and 2 are unblocked and small; 2 needs its blast radius agreed before the code, which is most of
the work. 3 is not a design problem at all — each row is independent and verifiable in minutes, and
worth nothing until somebody uses that tool, since writing rows nobody reads is how the wrong ones
got into circulation. 4 has two bad answers and no forcing case.
