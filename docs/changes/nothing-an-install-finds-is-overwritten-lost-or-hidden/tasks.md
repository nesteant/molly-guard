# The work, in order

Three independent halves. Ordered so that each one is provable before the next starts.

1. **Give store a write that skips.** `place()` beside `writeScaffold`, exported. Nothing calls
   it yet, so nothing observable changes.

2. **Route every init write through it.** The config keeps its guard; the ledger, the two
   READMEs the tool writes itself and the one per area go through `place`. Collect what was
   kept.

3. **Say what was kept.** The summary counts written and kept separately, and the paths are
   listed under it. A count with no paths is a count somebody has to go looking for.

4. **Give the reduction a second reader.** `reduce()` extracted inside `slug.ts`, `slugify`
   rewritten on top of it, `lostWords` beside it. Pure addition — no caller yet.

5. **Mint names in one place.** `nameFor(title, given)` in the CLI, refusing in both directions;
   `change new` and `capability new` call it instead of carrying the block twice. This is the
   step the behaviour changes at.

6. **Give a roadmap entry a record.** `RoadmapRecord` in core, exported from the barrel.

7. **Read the area.** `readRoadmap` in store, mirroring `readCapabilities` — folder, name and
   record all reported, none of them failing.

8. **Put it in the report.** `roadmap` on `Report`, gathered, rendered on the line under
   capabilities, and present in `--json` for a reader that is not a person.

9. **Assert all of it.** The harness grows a section for what an install finds, three for the
   naming, and the roadmap assertions go beside the ones for capabilities.

10. **Say it in the README**, where the assertion count is stated.
