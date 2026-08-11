# docs/

The knowledge base, and the changes that alter it.

Two facts explain the whole layout. **A specification has no lifecycle** — it is what the
product is currently believed to be, and it is altered only by a change published into it. **A
change has one** — drafted, reviewed, approved, worked on, implemented, verified, deployed, and
finally published. So
the directory edited day to day is `changes/`; everything else is a grouping, accumulated
truth, or a record of what happened.

| Directory | Holds | How something gets there |
| --- | --- | --- |
| `capabilities/` | what the product is responsible for | `molly capability new` |
| `specs/` | accumulated truth | `molly publish` |
| `decisions/` | constraints outliving any one change | `molly publish` |
| `roadmap/` | intent not specified yet | written directly |
| `changes/` | work in flight | `molly change new` |
| `history/` | changes that were published, kept whole | `molly publish` |

Each one has a README saying what belongs in it.

**Nothing enters the knowledge base except by publishing a change.** A change carries the
documents it proposes in `changes/<name>/publish/`, mirroring this directory, and
`molly publish` files them, archives the bundle into `history/` and records it. The tool
writes no prose: every document was written by a person, or by an agent acting as one.

`.mollyguard/` is the audit trail: an append-only transition history. Commit it, and never
edit it by hand — every state is folded from that history, so editing it is how a record
starts disagreeing with what happened.

The instructions an agent reads are installed *outside* this directory, where agent tools look —
`molly init` writes them and `molly agents` reinstalls them after an upgrade. They hold no
decision, capability or language: they say where those live, which is here.

Nothing here parses your prose. Every document is markdown; what the tool reads is the
frontmatter block at the top, and everything below it is text a person wrote for another
person. So a corpus can be written and read in any language with none of the tool left in it.
