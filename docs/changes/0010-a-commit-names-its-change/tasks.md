# The work, in order

1. **Read a message, purely.** `core/commit.ts` — type, trailers, and whether git wrote it.
   Nothing calls it.

2. **Let a corpus declare what it asks.** `commit: { requires: [...] }` in `store/config.ts`,
   reported by name when the shape is wrong rather than read as none.

3. **Resolve.** `molly commit-msg <file>`, against `changes/` and the archive from `AREAS`, every
   trailer rather than the first.

4. **Install the hook.** `molly hooks install`, asking git where the hooks are and keeping one
   that is already there.

5. **Assert it**, including the two that are easy to get wrong: a trailer inside the comment
   block, and a worktree where `.git` is a file.

6. **Say it in `molly help`** and in the README, where the assertion count is stated.
