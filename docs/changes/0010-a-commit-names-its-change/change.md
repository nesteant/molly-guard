---
title: A commit names the change it implements
lang: en
kind: feature
capability: the-change-flow
state: draft
alters: []
---

# What this change makes true

**A commit message that names a change names one that exists.** `molly commit-msg <file>` reads
the message git is about to record and refuses a `MollyGuard: <id>` trailer pointing at nothing.
`molly hooks install` writes the `commit-msg` hook that runs it.

**Which commits must carry a trailer is the project's to declare, and that it resolves is not.**
`commit: { requires: [feat, fix] }` in `mollyguard.yml` asks it of those types. A corpus
declaring nothing requires it of nothing — and still refuses a trailer that names a change which
is not there, because a reference pointing at nothing is wrong under every convention.

**It resolves against `changes/` and `history/` both.** A commit landing today may implement a
change that publishes tomorrow, and one written six months ago names a change long since
archived.

# Why

Two things pulled this in, and they are the same thing said from either end.

A project enforcing the rule has to reimplement the tool's identifier format to do it. The
trailer's name is the tool's name, the id is the tool's id, and the check is "does this exist in
the corpus" — which the tool answers and the project was answering again, in a script that breaks
when either changes and that cannot be tested against the tool it is imitating.

And the split is the interesting half. **Which commits need a trailer is taste** — a repository
using conventional commits may want it of `feat` and `fix` and not of `docs`; one using no
convention wants it of nothing — so it is declared rather than assumed. **That a named change
exists is not taste.** Keeping those apart is what stops this being the tool imposing a commit
convention on every repository that installs it, which it has no business doing.

The composed message is what is read, and that is deliberate. A squash-merged pull request
becomes a commit whose message is the PR title and body, so a check running over the branch's own
commits passes on every one of them and lets that message onto the trunk unexamined. A
`commit-msg` hook is handed exactly what git is about to record, which is the only thing worth
checking.

What is left alone: subject length, scope vocabulary, imperative mood, and every other thing a
project lints. None of it is the tool's business.
