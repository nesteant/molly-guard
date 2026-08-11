# @mollyguard/store

The filesystem adapter of [MollyGuard](https://github.com/nesteant/molly-guard): it reads and
writes a corpus, and holds every path decision in one place.

Change bundles, capabilities, the documents a change proposes to publish, and the append-only
transition ledger. A scan reports what it cannot read rather than skipping it, and a write is
composed in memory and refused before anything lands if a name is taken — so a refusal leaves
nothing half-made on disk.

```bash
npm i @mollyguard/store
```

You do not need this package to use MollyGuard. Install [`mollyguard`](https://www.npmjs.com/package/mollyguard)
for the command line; install this one to read or write a corpus from your own code.
