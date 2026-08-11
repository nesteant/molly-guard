# @mollyguard/core

The engine of [MollyGuard](https://github.com/nesteant/molly-guard): the areas a corpus divides
into, how a document is named and located, the change lifecycle, and the templates a new
document opens on.

**Pure.** No filesystem, no network, no clock. Timestamps and identities arrive as arguments,
which is what lets the same code answer the same way behind a terminal, inside a server, and in
a test. The build fails if anything here imports `node:`, reads `Date.now` or constructs a
`Date`.

It also parses no document body. Structure is carried in frontmatter or read by an extension,
never inferred from prose — which is what leaves every language and every requirement format
available.

```bash
npm i @mollyguard/core
```

You do not need this package to use MollyGuard. Install [`mollyguard`](https://www.npmjs.com/package/mollyguard)
for the command line; install this one to build something on top of the same rules.
