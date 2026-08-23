# How it will be built

One new module, and a great deal of removal.

## Finding it

`store/locate.ts`:

```ts
export interface Corpus { root: string; dir: string; config: string; }
export async function locateCorpus(cwd: string, given?: string): Promise<Corpus | undefined>;
export async function corpusAt(at: string): Promise<Corpus | undefined>;
```

Walk up from the working directory. At each ancestor, `mollyguard.yml` is the new shape and
`root:` names the corpus; without `root:` the corpus is the directory holding the file. The old
default is also checked at each level, because it lies *below* the working directory rather than
above it — a repository that never migrated would otherwise stop being found from its own root,
which is the one place everybody runs commands from.

`corpusAt` is the same question without the walk, and it is what `init` asks. The difference is
the point: a repository may hold a corpus at its top and another in a package below, and asking
the wider question would refuse the second for the existence of the first.

**`dir` is the corpus's name and never a path computed from the working directory.** Those differ
the moment somebody stands in a subdirectory, and a tool calling one corpus `docs` from one shell
and `../../../docs` from another produces output nothing can compare or paste.

## Reading it

`readConfig` takes the configuration's path rather than a corpus directory, and gains `root:`.

## One guard instead of seven

`bin.ts` locates once and refuses once. Every command drops its own copy of
`if (!existsSync(join(root, CONFIG_FILE))) fail(...)` and takes a `Corpus` instead of a root and a
display name.

Two things are exempt and named in a set rather than a chain of comparisons: `agents` writes the
instructions agent tools read, outside the corpus by design and holding nothing from it, so it
works in a repository that has not been initialised; `hooks` writes into `.git`. `init` is
handled before, being the one that creates.

An unknown command is refused before any of this. Answering *no corpus here* to `molly frobnicate`
answers a question nobody asked.

## Reading it once, and refusing early

Also in `bin.ts`: the configuration is parsed once and its problems refuse before any command
runs. That removes two per-command copies of the same check and closes the silent fallback.

## What this constrains afterwards

**A corpus is located, never assumed.** No command constructs a path from the working directory
and a default name.

**A configuration the tool cannot read is refused, never worked around.** A fallback that guesses
is how a tool reports success over something it did not look at.
