# How it will be built

The reduction stays pure and the allocation goes where the I/O is, which splits this cleanly
across the three packages.

## The shape of a name

`core/naming.ts`, pure string work:

```ts
export function isNamePattern(pattern: unknown): pattern is string;
export function needsOrdinal(pattern: string): boolean;
export function renderName(pattern: string, parts: NameParts): string;
export function matchName(pattern: string, name: string): NameParts | undefined;
```

Exactly one `{slug}` and at most one `{ordinal:n}`; everything else literal. A pattern with two
of either is refused rather than rendered — a name without its words is a number nobody can read,
and one with them twice is a name no reader can parse back.

`matchName` returning undefined is the ordinary answer rather than an error. A corpus that adopts
a pattern still holds every name minted before it did, and those are simply names this pattern
did not produce, holding no ordinal to avoid.

## Reading the configuration

`store/config.ts` gains `naming:`, and gains the habit of *checking* it. An area nobody has is
reported rather than skipped — silently ignoring `chnages:` is how a repository spends a month
believing it numbers its decisions. A pattern that will not parse is reported the same way.

Both are refused before any command acts, so a corpus that believes it numbers its changes and
silently does not is impossible rather than merely unlikely.

## Allocating

`store/naming.ts`:

```ts
export async function allocateName(root, area, pattern, slug): Promise<string>;
export async function takenOrdinals(root, area, pattern): Promise<ReadonlySet<number>>;
```

Three sources, and the third is the reason this belongs in the tool at all: the area, the archive
named by `AREAS`, and every node the ledger has ever mentioned in that area. A person reading a
directory listing sees the first of the three.

## One seam

`nameFor` in the CLI already exists and is already the only place a name is minted — the
bug-fix change put it there. It widens to take the corpus and the area, derives the slug exactly
as before, and applies the pattern last. A `--name` given by hand is checked for being typable
and for nothing else: not for losing words, and not against the pattern. The migration of a
corpus onto a pattern is made entirely of such exceptions.

## The area no seam reaches

`nameFor` covers everything the tool mints, and the knowledge base is not minted. A specification
arrives as `publish/specs/<name>/`, and that folder name is the id — no flag names the
destination, which is the property publishing is built on and is not up for renegotiation here.

So `publish` reads the same policy and *refuses*, one loop over the located documents, before
anything is written. A document that replaces one already in the base is skipped: it is filed,
and where it sits is not this change's question. A bundled document is skipped when its folder
exists, because `replaces` is per file and a second file joining an existing folder is not a new
document. What is left is a new document whose name the pattern would not have produced, and it
is told the name it would have to be — `Math.max` over the same three sources, plus one.

Refusing rather than renaming is the whole of the design here. The alternative writes
`publish/specs/invoicing/` into `specs/0007-invoicing/`, which is the tool filing a document
somewhere other than where it was addressed, and which mints a second document the moment
somebody writes `invoicing` meaning to replace `0001-invoicing`.

## The language, while the file is open

`langFor` reads the same configuration. The caller wins, then the corpus, then English — so
`molly init --lang uk` followed by `molly change new` finally produces `lang: uk`, and `--lang`
still overrides both.

## What this constrains afterwards

**Any later command that mints a name goes through `nameFor`.** `slugify` alone is the reduction;
`nameFor` is the reduction, the refusal and the corpus's shape, and the last two are the halves
that have to be impossible to forget.

**A number is never handed out twice, and the ledger is what says so.** Any later area that gains
ordering asks the same three sources, because the cheap two are the ones that forget.
