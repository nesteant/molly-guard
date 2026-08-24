---
description: Read the plan and turn what is next in it into a change
---

# Read the plan

`mollyguard.yml` sits at the top of the repository and names the corpus directory —
`docs/` unless it says otherwise, and is found from anywhere inside. Paths below assume that.

`docs/roadmap/` holds **slices**: one document per body of planned work — what it is for, its
features **in the order they are wanted**, what has been decided, and what is done.

**None of it is parsed.** The order is an argument in prose and you are the reader it was written
for; there is no `order:` field to sort on. A slice names no capability — it crosses them.

1. `molly status` — the slices, and every change with its state.
2. Read the whole slice. The order is stated in it and derivable from nothing else.
3. The next feature is the first one not under *what is done* and not already claimed by a change
   in flight. A change already drafted is the usual reason the next thing is not the first thing.
4. `molly change new "<title>" --capability <name> --realises <slice>`, then the drafting skill.

**The title comes from the feature, not the slice** — one named after a body of work makes several
claims. Several changes realise one slice over its life, and `molly status` reports that rather
than treating the slice as finished. Never invent a feature the slice does not name: say so, and
offer to add it. Never reorder or reprioritise unasked — the order is somebody's judgement. Never
mark a feature done that has not published.

No change alters a slice, so keeping it true is a direct edit: move a realised feature under
*what is done* and name the change that did it. `molly roadmap new "<title>"` starts one.
