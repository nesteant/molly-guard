# What will prove it

Assertions in `scripts/smoke.sh`, against real corpora in temporary directories.

## Where the file is

**It sits above the corpus**, saying `root: docs`, **records the language**, and **is not inside
the corpus** — three assertions because the third is the one that would still pass if the file
had merely been copied.

**`--root` at init names the directory**, and the configuration records it.

## Finding it

**A command works from a subdirectory**, three levels down, with no flag.

**And names the corpus the same way from there** — `docs/capabilities/billing.md`, not a path
relative to wherever the shell was. A tool that renames the corpus depending on where you stand
produces output nothing can compare.

**Outside any corpus it says so**, naming where it looked.

## One configuration, one corpus

**A second corpus here is refused**, and **names what configures it**.

**One below another is allowed** — a package inside a larger repository — and **the nearer one is
the one found**, which is what makes nesting mean anything.

## The old layout

**A corpus in the old layout still reads**, **is still found from below**, and **`init` will not
double it**. Nothing has to be migrated.

**`--root` still points at one**, for a corpus that is not at `docs/`.

## What is not about a corpus

**`agents` needs no corpus** — it writes where agent tools look, and must work in a repository
that has not been initialised.

**An unknown command says so first**, rather than answering a question nobody asked.

## The silent fallback

**A configuration that will not parse is refused**, naming the line — and **does not report an
empty corpus**. This is the one that matters: it exited `0` over a corpus it had never looked at,
which is the failure the whole product exists to prevent.
