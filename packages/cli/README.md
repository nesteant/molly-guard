<p align="center">
  <img src="https://raw.githubusercontent.com/nesteant/molly-guard/main/assets/logo.png" alt="MollyGuard" width="320">
</p>

<h1 align="center">MollyGuard</h1>

<p align="center">Your specification guardian.</p>

A molly-guard is the cover over a big red button. This one covers the knowledge base, so
nothing enters it because somebody believed it was ready.

```bash
npx mollyguard init     # the corpus, and the instructions an agent reads
npm i -D mollyguard     # pin it: the version that checks the corpus is the one in the lockfile
npx molly status        # what is in flight, and where it is
npx molly agents        # reinstall them: skills every major tool reads, commands you can type
npx molly help
```

An agent that works out on its own that a request is a change reads the skills; somebody who
already knows types the command, spelled the way their tool spells it — `/molly:new` in Claude
Code and Gemini CLI, `/molly-new` in Cursor, Copilot, OpenCode, Junie and Kiro. Both carry the
same text, one action is one entry in either place it can appear, and `molly agents` prints
which spelling it just made typable.

The first line reaches the registry; every line after it resolves the pinned binary in
`node_modules`. That is deliberate — a check whose version can change between two runs with no
commit recording it is a check nothing can answer for, which is the whole argument below.

## The specification is in `docs/`, not here

**This file is deliberately thin.** MollyGuard is specified in its own corpus, and a second
description living in a README is a second answer to every question — which is the failure the
tool exists to prevent. What the product does, why it does it that way, and what it refuses are
in `docs/`, written as changes and read through the tool:

```bash
molly status                        every change, and where it is
docs/capabilities/<name>.md         what the product is responsible for, and where the edges are
docs/changes/<name>/change.md       what it makes true, and why
docs/changes/<name>/plan.md         how it is built, and what that constrains afterwards
```

Accumulated truth arrives only by publishing a change: the change carries the documents it
proposes in `changes/<name>/publish/`, mirroring `docs/`, and `molly publish` files them,
archives the bundle and records it. **The tool composes no text** — every published document
was written by a person, or by an agent acting as one, and what the tool guarantees is that
nothing arrives unverified and unrecorded.

Intent that has not become a change yet is in `docs/roadmap/`, written by `molly roadmap new`
and listed by `molly status`. There is no roadmap file outside the corpus: one would be a record
nothing manages, which is the half-governed state this tool exists to prevent.

## Working on the tool

```bash
npm run build
npm run smoke     # 370 assertions
```

Three packages: `@mollyguard/core` decides and holds no I/O, `@mollyguard/store` reads and
writes the corpus, `mollyguard` parses argv and prints. The build fails if anything under
`packages/core/src` imports `node:`, reads `Date.now` or constructs a `Date` — timestamps and
identities arrive as arguments, which is what lets the same code answer the same way behind a
terminal, inside a server, and in a test.

## Driving it from something that is not a person

Exit codes say whether it worked: `0` clean, `1` a refusal, `2` a defect in the tool. The third
keeps a crash distinguishable from a refusal in a build log, and every refusal names its remedy
on stderr rather than quoting a rule.

`molly status --json` says what is *there* — every change with the state folded from the ledger,
the capabilities, and the findings, each saying whether it fails. It is the same gathered report
the table renders, so the two cannot disagree. An absent field means undeclared; it is never
null. Read `ok` rather than branching on the exit code, which is also `1` for a refusal.

An unrecognised flag is refused rather than ignored, so a mistyped `--dry-run` cannot publish.

MIT licensed.
