#!/usr/bin/env bash
#
# MollyGuard regression harness.
#
# Nearly every assertion is a refusal, because a check that silently stops refusing looks
# exactly like one that is working and nothing else in the system notices. The few positive
# assertions prove that something a refusal *should not* catch gets through — a refusal that
# fires on everything is as useless as one that never fires.
#
# Usage: scripts/smoke.sh [--keep]
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="$ROOT/packages/cli/dist/bin.js"
export BIN   # shared with the helper functions injected into `sh -c` blocks
WORK="$(mktemp -d)"
KEEP=0
[[ "${1:-}" == "--keep" ]] && KEEP=1

PASS=0
FAIL=0

red()   { printf '\033[31m%s\033[0m' "$1"; }
green() { printf '\033[32m%s\033[0m' "$1"; }
dim()   { printf '\033[2m%s\033[0m' "$1"; }

cleanup() {
  if [[ $KEEP -eq 1 ]]; then printf '\n%s %s\n' "$(dim 'corpus kept at')" "$WORK"; else rm -rf "$WORK"; fi
}
trap cleanup EXIT

# check <name> <expected-exit> <expected-substring> -- <command...>
check() {
  local name="$1" want_code="$2" want_text="$3"; shift 4
  local out code
  out="$("$@" 2>&1)"; code=$?

  local ok=1
  [[ "$want_code" != "*" && "$code" != "$want_code" ]] && ok=0
  [[ -n "$want_text" ]] && ! grep -qF -- "$want_text" <<<"$out" && ok=0

  if [[ $ok -eq 1 ]]; then
    printf '  %s %s\n' "$(green '✓')" "$name"
    PASS=$((PASS + 1))
  else
    printf '  %s %s\n' "$(red '✗')" "$name"
    printf '      expected exit %s containing "%s"\n' "$want_code" "$want_text"
    printf '      got exit %s:\n' "$code"
    sed 's/^/        /' <<<"$out" | head -16
    FAIL=$((FAIL + 1))
  fi
}

# refute <name> <unwanted-substring> -- <command...>
refute() {
  local name="$1" unwanted="$2"; shift 3
  local out
  out="$("$@" 2>&1)"

  if grep -qF -- "$unwanted" <<<"$out"; then
    printf '  %s %s\n' "$(red '✗')" "$name"
    printf '      expected NOT to contain "%s"\n' "$unwanted"
    FAIL=$((FAIL + 1))
  else
    printf '  %s %s\n' "$(green '✓')" "$name"
    PASS=$((PASS + 1))
  fi
}

m() { node "$BIN" "$@"; }

[[ -f "$BIN" ]] || { printf '%s\n' "$(red 'dist/bin.js is missing — run `npm run build` first')"; exit 2; }

cd "$WORK" || exit 2

# --------------------------------------------------------------------- the tool itself
#
# Read from the manifest rather than written here: the assertion is that the tool answers
# *which build it is*, and a number repeated in a test is one that fails the release it was
# supposed to check.
VERSION="$(node -p "require('$ROOT/packages/cli/package.json').version")"

printf '\nthe tool\n'
check "it answers which build it is"      0 "$VERSION" -- m --version
check "without needing a corpus"          0 "$VERSION" -- m version
check "help lists what there is"          0 "molly init" -- m help
check "an unknown command is a refusal"   1 "unknown command" -- m nonsense

# ------------------------------------------------------------------------------- init
printf '\ninit\n'
check "it scaffolds a corpus"             0 "corpus initialised" -- m init
check "it refuses to overwrite one"       1 "a corpus is already here" -- m init

# Every directory, present and explained. Git tracks no empty directory, so a skeleton
# without these is a corpus that vanishes on clone.
for d in capabilities specs decisions roadmap changes history; do
  check "$d/ exists and explains itself"  0 "# $d/" -- cat "docs/$d/README.md"
done
check "the root explains the layout"      0 "no lifecycle"    -- cat docs/README.md
check "the ledger warns against editing"  0 "Never edit it"   -- cat docs/.mollyguard/README.md

# Created empty rather than absent: a ledger that appears on first write makes "no history"
# and "history not started" indistinguishable, and those are different facts.
check "the history ledger exists"         0 ""                -- test -f docs/.mollyguard/history.jsonl
check "and starts empty"                  0 "0"               -- sh -c 'wc -l < docs/.mollyguard/history.jsonl | tr -d " "'

# At the top of the repository, naming the corpus — which is what lets every command find it
# from anywhere inside without being told where it is.
check "the config sits above the corpus"  0 "root: docs"      -- cat mollyguard.yml
check "and records the language"          0 "lang: en"        -- cat mollyguard.yml
refute "and is not inside the corpus"     "mollyguard.yml" -- sh -c 'ls docs'
check "a language can be chosen"          0 "lang: uk"        -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init --root docs-uk --lang uk >/dev/null && cat mollyguard.yml'
check "and the directory it names too"    0 "root: docs-uk"   -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init --root docs-uk >/dev/null && cat mollyguard.yml'

# A README that names a command which does not exist sends its reader to a dead end, and the
# text ages silently — nothing else in the build reads prose, so nothing else would notice.
# Every `molly <verb>` a generated README mentions must appear in `molly help`.
check "the READMEs name only real commands" 0 "ok" -- sh -c '
  help="$(node '"$BIN"' help)"
  miss=""
  for token in $(grep -ohE "molly [a-z]+" docs/README.md docs/*/README.md docs/.mollyguard/README.md \
                 | sort -u | tr " " "~"); do
    named="$(printf "%s" "$token" | tr "~" " ")"
    grep -qF -- "$named" <<<"$help" || miss="$miss [$named]"
  done
  [ -z "$miss" ] || { printf "named in a README, not a command:%s\n" "$miss"; exit 1; }
  echo ok'

# It seeds nothing. An example is produced by running the flow — the only way to get one
# whose history is not a fiction.
refute "it seeds no example specification"  "invoice"   -- sh -c 'ls -R docs'
check "specs/ holds only its README"      0 "1"               -- sh -c 'ls docs/specs | wc -l | tr -d " "'

# ------------------------------------------------------------- what an install finds
#
# `docs/` is the default root, and it is a directory somebody else's repository already had.
# Every write init makes is a write over their file until something says otherwise — and it
# did not: a hand-written `docs/README.md` was replaced, and the run exited 0 saying nothing.
printf '\nwhat an install finds\n'

found() {
  cd "$(mktemp -d)" || exit 2
  mkdir -p docs
  printf '# Our documentation\n\nWritten by a person.\n' > docs/README.md
}
check "a file already there is left alone" 0 "Written by a person" -- sh -c '
  '"$(declare -f found)"'; found
  node '"$BIN"' init >/dev/null
  cat docs/README.md'
# A skip nobody is told about is a different failure and not a smaller one: the reader believes
# the explainer in front of them is the one the tool writes.
check "and the run names what it kept"     0 "docs/README.md" -- sh -c '
  '"$(declare -f found)"'; found
  node '"$BIN"' init'
check "and the corpus is still made"       0 "corpus initialised" -- sh -c '
  '"$(declare -f found)"'; found
  node '"$BIN"' init'
check "and every absent explainer is written" 0 "# changes/" -- sh -c '
  '"$(declare -f found)"'; found
  node '"$BIN"' init >/dev/null
  cat docs/changes/README.md'

# The case the reported one was a mild instance of. An explainer can be written again by the
# tool; a ledger cannot be written again by anything.
kept_ledger() {
  cd "$(mktemp -d)" || exit 2
  mkdir -p docs/.mollyguard
  printf '{"node":"changes/old","at":"2020-01-01T00:00:00Z","kind":"created","to":"draft"}\n' \
    > docs/.mollyguard/history.jsonl
}
check "a ledger already there is not truncated" 0 "changes/old" -- sh -c '
  '"$(declare -f kept_ledger)"'; kept_ledger
  node '"$BIN"' init >/dev/null
  cat docs/.mollyguard/history.jsonl'
# Named on its own, because the remedy offered for an explainer would destroy this one.
check "and is named as the one never to delete" 0 "a corpus was here before this one" -- sh -c '
  '"$(declare -f kept_ledger)"'; kept_ledger
  node '"$BIN"' init'

# The other direction. A write that kept everything would look exactly like a fix from the side
# the defect was reported from.
refute "an empty directory keeps nothing"   "already here" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init'

# ------------------------------------------------------------------------- change new
printf '\nchange new\n'
check "a change is four documents"        0 "changes/corrections-are-refused" -- sh -c '
  node '"$BIN"' change new "Corrections are refused outside the window" --alters specs/invoice-immutability'
for f in change plan tasks tests; do
  check "$f.md was written"               0 "" -- test -f docs/changes/corrections-are-refused-outside-the-window/$f.md
done

# One record per bundle. A title repeated in four files is a title that disagrees with itself
# by the end of the week, so only the entry carries frontmatter.
check "the entry carries the record"      0 "title: Corrections are refused outside the window" -- \
  cat docs/changes/corrections-are-refused-outside-the-window/change.md
check "and what it alters"                0 "- specs/invoice-immutability" -- \
  cat docs/changes/corrections-are-refused-outside-the-window/change.md
refute "the parts carry none"               "---" -- \
  cat docs/changes/corrections-are-refused-outside-the-window/plan.md

# The name is derived from the title, ASCII, and clipped at a word boundary — a slug is a
# filename people type, and `…-rather-th` reads as corruption rather than abbreviation.
check "a long title clips at a word"      0 "changes/a-title-so-long-that-it-cannot-possibly-fit-inside-the" -- sh -c '
  node '"$BIN"' change new "A title so long that it cannot possibly fit inside the limit that exists"'
check "a name can be chosen instead"      0 "changes/short-name" -- sh -c '
  node '"$BIN"' change new "Some other change" --name short-name'
# The clip is at the exported limit rather than at a number written twice. Two copies of a
# boundary disagree the first time one of them is tuned.
check "the clip honours the exported limit" 0 "ok" -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  const long = c.slugify("A title so long that it cannot possibly fit inside the limit that exists");
  console.log(long.length <= c.SLUG_LIMIT && long.length > c.SLUG_LIMIT - 12 ? "ok" : `clipped to ${long.length}`);'
check "a title that reduces to nothing is refused" 1 "does not reduce to a name" -- sh -c '
  node '"$BIN"' change new "!!! ???"'

# A title that reduces to *part* of itself was the quiet one. `Вхід через Entra ID` became
# `entra-id` and exited 0, so the realistic title for a corpus not written in English produced
# a name two thirds of it had fallen out of — and a name is minted once and never translated.
check "a title that loses words is refused" 1 "reduce to nothing" -- sh -c '
  node '"$BIN"' change new "Вхід через Entra ID"'
check "and names the words it would lose"  1 "Вхід, через reduce to nothing" -- sh -c '
  node '"$BIN"' change new "Вхід через Entra ID"'
# A refusal saying a name would be partial without saying which name is one nobody can check.
check "and shows the name it refused to mint" 1 'would be named "entra-id"' -- sh -c '
  node '"$BIN"' change new "Вхід через Entra ID"'
# The refusal is about deriving a name, not about the title. A corpus written in Ukrainian has
# to stay usable, which was the point of the complaint.
check "a name given by hand still works"   0 "changes/entra-login" -- sh -c '
  node '"$BIN"' change new "Вхід через Entra ID" --name entra-login'
# Without the letter-or-digit test every em dash is a lost word, and a check that fires on
# everything is as useless as one that never fires.
check "punctuation between words is not loss" 0 "changes/refunds-and-their-edges" -- sh -c '
  node '"$BIN"' change new "Refunds — and their edges"'
# A name given by hand is checked for being typable and for nothing else: the author looked at
# their title and chose. It used to be refused by the message about reducing the title, which
# named a derivation that never happened.
check "a name nobody could type is refused" 1 "is not a usable name" -- sh -c '
  node '"$BIN"' change new "Fine title" --name "Not A Slug"'

check "a duplicate name is refused"       1 "already exists" -- sh -c '
  node '"$BIN"' change new "Some other change" --name short-name'
check "an unknown kind is refused"        1 "is not a kind of change" -- sh -c '
  node '"$BIN"' change new "Whatever" --kind epic'
check "and names the ones there are"      1 "feature, bug, refactor, chore" -- sh -c '
  node '"$BIN"' change new "Whatever" --kind epic'
check "a change outside a corpus is refused" 1 "no corpus here" -- sh -c '
  cd / && node '"$BIN"' change new "Nowhere"'

# An empty `alters` is the normal answer for a change that introduces new truth, so it is not
# remarked on by itself. A change that alters nothing *and* is filed nowhere has neither a
# document to write into nor a capability to file a new one under — reported, not refused,
# because either half can be decided after the bundle exists.
check "a change with nowhere to land says so" 0 "nothing to publish into yet" -- sh -c '
  node '"$BIN"' change new "Declares nothing" --name declares-nothing'
check "and writes an empty list, not a blank" 0 "alters: []" -- cat docs/changes/declares-nothing/change.md
# `alters` names what exists. A change that introduces new truth alters nothing, and saying so
# is a real answer rather than an unfinished one — what it owes instead is a capability.
refute "a change that only creates is not nagged" "nothing to publish into" -- sh -c '
  node '"$BIN"' capability new "Reporting" --name reporting >/dev/null
  node '"$BIN"' change new "New truth" --name new-truth --capability reporting'

# The template ships no requirement format. Whatever it shows is what the corpus fills up
# with, so a Given/When/Then template would make that the corpus form for ever — the form is
# a slice's business, and `@mollyguard/gherkin` replaces these templates to supply one.
refute "no format is imposed by the template" "given:" -- sh -c '
  cat docs/changes/declares-nothing/*.md'
refute "and no keyword form either"          "SHALL" -- sh -c '
  cat docs/changes/declares-nothing/*.md'

# ------------------------------------------------------------------------ capabilities
printf '\ncapabilities\n'

# One file, in an area that holds files — the first of those, which is what makes the README
# exclusion below necessary rather than theoretical.
check "a capability is one file"          0 "capabilities/billing" -- sh -c '
  node '"$BIN"' capability new "Billing"'
check "written where it belongs"          0 "" -- test -f docs/capabilities/billing.md
check "it carries a record"               0 "title: Billing" -- cat docs/capabilities/billing.md
check "and the language it is written in" 0 "lang: en" -- cat docs/capabilities/billing.md

# A capability is current, not in flight. Both halves of that are absences, and an absence is
# only a decision if something checks it: a `state:` arriving by accident would look like a
# feature until something tried to move the document.
refute "and no state at all"                "state:" -- cat docs/capabilities/billing.md
refute "nothing about it reaches the ledger" "capabilities/" -- cat docs/.mollyguard/history.jsonl

# The same pair a change bundle carries. They fail the moment somebody adds a helpful example.
refute "no format is imposed"                "given:" -- cat docs/capabilities/billing.md
refute "and no keyword form either"          "SHALL"  -- cat docs/capabilities/billing.md

check "a name can be chosen instead"      0 "capabilities/short" -- sh -c '
  node '"$BIN"' capability new "Some other grouping" --name short'
check "a title that reduces to nothing is refused" 1 "does not reduce to a name" -- sh -c '
  node '"$BIN"' capability new "!!! ???"'
# The same rule, because both commands mint a name through one function. The block was carried
# twice before this, and duplicated code is fixed once. Asserted with the whole clause, so the
# one-lost-word phrasing is held here and the two-word one above — the common case is one foreign
# noun in an otherwise English title, and it is the case a plural verb would read wrongly in.
check "and one that loses words is too"   1 "Облік reduces to nothing" -- sh -c '
  node '"$BIN"' capability new "Облік expenses"'
check "a duplicate is refused"            1 "already exists" -- sh -c '
  node '"$BIN"' capability new "Billing"'
check "a missing title is refused"        1 "molly capability new" -- m capability new
check "an unknown verb says the one there is" 1 "molly capability new" -- m capability list
check "one outside a corpus is refused"   1 "no corpus here" -- sh -c '
  cd / && node '"$BIN"' capability new "Nowhere"'

# The reference, resolved rather than merely written. A field admitting exactly one area takes
# the bare name; the qualified form is accepted where somebody types it and stored bare.
check "a change is filed under one"       0 "capability: billing" -- sh -c '
  node '"$BIN"' change new "Filed work" --name filed --capability billing >/dev/null
  cat docs/changes/filed/change.md'
check "the qualified form is the same reference" 0 "capability: billing" -- sh -c '
  node '"$BIN"' change new "Filed too" --name filed-too --capability capabilities/billing >/dev/null
  cat docs/changes/filed-too/change.md'
check "an unknown capability is refused"  1 'no capability named "nope"' -- sh -c '
  node '"$BIN"' change new "Misfiled" --name misfiled --capability nope'
check "and names the ones there are"      1 "billing" -- sh -c '
  node '"$BIN"' change new "Misfiled" --name misfiled2 --capability nope'
# Resolved before anything is written, so a refusal leaves no half-made bundle — the same
# property the name collision has, and the same reason for it.
check "and leaves no bundle behind"       1 "" -- test -d docs/changes/misfiled
# Declaring nothing is an answer, so it is neither refused nor reported.
check "filing under nothing is not refused" 0 "changes/unfiled" -- sh -c '
  node '"$BIN"' change new "Unfiled work" --name unfiled'

check "status lists the capabilities there are" 0 "capabilities  billing" -- m status
# Listed even though nothing points at it — which is what every capability looks like on the
# day it is made, and exactly the one somebody needs reminding to use.
check "including one nothing points at" 0 "short" -- sh -c '
  node '"$BIN"' status | grep capabilities'
check "and each change says where it is filed" 0 "billing" -- sh -c '
  node '"$BIN"' status | grep " filed "'
check "one filed under nothing shows a dash"   0 "—" -- sh -c '
  node '"$BIN"' status | grep " unfiled "'

# The refusal at creation catches a typo. This catches the other case: the capability is
# deleted after the author has left, and a broken reference nothing reports is a grouping that
# is quietly wrong. Run in its own corpus so the one above stays clean.
check "a deleted capability is reported"  1 "name a capability that does not exist" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' capability new "Billing" >/dev/null
  node '"$BIN"' change new "Filed" --name filed --capability billing >/dev/null
  rm docs/capabilities/billing.md
  node '"$BIN"' status'
check "and names the change and what it lost" 1 "filed is filed under billing, which does not exist" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' capability new "Billing" >/dev/null
  node '"$BIN"' change new "Filed" --name filed --capability billing >/dev/null
  rm docs/capabilities/billing.md
  node '"$BIN"' status'
# A corpus that has not divided itself into capabilities is a small corpus, not a broken one.
refute "a corpus with none says nothing about them" "capabilities" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Alone" --name alone >/dev/null
  node '"$BIN"' status'
check "and is clean rather than merely quiet" 0 "alone" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Alone" --name alone >/dev/null
  node '"$BIN"' status'

# `molly init` writes a README into every directory, and this is the first area scanned that
# holds files rather than folders. Read as a record it would be a capability called README;
# reported as a problem it would be the bug's second form. Neither happens, and the rule lives
# in one place — the change scan reads the same predicate, asserted where README is not
# reported there either.
refute "the directory README is not a capability" "README" -- m status

# The two halves of path identity are pure, so they are asserted where they are decided rather
# than through a command that happens to use them.
check "the bare name comes from either form" 0 '["billing","billing"]' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  console.log(JSON.stringify([
    c.unqualify("capabilities", "billing"),
    c.unqualify("capabilities", "capabilities/billing"),
  ]));'
# A different area is left alone rather than stripped, so `capabilities/x` given where a change
# is expected stays wrong and is refused by name instead of silently resolving to `x`.
check "another area's prefix is left alone"  0 '"changes/x"' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  console.log(JSON.stringify(c.unqualify("capabilities", "changes/x")));'
check "and the two halves round-trip"        0 "ok" -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  console.log(c.unqualify("specs", c.qualify("specs", "invoice")) === "invoice" ? "ok" : "lost");'

# --------------------------------------------------------------------------- the roadmap
#
# The area the corpus README calls "read while planning" was the one area no command showed.
# A listing that omits an area without saying so is worse than no listing, because it is
# believed — somebody concludes nothing was intended and drafts a change that contradicts an
# entry sitting in the corpus. Run in its own corpus, so the table asserted here is the whole
# table rather than whatever the sections above left behind.
printf '\nthe roadmap\n'

intended() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  node "$BIN" capability new "Billing" --name billing >/dev/null
  printf -- '---\ntitle: Invoices are archived after seven years\nlang: en\ncapability: billing\n---\n\nLater.\n' \
    > docs/roadmap/seven-year-archive.md
  printf -- '---\ntitle: A second thought\nlang: en\n---\n\nLater.\n' \
    > docs/roadmap/a-second-thought.md
}
check "an entry appears in the table"      0 "roadmap       a-second-thought, seven-year-archive" -- sh -c '
  '"$(declare -f intended)"'; intended
  node '"$BIN"' status'
# The table and the document are two renderings of one gathered report, so an entry in one and
# not the other is the disagreement this command is built to make impossible.
check "and in the document"                0 '"name": "seven-year-archive"' -- sh -c '
  '"$(declare -f intended)"'; intended
  node '"$BIN"' status --json'
check "with the title somebody wrote"      0 "Invoices are archived after seven years" -- sh -c '
  '"$(declare -f intended)"'; intended
  node '"$BIN"' status --json'
# A slice is its own axis and crosses capabilities, so the field is not read and never reported.
# `intended` writes one carrying it on purpose: the fixture is the migration case.
refute "a slice reports no capability"     '"capability": "billing"' -- sh -c '
  '"$(declare -f intended)"'; intended
  node '"$BIN"' status --json'
check "and one carrying it is reported"    0 "names a capability" -- sh -c '
  '"$(declare -f intended)"'; intended
  node '"$BIN"' status'
# Absent means undeclared, never null and never empty — the rule the rest of the report keeps.
check "one filing nothing declares nothing" 0 "absent" -- sh -c '
  '"$(declare -f intended)"'; intended
  node '"$BIN"' status --json | node -e "
    let s=\"\"; process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{
      const e=JSON.parse(s).roadmap.find(x=>x.name===\"a-second-thought\");
      console.log(\"capability\" in e ? \"present\" : \"absent\") })"'
# A README is documentation in every area, and an area holding files is where that is
# load-bearing rather than theoretical.
check "the directory README is not an entry" 0 "2" -- sh -c '
  '"$(declare -f intended)"'; intended
  node '"$BIN"' status --json | node -e "
    let s=\"\"; process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{
      console.log(JSON.parse(s).roadmap.length) })"'
# An entry is a note somebody wrote while planning. Dropping one for having no frontmatter
# would hide exactly the entries written fastest, which are the ones worth being reminded of.
check "an entry with no record is still listed" 0 "quick-note" -- sh -c '
  '"$(declare -f intended)"'; intended
  printf "Just a thought.\n" > docs/roadmap/quick-note.md
  node '"$BIN"' status'

# What cannot be read is said out loud here as everywhere. What differs is that it does not
# fail: an entry is a note, not a governed unit, and failing a build over a broken frontmatter
# block in a planning note would be refusing somebody's notes for existing.
check "a folder here is reported"          0 "roadmap/a-folder is a folder" -- sh -c '
  '"$(declare -f intended)"'; intended
  mkdir docs/roadmap/a-folder
  node '"$BIN"' status'
check "a name nobody could type is reported" 0 "not a usable name" -- sh -c '
  '"$(declare -f intended)"'; intended
  : > "docs/roadmap/Seven Years.md"
  node '"$BIN"' status'
check "and the corpus stays clean"         0 '"ok": true' -- sh -c '
  '"$(declare -f intended)"'; intended
  mkdir docs/roadmap/a-folder
  : > "docs/roadmap/Seven Years.md"
  node '"$BIN"' status --json'

# A corpus with nothing intended yet is a young corpus, not a broken one.
refute "a corpus with none says nothing about it" "roadmap " -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Alone" --name alone >/dev/null
  node '"$BIN"' status'

# -------------------------------------------------------------------------- the lifecycle
printf '\nthe lifecycle\n'

# The sequence is the shape, not a set of permitted edges. Reachability and dead-ends became
# vacuous the moment any state could follow any other; what is still worth asserting is that
# the sequence is well formed, because everything else reads position from it.
check "the sequence is well formed"       0 "ok" -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  const ok = new Set(c.STATES).size === c.STATES.length
    && c.INITIAL === c.STATES[0]
    && c.TERMINAL === c.STATES[c.STATES.length - 1];
  console.log(ok ? "ok" : "malformed");'

check "a change is created to walk it"    0 "changes/walks" -- sh -c '
  node '"$BIN"' change new "Walks the whole table" --name walks'
check "and starts in draft"               0 "draft" -- sh -c '
  node '"$BIN"' status | grep "Walks the whole table"'
check "and its creation is the only line" 0 "1" -- sh -c '
  grep -c "changes/walks" docs/.mollyguard/history.jsonl | tr -d " "'

# Refusals that remain are about the *argument*, not the order: a state that does not exist and
# a change that does not exist are mistakes no policy would ever want recorded.
check "an unknown state is refused"       1 "is not a state" -- m move walks nonsense
check "and names the eight"               1 "draft, review, approved, in_progress, implemented, verified, deployed, published" -- \
  m move walks nonsense
check "an unknown change is refused"      1 "no change named" -- m move no-such-change review

check "moving prints the transition"      0 "draft → review" -- m move walks review
check "the ledger gains a line"           0 "2" -- sh -c '
  grep -c "changes/walks" docs/.mollyguard/history.jsonl | tr -d " "'
check "which names the change"            0 '"node":"changes/walks"' -- cat docs/.mollyguard/history.jsonl
check "and both states"                   0 '"from":"draft","to":"review"' -- cat docs/.mollyguard/history.jsonl
check "and when it happened"              0 "ok" -- node -e '
  const fs = require("fs");
  const line = fs.readFileSync("docs/.mollyguard/history.jsonl", "utf8").trim().split("\n")
    .map(JSON.parse).filter(e => e.node === "changes/walks").pop();
  console.log(Number.isNaN(Date.parse(line.at)) ? "unparseable" : "ok");'
check "status reports the fold"           0 "review" -- sh -c '
  node '"$BIN"' status | grep "Walks the whole table"'

# A re-run of a step that already happened must not fail a build, nor inflate the audit trail.
check "moving to where it already is is a no-op" 0 "is already review" -- m move walks review
check "and appends nothing"               0 "2" -- sh -c '
  grep -c "changes/walks" docs/.mollyguard/history.jsonl | tr -d " "'

check "a return is allowed"               0 "review → draft" -- m move walks draft
# Counted rather than inspected: "the log was rewritten" and "the log was appended to" leave the
# same final state, and only the count tells them apart.
check "and the first line is still there" 0 "3" -- sh -c '
  grep -c "changes/walks" docs/.mollyguard/history.jsonl | tr -d " "'
check "a qualified name is the same change" 0 "draft → review" -- m move changes/walks review

# Any state may follow any other. What a move *requires* is policy, and policy belongs to a
# slice or an orchestrator — neither of which exists yet, so nothing refuses on those grounds.
check "a move that skips states is recorded" 0 "review → deployed" -- m move walks deployed
check "and one that jumps back several"      0 "deployed → draft"  -- m move walks draft
# Direction is derived from position rather than declared per edge, which is what keeps it true
# for the moves nobody enumerated.
check "direction is derived, not declared"   0 "(advances"          -- m move walks verified
check "and backwards is named as such"       0 "(returns"           -- m move walks review

# The terminal state is the one a move may not record, and it is not a rule about the order.
# Reaching it is a *write* into the knowledge base, so a move recording it would append a line
# claiming a publication that never happened — and every later reader would believe the ledger.
check "the end of the sequence is refused"   1 "is reached by publishing" -- m move walks published
check "and it names the command that does it" 1 "molly publish walks" -- m move walks published
# A refusal that half-applied would be worse than no check: the count is what proves it did not.
check "and the refusal appends nothing"      0 "8" -- sh -c '
  grep -c "changes/walks" docs/.mollyguard/history.jsonl | tr -d " "'
# Nor is it offered where a person picks, because a list holding something that will be refused
# is a list that teaches the wrong thing.
refute "nor is it offered by the picker"       "published" -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  console.log(JSON.stringify(c.selectableStates("deployed").map(s => s.to)));'
check "one line per move, none rewritten"    0 "8" -- sh -c '
  grep -c "changes/walks" docs/.mollyguard/history.jsonl | tr -d " "'

check "status shows where it ended"       0 "review" -- sh -c '
  node '"$BIN"' status | grep "Walks the whole table"'
check "each change appears once"          0 "1" -- sh -c '
  node '"$BIN"' status | grep -c "Walks the whole table" | tr -d " "'
check "and every change is listed"        0 "Corrections are refused outside the window" -- m status
check "an empty corpus says so"           0 "no changes yet" -- m status --root docs-uk

# --------------------------------------------------------------- reported to something else
printf '\nreported to something else\n'

# Exit codes say whether the corpus is clean; they cannot say which change is in which state.
# Without this, anything orchestrating the work had to scrape a padded, coloured table nothing
# promises to keep the shape of, or re-fold the ledger itself — a second answer to the question
# this command exists to answer.
check "the report parses as JSON"        0 "ok" -- sh -c '
  node '"$BIN"' status --json | node -e "
    let s=\"\"; process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{
      const r=JSON.parse(s); console.log(typeof r.ok === \"boolean\" ? \"ok\" : \"no\") })"'
check "and carries every change with its state" 0 "walks=review" -- sh -c '
  node '"$BIN"' status --json | node -e "
    let s=\"\"; process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{
      const c=JSON.parse(s).changes.find(x=>x.name===\"walks\"); console.log(c.name+\"=\"+c.state) })"'
# The state is the fold, exactly as the table shows it. Two renderings of one gathered report,
# because a --json that walked the corpus separately could disagree with the table beside it.
check "and it is the fold, not the document" 0 "draft" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Drifted" --name drifted >/dev/null
  sed -i.bak "s/^state: draft$/state: deployed/" docs/changes/drifted/change.md
  node '"$BIN"' status --json | node -e "
    let s=\"\"; process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{
      console.log(JSON.parse(s).changes[0].state) })"'
check "and the drift is a finding that fails" 1 "\"kind\": \"drift\"" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Drifted" --name drifted >/dev/null
  sed -i.bak "s/^state: draft$/state: deployed/" docs/changes/drifted/change.md
  node '"$BIN"' status --json'
# A change the ledger has never heard of is a true statement about the corpus and not a defect
# in it, so it is reported and does not fail. The distinction has to survive into the document,
# or a reader has only the exit code to go on and cannot tell one from the other.
check "a note is carried without failing"    0 "\"fails\": false" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Ok" --name ok >/dev/null
  mkdir -p docs/changes/handmade
  printf -- "---\ntitle: By hand\nlang: en\nkind: feature\ncapability: none-yet\n---\n\nbody\n" > docs/changes/handmade/change.md
  node '"$BIN"' status --json --root docs >/dev/null
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Ok" --name ok >/dev/null
  mkdir -p docs/changes/handmade
  printf -- "---\ntitle: By hand\nlang: en\nkind: feature\n---\n\nbody\n" > docs/changes/handmade/change.md
  node '"$BIN"' status --json'
# An archived change keeps the id the ledger knows it by. The bundle moves to history/ and the
# record does not follow it, so reporting the disk path would hand a reader an id nothing in
# the ledger has ever seen — and no way to notice that is what happened.
published() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  node "$BIN" capability new "Feeding" --name feeding >/dev/null
  node "$BIN" change new "Cats are fed twice a day" --name fed --capability feeding >/dev/null
  mkdir -p docs/changes/fed/publish/specs/feeding-schedule
  printf -- "---\ntitle: Cats are fed twice a day\nlang: en\ncapability: feeding\n---\n\nAt 08:00.\n" \
    > docs/changes/fed/publish/specs/feeding-schedule/spec.md
  node "$BIN" publish fed >/dev/null
}
check "an archived change keeps its ledger id" 0 "changes/fed" -- sh -c '
  '"$(declare -f published)"'; published
  node '"$BIN"' status --json'
check "and says it is archived"                0 "\"archived\": true" -- sh -c '
  '"$(declare -f published)"'; published
  node '"$BIN"' status --json'
# Absent means undeclared, never null and never empty. It is the rule the documents follow, and
# a reader parsing this has no document to check it against.
refute "an undeclared field is absent, not null" "null" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Unfiled" --name unfiled >/dev/null
  node '"$BIN"' status --json'

# ------------------------------------------------------------- the state a document claims
printf '\nthe state a document claims\n'

# A corpus is reviewed as files in a pull request, so a state only the ledger knows is a state
# the reviewer cannot see. The document carries it — as a projection of the ledger, never as a
# second source of truth, which is what the drift check below is for.
check "a new change declares its state"     0 "state: draft" -- sh -c '
  node '"$BIN"' change new "Declares its state" --name declares-state >/dev/null
  cat docs/changes/declares-state/change.md'
check "moving updates the document"         0 "state: review" -- sh -c '
  node '"$BIN"' move declares-state review >/dev/null
  cat docs/changes/declares-state/change.md'
# One field replaced, every other byte left alone. Re-serialising the document would drop
# whatever the model does not represent, and the loss would look exactly like success.
check "and leaves the rest of the record alone" 0 "title: Declares its state" -- \
  cat docs/changes/declares-state/change.md
check "and the prose below it"              0 "One claim, stated so that someone" -- \
  cat docs/changes/declares-state/change.md

# Hand-editing `state:` is precisely the bypass worth catching, so the disagreement is named
# rather than silently resolved in favour of either side.
check "a hand-edited state is reported"     1 "disagree with the ledger" -- sh -c '
  perl -pi -e "s/^state: review$/state: deployed/" docs/changes/declares-state/change.md
  node '"$BIN"' status'
check "and names both answers"              1 "says deployed, the ledger says review" -- m status
check "moving from a disputed state is refused" 1 "and the ledger says review" -- sh -c '
  node '"$BIN"' move declares-state approved'
check "correcting it clears the dispute"    0 "" -- sh -c '
  perl -pi -e "s/^state: deployed$/state: review/" docs/changes/declares-state/change.md
  node '"$BIN"' status'

# Creation is recorded like every later move, so the first state is backed by a line rather than
# by the absence of one — and creation gets an author and a time, which otherwise only git knew.
check "creating a change records it"        0 '"kind":"created"' -- sh -c '
  node '"$BIN"' change new "Records its birth" --name born >/dev/null
  grep born docs/.mollyguard/history.jsonl'
check "with the state it starts in"         0 '"to":"draft"' -- sh -c '
  grep born docs/.mollyguard/history.jsonl'
# Omitted rather than null: nothing preceded a creation, and a null invites a reader to treat
# it as a state.
refute "and no state it came from"            '"from"' -- sh -c '
  grep born docs/.mollyguard/history.jsonl'
check "a move is a different kind of event"  0 '"kind":"transition"' -- sh -c '
  node '"$BIN"' move born review >/dev/null
  grep born docs/.mollyguard/history.jsonl | tail -1'

# Written strictly, read leniently. A line from before `kind` existed is a transition; refusing
# it would mean an upgrade silently emptied somebody's audit trail.
check "a line written before kinds still reads" 1 "the ledger says review" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Legacy" --name legacy >/dev/null
  : > docs/.mollyguard/history.jsonl
  printf "%s\n" "{\"node\":\"changes/legacy\",\"at\":\"2026-01-01T00:00:00.000Z\",\"from\":\"draft\",\"to\":\"review\",\"by\":\"someone\"}" \
    >> docs/.mollyguard/history.jsonl
  node '"$BIN"' status'

# The terminal state was called `merged` before the command that performs the fold was named.
# A ledger written then still holds the old word, and refusing those lines would mean an upgrade
# silently emptied part of somebody's audit trail — the one thing a ledger may never do. Read
# leniently, never rewritten: the same event under the name it was recorded with.
check "a state under its old name still folds" 0 "published" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Old words" --name old >/dev/null
  printf "%s\n" "{\"node\":\"changes/old\",\"at\":\"2026-01-01T00:00:00.000Z\",\"kind\":\"transition\",\"from\":\"deployed\",\"to\":\"merged\",\"by\":\"someone\"}" \
    >> docs/.mollyguard/history.jsonl
  node '"$BIN"' status 2>/dev/null | grep " old "'
# The same word in the other file that holds it. Understood in the ledger and not in the
# document, a corpus written before the rename would be told its two answers disagree when they
# are the same state under two names.
refute "a document under the old name agrees too" "disagree with the ledger" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Old words" --name old2 >/dev/null
  printf "%s\n" "{\"node\":\"changes/old2\",\"at\":\"2026-01-01T00:00:00.000Z\",\"kind\":\"transition\",\"from\":\"deployed\",\"to\":\"merged\",\"by\":\"someone\"}" \
    >> docs/.mollyguard/history.jsonl
  perl -pi -e "s/^state: draft$/state: merged/" docs/changes/old2/change.md
  node '"$BIN"' status'
check "and a real disagreement is still caught" 1 "disagree with the ledger" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Old words" --name old3 >/dev/null
  perl -pi -e "s/^state: draft$/state: merged/" docs/changes/old3/change.md
  node '"$BIN"' status'
refute "and is not reported as unreadable"      "not a transition" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Old words" --name old >/dev/null
  printf "%s\n" "{\"node\":\"changes/old\",\"at\":\"2026-01-01T00:00:00.000Z\",\"kind\":\"transition\",\"from\":\"deployed\",\"to\":\"merged\",\"by\":\"someone\"}" \
    >> docs/.mollyguard/history.jsonl
  node '"$BIN"' status'

# Because creation is recorded, a bundle the ledger has never heard of is a signal rather than
# the normal case: written by hand, or a folder renamed with `mv`, which orphans everything
# recorded under the old name. This is the silent reset that used to happen with no warning.
check "a folder renamed by hand is noticed" 1 "the ledger has no record of" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Renamed by hand" --name before >/dev/null
  node '"$BIN"' move before review >/dev/null
  mv docs/changes/before docs/changes/after
  node '"$BIN"' status'
check "and its state disagrees too"         1 "says review, the ledger says draft" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Renamed by hand" --name before >/dev/null
  node '"$BIN"' move before review >/dev/null
  mv docs/changes/before docs/changes/after
  node '"$BIN"' status'

# The reader has always accepted `\r\n`; the writer did not, so a document checked out on
# Windows or through `core.autocrlf` read fine and then silently refused to be updated — the
# state recorded in the ledger and never projected, with only a warning to show for it.
check "a CRLF document is still updated"    0 "state: review" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Crlf" --name crlf >/dev/null
  perl -pi -e "s/\n/\r\n/" docs/changes/crlf/change.md
  node '"$BIN"' move crlf review >/dev/null
  cat docs/changes/crlf/change.md'
# And updated in the endings it already had. Replacing with `.` would strip the carriage return
# from that one line and leave the file mixed, which every later diff would show as noise.
refute "without leaving mixed line endings" "no-lf-found" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Crlf" --name crlf2 >/dev/null
  perl -pi -e "s/\n/\r\n/" docs/changes/crlf2/change.md
  node '"$BIN"' move crlf2 review >/dev/null
  perl -ne "print qq(no-lf-found\n) and exit if /[^\r]\n/" docs/changes/crlf2/change.md'
# A document with genuinely no frontmatter is a different thing, and still says so.
check "a document with no record still reports" 1 "has no frontmatter block" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "No front" --name nf >/dev/null
  printf "# just prose\n" > docs/changes/nf/change.md
  node '"$BIN"' move nf review'

# The ledger directory is state the tool owns, so writing may create it. Without that, a corpus
# whose `.mollyguard/` was absent crashed *after* the bundle was written, leaving a change on
# disk that the ledger had no record of — a half-applied creation, which is what the collision
# check exists to prevent everywhere else.
check "a corpus missing its ledger dir recovers" 0 "" -- sh -c '
  cd "$(mktemp -d)" && mkdir -p docs/changes && printf "root: docs\nlang: en\n" > mollyguard.yml
  node '"$BIN"' change new "Hand made" --name hm >/dev/null 2>&1'
check "and the creation is recorded anyway"  0 '"kind":"created"' -- sh -c '
  cd "$(mktemp -d)" && mkdir -p docs/changes && printf "root: docs\nlang: en\n" > mollyguard.yml
  node '"$BIN"' change new "Hand made" --name hm >/dev/null 2>&1
  cat docs/.mollyguard/history.jsonl'

# A ledger that attributes a transition to somebody who did not make it is worse than one that
# admits it does not know, so an unattributable move is recorded as the literal `unknown`.
check "a move records who made it"          0 "\"by\":" -- sh -c '
  grep declares-state docs/.mollyguard/history.jsonl | tail -1'
# Asserted against the exported constant, so a consumer testing `by === UNKNOWN` cannot be
# quietly broken by the literal changing.
check "identity is never invented"          0 "unknown" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null \
    && node '"$BIN"' change new "Anon" --name anon >/dev/null \
    && HOME="$PWD" GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null \
       node '"$BIN"' move anon review >/dev/null \
    && grep -o "\"by\":\"[^\"]*\"" docs/.mollyguard/history.jsonl'

# ------------------------------------------------------------------ what cannot be read
printf '\nwhat cannot be read\n'

# A file that exists and does not load is specified as far as its author is concerned and absent
# as far as everything else is concerned. Reporting is the whole defence; a silent skip means
# nothing downstream will ever mention it.
check "a malformed ledger line is reported" 0 "is not a transition, and was skipped" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Ok" --name ok >/dev/null
  printf "not json at all\n" >> docs/.mollyguard/history.jsonl
  node '"$BIN"' status'
check "and the rest of the ledger still folds" 0 "draft" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Ok" --name ok >/dev/null
  printf "not json at all\n" >> docs/.mollyguard/history.jsonl
  node '"$BIN"' status | grep " ok "'

check "a bundle with no entry is reported"  1 "has no change.md" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null && mkdir -p docs/changes/hollow
  node '"$BIN"' status'
check "unreadable frontmatter is reported"  1 "change.md:" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Bad" --name bad >/dev/null
  printf -- "---\ntitle: [unclosed\n---\n\nbody\n" > docs/changes/bad/change.md
  node '"$BIN"' status'
# And it fails for the same reason whatever else is in the corpus. It used to depend on the
# neighbours: the two above exit 1 through the "nothing else is here" branch, and the moment one
# readable change sat beside the damaged one the same corpus exited 0 — a gate answering
# differently about identical damage depending on what happened to be next to it. A bundle that
# cannot be read is dropped from the scan, so the listing is missing a change and says nothing
# about having left one out.
check "and still fails beside a readable one"  1 "change.md:" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Good" --name good >/dev/null
  node '"$BIN"' change new "Bad" --name bad >/dev/null
  printf -- "---\ntitle: [unclosed\n---\n\nbody\n" > docs/changes/bad/change.md
  node '"$BIN"' status'
check "and the readable one is still listed"   1 "Good" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Good" --name good >/dev/null
  node '"$BIN"' change new "Bad" --name bad >/dev/null
  printf -- "---\ntitle: [unclosed\n---\n\nbody\n" > docs/changes/bad/change.md
  node '"$BIN"' status'

# "Nothing here" and "nothing here could be read" are different facts. Saying the first when the
# second is true tells somebody their corpus is empty while their work sits in it, unreadable.
check "an unreadable corpus is not called empty" 1 "could not be read, and nothing else is here" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Bad" --name bad >/dev/null
  printf -- "---\ntitle: [unclosed\n---\n\nbody\n" > docs/changes/bad/change.md
  node '"$BIN"' status'
check "and a genuinely empty one still is"  0 "no changes yet" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null && node '"$BIN"' status'

# A stray file where folders are expected used to be filtered out and never mentioned. It fails
# like anything else `changes/` holds that cannot be read: a markdown document sitting in the
# governed area with no bundle around it is exactly the half-governed state the tool exists to
# prevent, and a gate that waves it through is the gate agreeing to it.
check "a file in a folder area is reported" 1 "is a file, and changes/ holds folders" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Fine" --name fine >/dev/null
  printf "notes\n" > docs/changes/loose.md
  node '"$BIN"' status'
# But the explainer every directory carries is not a stray file, and nor is machine-local
# clutter. Reporting those would make the report itself the noise.
refute "the directory README is not"          "README" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Fine" --name fine >/dev/null
  node '"$BIN"' status'
refute "and nor is a dotfile"                 ".DS_Store" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Fine" --name fine >/dev/null
  touch docs/changes/.DS_Store
  node '"$BIN"' status'

# An area that holds files reports the mirror image: here a folder is what does not belong.
check "a folder in a file area is reported" 0 "is a folder, and capabilities/ holds files" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null && mkdir -p docs/capabilities/oops
  node '"$BIN"' status'
check "and so is something that is not a document" 0 "is not a markdown document" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null && printf "notes\n" > docs/capabilities/loose.txt
  node '"$BIN"' status'
# The rule creation enforces, enforced on the way back in. Without it it held only for names
# the tool minted: a hand-written `Billing Reports.md` was a capability with a space in its
# name, and a change could be filed under it.
check "a capability name that is not one is reported" 0 "is not a usable name" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf -- "---\ntitle: Billing\n---\n\nbody\n" > "docs/capabilities/Billing Reports.md"
  node '"$BIN"' status'
refute "and is not offered as one"                    "Billing Reports" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf -- "---\ntitle: Billing\n---\n\nbody\n" > "docs/capabilities/Billing Reports.md"
  node '"$BIN"' status 2>/dev/null | grep capabilities'
check "unreadable capability frontmatter is reported" 0 "capabilities/bad.md:" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf -- "---\ntitle: [unclosed\n---\n\nbody\n" > docs/capabilities/bad.md
  node '"$BIN"' status'
# A damaged record is still a grouping things are filed under, and a scan that dropped it would
# break every reference pointing at it as well as under-reporting the corpus.
check "a capability with no title still lists"  0 "untitled" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf -- "---\nlang: en\n---\n\nbody\n" > docs/capabilities/untitled.md
  node '"$BIN"' status'

# ------------------------------------------------------------------------------ picking
printf '\npicking, not typing\n'

# The lists are pure functions in core, so they are asserted directly rather than through a
# terminal. A list only reachable by driving a TTY is a list nothing checks.
check "every state a move may record is offered" 0 '["review","approved","in_progress","implemented","verified","deployed"]' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  console.log(JSON.stringify(c.selectableStates("draft").map(s => s.to)));'
# The order is the useful part: the next state first, because it is what somebody is usually
# reaching for, then the rest forwards, then the ones that go back. Sorted by name, `approved`
# would sit above `draft` and the common case would be the hardest to find.
check "the next state comes first"          0 '["implemented","verified","deployed","approved","review","draft"]' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  console.log(JSON.stringify(c.selectableStates("in_progress").map(s => s.to)));'
check "and each carries its direction"      0 '[["implemented","advances"],["approved","returns"]]' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  const all = c.selectableStates("in_progress");
  const pick = n => [n, all.find(s => s.to === n).direction];
  console.log(JSON.stringify([pick("implemented"), pick("approved")]));'
# A change that somehow sits at the end — an old ledger, a hand-edited record — can still be
# walked back. The terminal state is not a dead end; it is only one a move may not *enter*.
check "the last state still offers the way back" 0 '["deployed","verified","implemented","in_progress","approved","review","draft"]' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  console.log(JSON.stringify(c.selectableStates("published").map(s => s.to)));'
refute "and never offers the state it is in"  '"draft"' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  console.log(JSON.stringify(c.selectableStates("draft").map(s => s.to).filter(x => x === "draft")));'

# A filter may narrow a list and may never widen one. Otherwise a slice could offer a state that
# is not there, and the lifecycle would mean something different depending on what is installed
# — the same reason a slice may add a check and never replace one. This is also where sequence
# enforcement will live once a slice can supply it.
check "a filter may narrow the states"      0 '["implemented"]' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  const forwardOnly = { name: "t", states: (from, all) => all.filter(s => s.direction === "advances").slice(0, 1) };
  console.log(JSON.stringify(c.selectableStates("in_progress", [forwardOnly]).map(s => s.to)));'
check "and may not widen one"               0 '["approved"]' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  // `review` is where the change already is, so it was never offered — a filter naming it is
  // adding, not narrowing, and is dropped.
  const cheat = { name: "t", states: () => [{ to: "review", direction: "stays" }, { to: "approved", direction: "advances" }] };
  console.log(JSON.stringify(c.selectableStates("review", [cheat]).map(s => s.to)));'
check "a filter may narrow the changes"     0 '["b"]' -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  const all = [{node:"changes/a",slug:"a",title:"A",state:"draft"},{node:"changes/b",slug:"b",title:"B",state:"draft"}];
  const only = { name: "t", changes: (list) => list.filter(x => x.slug === "b") };
  console.log(JSON.stringify(c.selectableChanges(all, [only]).map(x => x.slug)));'
check "and may not invent one"              0 "[]" -- node -e '
  const c = require("'"$ROOT"'/packages/core/dist/index.js");
  const cheat = { name: "t", changes: () => [{node:"changes/ghost",slug:"ghost",title:"G",state:"draft"}] };
  console.log(JSON.stringify(c.selectableChanges([], [cheat])));'

# A prompt in a pipeline blocks until the job is killed, and the output says nothing about why.
# Both refusals name what could have been passed, so the caller can fix it in one turn.
check "no terminal means a refusal, not a wait" 1 "nothing is reading input" -- sh -c '
  node '"$BIN"' move < /dev/null'
check "and it names the changes there are"     1 "walks" -- sh -c '
  node '"$BIN"' move < /dev/null'
check "the same when only the state is missing" 1 "nothing is reading input" -- sh -c '
  node '"$BIN"' change new "Picker probe" --name picker-probe >/dev/null
  node '"$BIN"' move picker-probe < /dev/null'
check "and it names the states reachable"       1 "review" -- sh -c '
  node '"$BIN"' move picker-probe < /dev/null'
check "an unknown name points at the picker"    1 "with no arguments to pick from a list" -- sh -c '
  node '"$BIN"' move nonesuch review'
# In a directory of its own: one configuration names one corpus, so a second beside the first is
# refused rather than added.
check "moving with no changes at all is refused" 1 "no changes to move" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null && node '"$BIN"' move < /dev/null'

# --------------------------------------------------------------------------- publishing
printf '\npublishing\n'

# A corpus with one change carrying the documents it proposes. Built once and reused by the
# assertions that must run against an unpublished change; the destructive ones make their own.
seeded() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  node "$BIN" capability new "Feeding" --name feeding >/dev/null
  node "$BIN" change new "Cats are fed twice a day" --name fed --capability feeding >/dev/null
  mkdir -p docs/changes/fed/publish/specs/feeding-schedule
  printf -- "---\ntitle: Cats are fed twice a day\nlang: en\ncapability: feeding\n---\n\nA cat is fed at 08:00 and at 18:00.\n" \
    > docs/changes/fed/publish/specs/feeding-schedule/spec.md
  printf -- "# How it is built\n\nA cron entry.\n" \
    > docs/changes/fed/publish/specs/feeding-schedule/architecture.md
}

# The mirrored path is the whole instruction: no flag named the destination.
check "a publication lands where its path says" 0 "specs/feeding-schedule/spec.md" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed'
check "and the document is there, with its text" 0 "fed at 08:00" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  cat docs/specs/feeding-schedule/spec.md'
check "several documents land together"        0 "architecture.md" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  ls docs/specs/feeding-schedule'
# Two specifications in one publication: the sweeping-edit case, where a component renamed
# across the base touches many documents at once. It must be ordinary rather than a special mode.
check "and so do two whole specifications"     0 "ok" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  mkdir -p docs/changes/fed/publish/specs/grooming
  printf -- "---\ntitle: Cats are groomed weekly\nlang: en\ncapability: feeding\n---\n\nOnce a week.\n" \
    > docs/changes/fed/publish/specs/grooming/spec.md
  node '"$BIN"' publish fed >/dev/null
  test -f docs/specs/feeding-schedule/spec.md && test -f docs/specs/grooming/spec.md && echo ok'

# The change is finished, and the archive keeps everything — including the proposal, which is
# what answers "what did this change actually write" without consulting git.
check "the bundle leaves changes/"             1 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  test -d docs/changes/fed'
check "and is archived whole"                  0 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  test -f docs/history/fed/tests.md'
check "the archive still holds the proposal"   0 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  test -f docs/history/fed/publish/specs/feeding-schedule/spec.md'
check "the archived change declares the end"   0 "state: published" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  cat docs/history/fed/change.md'
check "and the ledger records the transition"  0 '"to":"published"' -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  grep changes/fed docs/.mollyguard/history.jsonl | tail -1'
check "status lists it as finished"            0 "published" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  node '"$BIN"' status'

# A replacement replaces whole. Appending is what turns a knowledge base into a log of deltas
# that reads like nothing anybody meant.
check "a replacement replaces whole"           0 "ok" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  node '"$BIN"' change new "Fed three times" --name thrice --capability feeding >/dev/null
  mkdir -p docs/changes/thrice/publish/specs/feeding-schedule
  printf -- "---\ntitle: Fed three times\nlang: en\ncapability: feeding\n---\n\nA cat is fed at 08:00, 13:00 and 18:00.\n" \
    > docs/changes/thrice/publish/specs/feeding-schedule/spec.md
  node '"$BIN"' publish thrice >/dev/null
  grep -q "13:00" docs/specs/feeding-schedule/spec.md \
    && ! grep -q "fed at 08:00 and at 18:00" docs/specs/feeding-schedule/spec.md \
    && echo ok'

# Every refusal fires with the disk untouched. Both halves are asserted, because a refusal that
# half-applies is worse than no check at all and the two fail independently.
check "no publish/ folder is refused"          1 "carries no publish/ folder" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Empty handed" --name bare >/dev/null
  node '"$BIN"' publish bare'
check "an empty publish/ is refused"           1 "is empty" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Empty handed" --name bare >/dev/null
  mkdir -p docs/changes/bare/publish
  node '"$BIN"' publish bare'
check "a document outside a publishable area is refused" 1 "is not a change" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  mkdir -p docs/changes/fed/publish/capabilities
  printf -- "---\ntitle: Sneaked\n---\n\nx\n" > docs/changes/fed/publish/capabilities/sneaked.md
  node '"$BIN"' publish fed'
check "and it names where a change may write"  1 "specs, decisions" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  mkdir -p docs/changes/fed/publish/capabilities
  printf -- "---\ntitle: Sneaked\n---\n\nx\n" > docs/changes/fed/publish/capabilities/sneaked.md
  node '"$BIN"' publish fed'
check "and nothing was written"                1 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  mkdir -p docs/changes/fed/publish/capabilities
  printf -- "---\ntitle: Sneaked\n---\n\nx\n" > docs/changes/fed/publish/capabilities/sneaked.md
  node '"$BIN"' publish fed >/dev/null 2>&1
  test -d docs/specs/feeding-schedule'
# Refused rather than reported, unlike everywhere else a scan cannot read something. Skipping it
# would write part of a change into the base and call the change finished.
check "a document that cannot be read is refused" 1 "could not be read" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  ln -s /nowhere-at-all docs/changes/fed/publish/specs/feeding-schedule/dangling.md
  node '"$BIN"' publish fed'
check "and nothing was published"              1 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  ln -s /nowhere-at-all docs/changes/fed/publish/specs/feeding-schedule/dangling.md
  node '"$BIN"' publish fed >/dev/null 2>&1
  test -d docs/specs/feeding-schedule'
check "a name that is not one is refused"      1 "is not a usable name" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  mkdir -p "docs/changes/fed/publish/specs/Feeding Schedule"
  printf -- "---\ntitle: x\n---\n\nx\n" > "docs/changes/fed/publish/specs/Feeding Schedule/spec.md"
  node '"$BIN"' publish fed'
check "a new bundle with no entry is refused"  1 "brings no spec.md" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Half" --name half >/dev/null
  mkdir -p docs/changes/half/publish/specs/lonely
  printf -- "# How it is built\n" > docs/changes/half/publish/specs/lonely/architecture.md
  node '"$BIN"' publish half'
check "an unknown capability is refused"       1 "does not exist" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Misfiled" --name mis >/dev/null
  mkdir -p docs/changes/mis/publish/specs/thing
  printf -- "---\ntitle: Thing\ncapability: nowhere\n---\n\nx\n" > docs/changes/mis/publish/specs/thing/spec.md
  node '"$BIN"' publish mis'
check "unreadable frontmatter is refused"      1 "publish/specs/thing/spec.md:" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Broken" --name broken >/dev/null
  mkdir -p docs/changes/broken/publish/specs/thing
  printf -- "---\ntitle: [unclosed\n---\n\nx\n" > docs/changes/broken/publish/specs/thing/spec.md
  node '"$BIN"' publish broken'

# The check that catches a drafter — a person or an agent — reporting work it did not do.
check "a publication that changes nothing is refused" 1 "differs from the knowledge base" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  node '"$BIN"' change new "Says nothing new" --name same --capability feeding >/dev/null
  mkdir -p docs/changes/same/publish/specs/feeding-schedule
  cp docs/specs/feeding-schedule/spec.md docs/changes/same/publish/specs/feeding-schedule/spec.md
  node '"$BIN"' publish same'
# The last gate before anything is written, so the one where a half-application would show.
check "and leaves that change in flight"       0 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  node '"$BIN"' change new "Says nothing new" --name same --capability feeding >/dev/null
  mkdir -p docs/changes/same/publish/specs/feeding-schedule
  cp docs/specs/feeding-schedule/spec.md docs/changes/same/publish/specs/feeding-schedule/spec.md
  node '"$BIN"' publish same >/dev/null 2>&1
  test -f docs/changes/same/change.md'

check "an unknown change is refused"           1 "no change named" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish nonesuch'
check "a disputed state is refused"            1 "and the ledger says draft" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  perl -pi -e "s/^state: draft$/state: deployed/" docs/changes/fed/change.md
  node '"$BIN"' publish fed'
check "an archive already taken is refused"    1 "already exists" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  mkdir -p docs/history/fed
  node '"$BIN"' publish fed'
check "publishing outside a corpus is refused" 1 "no corpus here" -- sh -c '
  cd / && node '"$BIN"' publish anything'
# The reason rather than the usage line, which is what `move` says in the same situation.
# Being told the shape of the command answers a question nobody asked when the actual
# problem is that there is nothing to name.
check "publishing with no change named is refused" 1 "there is nothing to publish" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null && node '"$BIN"' publish'

# A dry run decides identically and writes nothing. One that could disagree with the real run
# would be worse than none, so a refusal is asserted through it too.
check "a dry run says what would happen"       0 "would publish" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed --dry-run'
check "and writes nothing"                     1 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed --dry-run >/dev/null
  test -d docs/specs/feeding-schedule'
check "and leaves the bundle in flight"        0 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed --dry-run >/dev/null
  test -f docs/changes/fed/change.md'
check "and refuses what the real run refuses"  1 "carries no publish/ folder" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Empty handed" --name bare >/dev/null
  node '"$BIN"' publish bare --dry-run'
# A flag taking no value must not eat the argument after it. Before this, `--dry-run <change>`
# swallowed the change as the flag'"'"'s value and the command refused for having no change —
# naming the very argument that had just been typed.
check "the flag may come before the name"      0 "would publish" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish --dry-run fed'
check "and it is still a dry run"              1 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish --dry-run fed >/dev/null
  test -d docs/specs/feeding-schedule'
# The other half of the same argument, and the one that cost a publication. An unrecognised flag
# was parsed, stored and never read, which is the same behaviour as not having typed it — so
# `--dryrun`, one hyphen short of the flag that exists, published for real, archived the bundle
# and recorded it, while the caller believed they had asked for a dry run. A safety flag that
# silently does nothing is worse than no safety flag.
check "a misspelt flag is refused, not ignored" 1 "does not take --dryrun" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed --dryrun'
check "and nothing was published"              1 "" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed --dryrun >/dev/null 2>&1
  test -d docs/specs/feeding-schedule'
check "the refusal names what it does take"    1 "--dry-run" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed --dryrun'
check "and every command is checked"           1 "does not take --jsn" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' status --jsn'
# A flag one command takes is not a flag they all take: the table is per command, not a set of
# every flag the tool has.
check "a flag from another command is refused" 1 "does not take --kind" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' capability new "Billing" --kind feature'
check "and --root is taken everywhere"         0 "no changes yet" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init --root elsewhere >/dev/null
  node '"$BIN"' status --root elsewhere'

# A decision is the other thing a change may publish, and it lands in an area holding files
# rather than folders — so it is the shape the spec case would not have caught.
check "a decision can be published too"        0 "decisions/one-write-per-invoice.md" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "A standing constraint" --name constraint >/dev/null
  mkdir -p docs/changes/constraint/publish/decisions
  printf -- "---\ntitle: One write per invoice\nlang: en\n---\n\nEvery write goes through one gate.\n" \
    > docs/changes/constraint/publish/decisions/one-write-per-invoice.md
  node '"$BIN"' publish constraint'
check "and lands as a file, not a folder"      0 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "A standing constraint" --name constraint >/dev/null
  mkdir -p docs/changes/constraint/publish/decisions
  printf -- "---\ntitle: One write per invoice\nlang: en\n---\n\nEvery write goes through one gate.\n" \
    > docs/changes/constraint/publish/decisions/one-write-per-invoice.md
  node '"$BIN"' publish constraint >/dev/null
  test -f docs/decisions/one-write-per-invoice.md'
# And it needs no capability, because nothing reads a decision by one. A constraint is found by
# whatever it constrains; requiring a grouping on it would be inventing a rule the corpus has not
# got. Stated as an assertion because the check below is one line away from applying to both.
check "and needs no capability to do it"      0 "decisions/one-write-per-invoice.md" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "A standing constraint" --name constraint >/dev/null
  mkdir -p docs/changes/constraint/publish/decisions
  printf -- "---\ntitle: One write per invoice\nlang: en\n---\n\nEvery write goes through one gate.\n" \
    > docs/changes/constraint/publish/decisions/one-write-per-invoice.md
  node '"$BIN"' publish constraint'

# New truth with nowhere to read it. A specification is read as part of a capability, so a new
# one naming none is present and unreachable — nothing points at it and no slice contains it.
# Refused at publication rather than at creation: either half can be worked out after the bundle
# exists, and publication is the last moment refusing is free.
unfiled() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  node "$BIN" change new "Floating truth" --name floating >/dev/null
  mkdir -p docs/changes/floating/publish/specs/floating
  printf -- "---\ntitle: Floating\nlang: en\n---\n\nA claim nobody can find.\n" \
    > docs/changes/floating/publish/specs/floating/spec.md
}
check "a new spec filed nowhere is refused"   1 "filed under no capability" -- sh -c '
  '"$(declare -f unfiled)"'; unfiled
  node '"$BIN"' publish floating'
check "and nothing was written"               1 "" -- sh -c '
  '"$(declare -f unfiled)"'; unfiled
  node '"$BIN"' publish floating >/dev/null 2>&1
  test -e docs/specs/floating'
check "the change may answer for it"          0 "specs/floating/spec.md" -- sh -c '
  '"$(declare -f unfiled)"'; unfiled
  node '"$BIN"' capability new "Floaty" --name floaty >/dev/null
  sed -i.bak "s/^kind: feature$/kind: feature\ncapability: floaty/" docs/changes/floating/change.md
  node '"$BIN"' publish floating'
check "and the answer must be a real capability" 1 "which does not exist" -- sh -c '
  '"$(declare -f unfiled)"'; unfiled
  sed -i.bak "s/^kind: feature$/kind: feature\ncapability: never-made/" docs/changes/floating/change.md
  node '"$BIN"' publish floating'
# Reported by `molly status` while the change is in flight, and refused here because publishing
# is the point after which nothing would report it again: the bundle is archived, and nothing
# scans the archive for references that stopped resolving.
check "and nothing was written for it either" 1 "" -- sh -c '
  '"$(declare -f unfiled)"'; unfiled
  sed -i.bak "s/^kind: feature$/kind: feature\ncapability: never-made/" docs/changes/floating/change.md
  node '"$BIN"' publish floating >/dev/null 2>&1
  test -e docs/specs/floating'
check "or the document may answer for itself" 0 "specs/floating/spec.md" -- sh -c '
  '"$(declare -f unfiled)"'; unfiled
  node '"$BIN"' capability new "Floaty" --name floaty >/dev/null
  printf -- "---\ntitle: Floating\nlang: en\ncapability: floaty\n---\n\nA claim with a home.\n" \
    > docs/changes/floating/publish/specs/floating/spec.md
  node '"$BIN"' publish floating'
# Only new documents. One replacing what is already in the base is not being filed anywhere — it
# is filed, and where it sits is not this change's question. Refusing here would refuse an edit
# for a field the edit does not need.
check "replacing an existing spec needs none" 0 "specs/feeding-schedule/spec.md" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  node '"$BIN"' change new "Feed them thrice" --name thrice >/dev/null
  mkdir -p docs/changes/thrice/publish/specs/feeding-schedule
  printf -- "---\ntitle: Cats are fed thrice a day\nlang: en\n---\n\nAt 08:00, 13:00 and 18:00.\n" \
    > docs/changes/thrice/publish/specs/feeding-schedule/spec.md
  node '"$BIN"' publish thrice'

# ------------------------------------------------------------------------------- agents
printf '\nagents\n'

# A corpus arrives with the instructions an agent needs, in the directories agents already read.
# Nothing is written into AGENTS.md or CLAUDE.md: a root instruction file is always-on context
# for a workflow that is a fraction of what happens in a repository.
installed() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
}

check "init installs the vendor-neutral skill" 0 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  test -f .agents/skills/molly-corpus/SKILL.md'
check "and the Claude one"                     0 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  test -f .claude/skills/molly-corpus/SKILL.md'
check "and the workflow skills beside it"      0 "molly-advance molly-corpus molly-new molly-publish" -- sh -c '
  '"$(declare -f installed)"'; installed
  ls .agents/skills | sort | tr "\n" " " | sed "s/ $//"'
check "the same four for Claude Code"          0 "molly-advance molly-corpus molly-new molly-publish" -- sh -c '
  '"$(declare -f installed)"'; installed
  ls .claude/skills | sort | tr "\n" " " | sed "s/ $//"'
# Junie and Kiro each read one directory of their own and would find nothing in the shared root.
# They are defaults rather than opt-in because a root installed only when named is a root
# `--check` never looks at, which is the failure the check exists to catch, one level up.
check "and the JetBrains directory too"        0 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  test -f .junie/skills/molly-corpus/SKILL.md'
check "and the Kiro one"                       0 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  test -f .kiro/skills/molly-corpus/SKILL.md'
# The number that changes when somebody adds a directory without deciding to. Five skills into
# each of four roots; two tools naming one root is still one root. Plus the five commands each
# of the three real tools takes — the shared root is a directory rather than a palette, so it
# has none, and a count that ever equals 40 is a command file written where nothing types.
check "five skills into each of four roots"    0 "35 file(s) written" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents'
check "and names the grants to add"            0 "Bash(molly:*)" -- sh -c '
  '"$(declare -f installed)"'; installed
  node '"$BIN"' agents --tools claude'
# Nothing is written into a file the project owns. Asserted as an absence, which is the only way
# a file that should not exist can be checked at all.
check "and writes no root instruction file"    1 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  test -e AGENTS.md -o -e CLAUDE.md'

check "molly agents installs them on its own"  0 "agent instructions" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents'
# The third outcome, which is the one --check reads: already there and identical.
check "and says so when they are current"      0 "already current" -- sh -c '
  '"$(declare -f installed)"'; installed
  node '"$BIN"' agents'
check "a subset can be chosen"                 0 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  test -f .agents/skills/molly-corpus/SKILL.md'
check "and the rest is not written"            1 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  test -d .claude'

# Naming a tool is answering "does this work with mine". Nine of them read one directory, so
# asking for one of the nine writes that directory — and says who else it just served, because
# an install that left this to be discovered is one people re-run per tool, or doubt.
check "a tool can be named instead"            0 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools cursor >/dev/null
  test -f .agents/skills/molly-corpus/SKILL.md'
check "and two that share a root write once"   0 "10 file(s) written" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools codex,cursor'
check "and the run says who else reads it"     0 "read by OpenAI Codex, Cursor" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools cursor'
# Cline is the mirror image of Claude Code: it reads the Claude Code directory and not the
# shared root. A row says where a tool reads, so asking for it writes there and nowhere else.
check "a tool that reads the other root"       0 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools cline >/dev/null
  test -f .claude/skills/molly-corpus/SKILL.md'
check "and only there"                         1 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools cline >/dev/null
  test -d .agents'
# The three that were always covered by the shared root and had no row. Naming one of them now
# works, which is the whole of what a row is for.
check "a tool the shared root already served" 0 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools goose >/dev/null
  test -f .agents/skills/molly-corpus/SKILL.md'
check "and two of them write it once"          0 "5 file(s) written" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools roo,openhands'
# Junie and Kiro are the rows somebody tidying the table would fold into the majority, exactly
# as Cline is the row somebody would fold the other way. An absence is what catches that.
check "a tool with a directory of its own"     0 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools junie >/dev/null
  test -f .junie/skills/molly-corpus/SKILL.md'
check "and it is not given the shared root"    1 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools junie >/dev/null
  test -d .agents'
check "the same for the other one"             0 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools kiro >/dev/null
  test -f .kiro/skills/molly-corpus/SKILL.md'
check "and it is not given it either"          1 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools kiro >/dev/null
  test -d .agents'

# The second surface. A skill is loaded by a model that decided the work is ours; a command is
# typed by somebody who already knows. The name is read off the path by the tool, so the path is
# the whole of what makes `/molly:new` work — and it is not the same path twice.
check "a command lands where it is typed"      0 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  test -f .claude/commands/molly/new.md'
# The directory is the namespace here, and the filename is the name there. Getting these the
# wrong way round writes files that parse, install, and never appear in a palette.
check "and flat where nothing namespaces it"   0 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  test -f .kiro/prompts/molly-new.prompt.md'
check "the run says what can now be typed"     0 "/molly:new" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools claude'
check "and says it the other way too"          0 "/molly-new" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools cursor'
# Two claims, and the second is the one that goes wrong silently: a tool whose command directory
# nobody has verified gets skills and no invented path.
check "a tool with no palette gets none"       1 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools codex >/dev/null
  test -e .agents/commands'
check "and the one that wants TOML gets it"    0 "prompt = " -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools gemini >/dev/null
  cat .gemini/commands/molly/new.toml'
# One text, two files. The bodies are byte-identical because they are the same string: a command
# that had its own copy would be the second answer this product exists to prevent.
check "both surfaces carry one body"           0 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  tail -n +7 .claude/skills/molly-new/SKILL.md > skill.body
  tail -n +6 .claude/commands/molly/new.md > command.body
  diff skill.body command.body'
# One tool reads both directories into one namespace, so a menu it was given both surfaces for
# would list every action twice — once as /molly:new and once as /molly-new. The two are told
# apart by frontmatter: the skill leaves the menu, the command leaves the model context. Each
# keeps the half it is for, and neither reader sees four things described twice.
check "the skill is not in the menu as well"   0 "user-invocable: false" -- sh -c '
  '"$(declare -f installed)"'; installed
  cat .claude/skills/molly-new/SKILL.md'
check "and the command is not in the context"  0 "disable-model-invocation: true" -- sh -c '
  '"$(declare -f installed)"'; installed
  cat .claude/commands/molly/new.md'
# Written into that tool'"'"'s copy and no other. The shared root is read by twelve implementations
# of a spec these two keys are not in, and a key eleven of them ignore is a bet rather than a fact.
check "and no other copy carries the keys"     1 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  grep -q "user-invocable" .agents/skills/molly-new/SKILL.md'
check "nor a command nothing doubles"          1 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  grep -q "disable-model-invocation" .junie/commands/molly-new.md'
# What differs is the one line each reader needs. A description ends in the conditions for
# loading it, which is noise in a list somebody is reading to find the thing they already want.
check "and the line written for its reader"    1 "" -- sh -c '
  '"$(declare -f installed)"'; installed
  grep -q "Use when asked to propose" .claude/commands/molly/new.md'
# The check reads commands as well as skills, or an old palette entry survives every upgrade.
check "--check reads the commands too"         1 "differs  .claude/commands/molly/new.md" -- sh -c '
  '"$(declare -f installed)"'; installed
  printf "\n" >> .claude/commands/molly/new.md
  node '"$BIN"' agents --check'
# The settings file is not written, in any state it could be in. This once merged the grants in,
# carefully — whole when absent, otherwise parsed and given only what it lacked — and careful was
# not the point. That file decides what runs without being asked; its contents are somebody's
# judgement about risk, and a tool that adds itself to it has approved itself.
check "an absent settings file stays absent"   1 "" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools claude >/dev/null
  test -e .claude/settings.json'
check "and an existing one is untouched"       0 "identical" -- sh -c '
  cd "$(mktemp -d)" && mkdir -p .claude
  printf "%s" "{\"model\":\"opus\",\"permissions\":{\"allow\":[\"Bash(git status:*)\"],\"deny\":[\"Bash(rm:*)\"]}}" > .claude/settings.json
  cp .claude/settings.json before
  node '"$BIN"' agents --tools claude >/dev/null
  cmp -s before .claude/settings.json && echo identical'
# Not even read. A file that will not parse used to be reported, which meant opening it — and
# there is nothing in there this tool has any business having an opinion about.
check "one that will not parse is not read"    0 "identical" -- sh -c '
  cd "$(mktemp -d)" && mkdir -p .claude && printf "{ not json" > .claude/settings.json
  cp .claude/settings.json before
  node '"$BIN"' agents --tools claude >/dev/null 2>&1
  cmp -s before .claude/settings.json && echo identical'
# The convenience survives the write not happening. Ten seconds of pasting, against a grant the
# person has read — which is the difference between approving something and finding it approved.
check "the file to paste into is named"        0 ".claude/settings.json" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools claude'

check "an unknown tool is refused"             1 "is not a tool this installs for" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools nonesuch'
check "and it names the ones there are"        1 "agents, claude" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools nonesuch'

# The rules a model breaks here because another tool taught it otherwise. Each is a sentence
# somebody could delete without anything else noticing.
skill() { cd "$(mktemp -d)" || exit 2; node "$BIN" agents --tools agents >/dev/null; cat .agents/skills/molly-corpus/SKILL.md; }
check "the skill forbids editing the base"     0 "Never edit them directly" -- sh -c '
  '"$(declare -f skill)"'; skill'
check "and says a document is replaced whole"  0 "There is no delta format" -- sh -c '
  '"$(declare -f skill)"'; skill'
check "and that the engine composes no text"   0 "The engine composes no text" -- sh -c '
  '"$(declare -f skill)"'; skill'
check "and how the terminal state is reached"  0 "never by \`molly move\`" -- sh -c '
  '"$(declare -f skill)"'; skill'
check "and points at the decisions in force"   0 "docs/decisions/" -- sh -c '
  '"$(declare -f skill)"'; skill'
check "and at the language to write in"        0 "mollyguard.yml" -- sh -c '
  '"$(declare -f skill)"'; skill'
# A project's own rules reached one tool out of four when they lived in a Claude-specific file.
# A pointer rather than a copy: composing the file into the skill would break the refutation
# below that no skill holds corpus content, and would go stale silently four times over.
check "and at the project's own rules"         0 "docs/conventions.md" -- sh -c '
  '"$(declare -f skill)"'; skill'
check "and says those rules outrank it"        0 "it wins" -- sh -c '
  '"$(declare -f skill)"'; skill'
# A corpus is not always at docs/. Without this the skill describes every path wrongly for a
# corpus made with --root, and the description would not fire for it either.
check "and says how to find the corpus"        0 "sits at the top of the repository" -- sh -c '
  '"$(declare -f skill)"'; skill'
refute "and does not tie its trigger to docs/"   "repository has docs/" -- sh -c '
  '"$(declare -f skill)"'; skill'

# What makes one installation serve every major tool: the Agent Skills format, and nothing
# outside it. A seventh frontmatter field is accepted by the tool that invented it and a hard
# error on the path that packages the skill, so the two required fields are the whole contract.
check "every skill conforms to the spec"       0 "ok" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  bad=""
  for file in .agents/skills/*/SKILL.md; do
    dir="$(basename "$(dirname "$file")")"
    keys="$(sed -n "2,/^---$/p" "$file" | grep -oE "^[a-z-]+:" | tr -d ":" | sort | tr "\n" " ")"
    [ "$keys" = "description name " ] || bad="$bad [$dir has $keys]"
    name="$(grep -m1 "^name: " "$file" | cut -d" " -f2-)"
    [ "$name" = "$dir" ] || bad="$bad [$dir names itself $name]"
    printf "%s" "$dir" | grep -qE "^molly-[a-z0-9]+(-[a-z0-9]+)*$" || bad="$bad [$dir is not a spec name]"
    desc="$(grep -m1 "^description: " "$file" | cut -d" " -f2-)"
    { [ -n "$desc" ] && [ "${#desc}" -le 1024 ]; } || bad="$bad [$dir description]"
    printf "%s" "$desc" | grep -q ": " && bad="$bad [$dir description breaks the frontmatter]"
  done
  [ -z "$bad" ] || { printf "%s\n" "$bad"; exit 1; }
  echo ok'
# Only one of them may be loaded, so a skill that depended on another being open would be a
# skill that is sometimes wrong. Each says where the corpus is, because a corpus the config names
# is not necessarily docs/ and every path in it would then be read against the wrong directory.
check "each skill stands on its own"           0 "ok" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  miss=""
  for file in .agents/skills/*/SKILL.md; do
    grep -qF "unless it says otherwise" "$file" || miss="$miss [$file]"
  done
  [ -z "$miss" ] || { printf "%s\n" "$miss"; exit 1; }
  echo ok'
# A root that received four files but not *these* four is the failure a count calls a success.
# Pointed at the newest directory, because that is the one nothing else here reads.
check "a new root holds the same skills"       0 "ok" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools junie >/dev/null
  bad=""
  for file in .junie/skills/*/SKILL.md; do
    dir="$(basename "$(dirname "$file")")"
    keys="$(sed -n "2,/^---$/p" "$file" | grep -oE "^[a-z-]+:" | tr -d ":" | sort | tr "\n" " ")"
    [ "$keys" = "description name " ] || bad="$bad [$dir has $keys]"
    name="$(grep -m1 "^name: " "$file" | cut -d" " -f2-)"
    [ "$name" = "$dir" ] || bad="$bad [$dir names itself $name]"
  done
  grep -qF "Never edit them directly" .junie/skills/molly-corpus/SKILL.md || bad="$bad [no rule]"
  [ -z "$bad" ] || { printf "%s\n" "$bad"; exit 1; }
  echo ok'

# The refutations the design rests on. A skill holding any of these would be a second answer to
# a question the corpus already answers — stale the moment it changes, and stale silently.
corpus_with_facts() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init --lang zz >/dev/null
  node "$BIN" capability new "Bookkeeping oddity" --name bookkeeping-oddity >/dev/null
  printf -- "---\ntitle: Never do the odd thing\n---\n\nx\n" > docs/decisions/never-do-the-odd-thing.md
  node "$BIN" agents >/dev/null
}
refute "the skills name no capability"           "bookkeeping-oddity" -- sh -c '
  '"$(declare -f corpus_with_facts)"'; corpus_with_facts
  cat .agents/skills/*/SKILL.md'
refute "and no decision"                         "never-do-the-odd-thing" -- sh -c '
  '"$(declare -f corpus_with_facts)"'; corpus_with_facts
  cat .agents/skills/*/SKILL.md'
refute "and not the corpus language"             "zz" -- sh -c '
  '"$(declare -f corpus_with_facts)"'; corpus_with_facts
  cat .agents/skills/*/SKILL.md'

check "--check passes on a fresh install"      0 "are current" -- sh -c '
  '"$(declare -f installed)"'; installed
  node '"$BIN"' agents --check'
check "and fails on a hand edit, naming it"    1 "molly-corpus/SKILL.md" -- sh -c '
  '"$(declare -f installed)"'; installed
  printf "edited\n" >> .claude/skills/molly-corpus/SKILL.md
  node '"$BIN"' agents --check'
# What the default earns. A root installed only when named is one the check never opens, so it
# keeps whatever an old version wrote — the drift the check exists to report, one level up.
check "including inside a root added later"    1 ".junie/skills/molly-corpus/SKILL.md" -- sh -c '
  '"$(declare -f installed)"'; installed
  printf "edited\n" >> .junie/skills/molly-corpus/SKILL.md
  node '"$BIN"' agents --check'
# A check that repaired what it found would be an install, and nobody could tell which they ran.
check "and repairs nothing"                    0 "edited" -- sh -c '
  '"$(declare -f installed)"'; installed
  printf "edited\n" >> .claude/skills/molly-corpus/SKILL.md
  node '"$BIN"' agents --check >/dev/null 2>&1
  tail -1 .claude/skills/molly-corpus/SKILL.md'
check "and fails rather than crashing on none" 1 "missing or out of date" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --check'

# Token cost is a design constraint. A limit nothing checks is one the third helpful paragraph
# exceeds, and the cost lands on every session that loads it.
# The reason these are generated rather than written once: a skill naming a command that no
# longer exists sends its reader to a dead end, silently, in a file nobody opens. The same check
# the generated READMEs get, pointed at the instructions.
# Drafting is where guessing is cheapest and costs most: the unknown goes into change.md, where
# every other sentence in a change goes, and the gate is a human declining to approve one that is
# visibly unresolved. The skill says plainly that the tool refuses nothing for it — an agent told
# "the tool will stop you" about something it does not stop is one that stops trusting the rest.
check "drafting says never to guess"           0 "Never guess" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  cat .agents/skills/molly-new/SKILL.md'
check "and where the unknown is written"       0 "change.md" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  sed -n "/Never guess/,+2p" .agents/skills/molly-new/SKILL.md'
check "and that nothing refuses it"            0 "refuses" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  sed -n "/Never guess/,+3p" .agents/skills/molly-new/SKILL.md'

check "the instructions name only real commands" 0 "ok" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents >/dev/null
  help="$(node '"$BIN"' help)"
  miss=""
  for token in $(grep -ohE "molly [a-z]+" .agents/skills/*/SKILL.md \
                 | sort -u | tr " " "~"); do
    named="$(printf "%s" "$token" | tr "~" " ")"
    grep -qF -- "$named" <<<"$help" || miss="$miss [$named]"
  done
  [ -z "$miss" ] || { printf "named in the instructions, not a command:%s\n" "$miss"; exit 1; }
  echo ok'

# The same failure through the other door, and the one that actually happened: the configuration
# moved out of the corpus and the skills went on pointing inside it for the language. Nothing
# noticed, because `--check` compares what is installed against what this version generates and
# both said the same wrong thing — a check that regenerates cannot catch a claim the generator is
# also making. So the paths are read against a real corpus instead of against the text they came
# from. `conventions.md` is excluded: the skill says "if it is there", and a project that has not
# written one is the ordinary case.
check "and paths that exist in a corpus"       0 "ok" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null && node '"$BIN"' agents >/dev/null
  bad=""
  for named in $(grep -ohE "(docs/[a-zA-Z0-9_./-]*|[^/a-zA-Z]mollyguard[.]yml)" .agents/skills/*/SKILL.md \
                 | sed "s|^[^a-z]||" | grep -v "^docs/conventions.md$" | sort -u); do
    [ -e "$named" ] || bad="$bad [$named]"
  done
  [ -z "$bad" ] || { printf "named in the instructions, not in a corpus:%s\n" "$bad"; exit 1; }
  echo ok'

check "the skill stays short"                  0 "ok" -- sh -c '
  '"$(declare -f skill)"'; skill | wc -l | awk "{print (\$1 <= 60) ? \"ok\" : \"skill is \" \$1 \" lines\"}"'
# The four workflow skills are procedures, not a second copy of the reference one. A cap each,
# because five skills load their name and description into every session that starts.
check "and the workflow skills shorter still" 0 "ok" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  long=""
  for file in .agents/skills/molly-new .agents/skills/molly-advance .agents/skills/molly-publish .agents/skills/molly-roadmap; do
    lines="$(wc -l < "$file/SKILL.md")"
    [ "$lines" -le 30 ] || long="$long [$file $lines lines]"
  done
  [ -z "$long" ] || { printf "%s\n" "$long"; exit 1; }
  echo ok'



# ------------------------------------------------------------------ finding the corpus
#
# The configuration used to live *inside* the corpus, which made it both the marker and the
# contents — and cost every command a `--root` flag for ever after. It also meant no searching:
# the tool looked at `docs/` under the working directory and nowhere else, so standing one
# directory down broke everything.
printf '\nfinding the corpus\n'

deep() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  mkdir -p src/a/b
}
check "a command works from a subdirectory" 0 "capabilities/billing" -- sh -c '
  '"$(declare -f deep)"'; deep
  cd src/a/b && node '"$BIN"' capability new "Billing" --name billing'
# The name is the corpus's, not a path computed from wherever the shell happened to be. A tool
# calling one corpus `docs` here and `../../../docs` there produces output nothing can compare.
check "and names the corpus the same way"  0 "docs/capabilities/billing.md" -- sh -c '
  '"$(declare -f deep)"'; deep
  cd src/a/b && node '"$BIN"' capability new "Billing" --name billing'
check "and status reads it from down there" 0 "capabilities  billing" -- sh -c '
  '"$(declare -f deep)"'; deep
  node '"$BIN"' capability new "Billing" --name billing >/dev/null
  cd src/a/b && node '"$BIN"' status'
# Outside one entirely is still a refusal, and it says where it looked.
check "outside any corpus it says so"      1 "no corpus here" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' status'

# A configuration that will not parse used to degrade into the old layout — `root:` could not be
# read, so the corpus was taken to be the directory holding the file, and `status` reported an
# empty corpus and exited 0 while the real one sat untouched beside it. Reporting success over
# something it never looked at is the one failure this tool exists to prevent.
check "a config that will not parse is refused" 1 "mollyguard.yml:" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf "root: docs\n  bad: [\n" > mollyguard.yml
  node '"$BIN"' status'
check "and it does not report an empty corpus" 1 "fix" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' capability new "Billing" --name billing >/dev/null
  printf "root: docs\n  bad: [\n" > mollyguard.yml
  node '"$BIN"' status'

# One configuration names one corpus, so a second in the same directory is refused rather than
# added — two would be two answers to "where is the corpus".
check "a second corpus here is refused"    1 "a corpus is already here" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' init --root other'
check "and it names what configures it"    1 "mollyguard.yml configures it" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' init'
# A package inside a larger repository may have its own, so the refusal is about this directory
# rather than about anything above it. Discovery walks up, so the nearest one wins.
check "one below another is allowed"       0 "corpus initialised" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  mkdir -p packages/inner && cd packages/inner && node '"$BIN"' init'
check "and the nearer one is the one found" 0 "root: docs" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init --root outer >/dev/null
  mkdir -p packages/inner && cd packages/inner
  node '"$BIN"' init >/dev/null && cat mollyguard.yml'

# The old layout, where the file sat in the corpus and there was no `root:`. Nothing has to be
# migrated: the rule is one line and it is not a deprecation.
legacy() {
  cd "$(mktemp -d)" || exit 2
  mkdir -p docs/capabilities docs/.mollyguard
  printf 'lang: en\n' > docs/mollyguard.yml
  : > docs/.mollyguard/history.jsonl
  printf -- '---\ntitle: Old\nlang: en\n---\n' > docs/capabilities/old.md
}
check "a corpus in the old layout still reads" 0 "capabilities  old" -- sh -c '
  '"$(declare -f legacy)"'; legacy
  node '"$BIN"' status'
check "and is still found from below"      0 "capabilities  old" -- sh -c '
  '"$(declare -f legacy)"'; legacy
  mkdir -p deep/er && cd deep/er && node '"$BIN"' status'
check "and init will not double it"        1 "a corpus is already here" -- sh -c '
  '"$(declare -f legacy)"'; legacy
  node '"$BIN"' init'
# `--root` still names the corpus directory, for the odd case and for a corpus not at docs/.
check "the flag still points at one"       0 "capabilities  old" -- sh -c '
  '"$(declare -f legacy)"'; legacy
  mv docs kb && node '"$BIN"' status --root kb'
# Commands that write outside a corpus are not refused for standing outside one.
check "agents needs no corpus"             0 "SKILL.md" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents'
# An unknown command has its own message, and answering "no corpus here" to it answers a
# question nobody asked.
check "an unknown command says so first"   1 "unknown command" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' frobnicate'

# ------------------------------------------------------------------- naming is a policy
#
# A corpus may want its names ordered — `0001-sign-in`, each area counting on its own. The tool
# has no opinion about whether to, and every opinion about the allocation: reading `ls` for the
# next free number is a race between two people drafting on one afternoon and a memory test for
# whoever does it from memory, and a duplicate ordinal is two directories that sort as a pair.
printf '\nnaming is a policy\n'

ordered() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  printf 'root: docs\nlang: en\nnaming:\n  changes: "{ordinal:4}-{slug}"\n' > mollyguard.yml
}
check "a name is numbered where asked"     0 "changes/0001-first-thing" -- sh -c '
  '"$(declare -f ordered)"'; ordered
  node '"$BIN"' change new "First thing"'
check "and the next one counts on"         0 "changes/0002-second-thing" -- sh -c '
  '"$(declare -f ordered)"'; ordered
  node '"$BIN"' change new "First thing" >/dev/null
  node '"$BIN"' change new "Second thing"'
# The case a person reading a directory listing cannot get right. The ledger is the only record
# that outlives the directory, so it is the only one that can answer this.
check "a deleted change does not free its number" 0 "changes/0003-third" -- sh -c '
  '"$(declare -f ordered)"'; ordered
  node '"$BIN"' change new "First thing" >/dev/null
  node '"$BIN"' change new "Second thing" >/dev/null
  rm -rf docs/changes/0002-second-thing
  node '"$BIN"' change new "Third"'
# An area the policy says nothing about keeps the names it always had.
refute "an area with no pattern is unnumbered" "0001" -- sh -c '
  '"$(declare -f ordered)"'; ordered
  node '"$BIN"' capability new "Billing"'
# The migration, and the deliberate exception. A corpus adopting a pattern is made of these.
check "a name given by hand still overrides" 0 "changes/legacy-name" -- sh -c '
  '"$(declare -f ordered)"'; ordered
  node '"$BIN"' change new "Anything" --name legacy-name'
# A policy the tool cannot read is one the corpus believes it has. Silence here is how a
# repository spends a month thinking it numbers its changes.
check "a pattern that will not parse is refused" 1 "not a usable pattern" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf "root: docs\nlang: en\nnaming:\n  changes: \"{ordinal}-{slug}\"\n" > mollyguard.yml
  node '"$BIN"' change new "Anything"'
check "and an area nobody has is too"      1 "is not an area" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf "root: docs\nlang: en\nnaming:\n  chnages: \"{ordinal:4}-{slug}\"\n" > mollyguard.yml
  node '"$BIN"' change new "Anything"'
# The other direction: a corpus that declares nothing is the corpus that existed before this.
refute "a corpus with no policy is unchanged" "0001" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "Plain name"'

# The area a policy most wants ordered is the one nothing mints. A published document takes its
# name from the folder the author wrote inside `publish/`, so until this a corpus could order
# every name it handed out and none of the documents those names were handed out for.
numbered() {
  seeded
  printf 'root: docs\nlang: en\nnaming:\n  specs: "{ordinal:4}-{slug}"\n' > mollyguard.yml
}
check "a published name off the pattern is refused" 1 "is not the name this corpus mints" -- sh -c '
  '"$(declare -f seeded)"'; '"$(declare -f numbered)"'; numbered
  node '"$BIN"' publish fed'
# Refused and never renamed. Filing it as `0001-` would be the tool putting a document somewhere
# other than where it was addressed, so the name it has to be is named and a person moves the
# folder — which is also the only way the author sees the number before it is permanent.
check "and it names the folder to write instead"   1 "0001-feeding-schedule" -- sh -c '
  '"$(declare -f seeded)"'; '"$(declare -f numbered)"'; numbered
  node '"$BIN"' publish fed'
check "and nothing was published"                  1 "" -- sh -c '
  '"$(declare -f seeded)"'; '"$(declare -f numbered)"'; numbered
  node '"$BIN"' publish fed >/dev/null 2>&1
  test -d docs/specs/feeding-schedule'
check "a name on the pattern goes through"         0 "specs/0001-feeding-schedule" -- sh -c '
  '"$(declare -f seeded)"'; '"$(declare -f numbered)"'; numbered
  mv docs/changes/fed/publish/specs/feeding-schedule \
     docs/changes/fed/publish/specs/0001-feeding-schedule
  node '"$BIN"' publish fed'
# The migration, from the publishing side: a corpus adopting a pattern keeps every document it
# already has, and a change editing one is never asked to rename it.
check "replacing a document keeps its old name"    0 "specs/feeding-schedule/spec.md" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed >/dev/null
  printf "root: docs\nlang: en\nnaming:\n  specs: \"{ordinal:4}-{slug}\"\n" > mollyguard.yml
  node '"$BIN"' change new "Later" --name later --capability feeding >/dev/null
  mkdir -p docs/changes/later/publish/specs/feeding-schedule
  printf -- "---\ntitle: Cats are fed twice a day\nlang: en\ncapability: feeding\n---\n\nAt 09:00.\n" \
    > docs/changes/later/publish/specs/feeding-schedule/spec.md
  node '"$BIN"' publish later'
# A document is bundled, so *new* is its folder rather than each file in it. A change adding an
# architecture to a specification that has been in the base for a year is not naming anything.
check "a file joining an existing document is not new" 0 "architecture.md" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  rm docs/changes/fed/publish/specs/feeding-schedule/architecture.md
  node '"$BIN"' publish fed >/dev/null
  printf "root: docs\nlang: en\nnaming:\n  specs: \"{ordinal:4}-{slug}\"\n" > mollyguard.yml
  node '"$BIN"' change new "Later" --name later --capability feeding >/dev/null
  mkdir -p docs/changes/later/publish/specs/feeding-schedule
  printf -- "# How it is built\n\nA cron entry.\n" \
    > docs/changes/later/publish/specs/feeding-schedule/architecture.md
  node '"$BIN"' publish later >/dev/null
  ls docs/specs/feeding-schedule'
# And the corpus that declares nothing publishes what it always published.
refute "a publication with no policy is untouched" "is not the name this corpus mints" -- sh -c '
  '"$(declare -f seeded)"'; seeded
  node '"$BIN"' publish fed'

# ------------------------------------------------------- the plan and the corpus agreeing
#
# A change publishes and its roadmap entry survives, so the plan goes on planning something that
# already exists. Nothing here retires the entry — it is somebody's planning note and the tool
# writes no prose — but it stops being something only a person remembers to notice.
printf '\nthe plan and the corpus\n'

planned() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  node "$BIN" capability new "Billing" --name billing >/dev/null
  printf -- '---\ntitle: Invoices are archived\nlang: en\ncapability: billing\n---\n\nLater.\n' \
    > docs/roadmap/seven-year-archive.md
  node "$BIN" change new "Archive them" --name archive --capability billing \
    --realises seven-year-archive >/dev/null
  mkdir -p docs/changes/archive/publish/specs/archiving
  printf -- '---\ntitle: A\nlang: en\ncapability: billing\n---\n\nSeven years.\n' \
    > docs/changes/archive/publish/specs/archiving/spec.md
}
check "an entry can be written by command" 0 "roadmap/invoices-are-archived" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' roadmap new "Invoices are archived"'
# The half a hand-written entry does not get. The scan reports `Seven Years.md` as unusable for
# as long as it sits there; a minted name is one every other command can already take.
check "and its name is minted by the same rule" 1 "Облік reduces to nothing" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' roadmap new "Облік expenses"'
check "and it is numbered where the corpus asks" 0 "roadmap/0001-a-thought" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf "root: docs\nlang: en\nnaming:\n  roadmap: \"{ordinal:4}-{slug}\"\n" > mollyguard.yml
  node '"$BIN"' roadmap new "A thought"'
# A slice crosses capabilities, so the flag is gone rather than validated — and it is refused by
# name, because a flag that is silently ignored is one the caller believes was applied.
check "a capability is not a slice's to name" 1 "does not take --capability" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' roadmap new "A thought" --capability ghost'
check "a duplicate entry is refused"       1 "already exists" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' roadmap new "A thought" >/dev/null
  node '"$BIN"' roadmap new "A thought"'
check "a change may name what it realises" 0 '"realises": "seven-year-archive"' -- sh -c '
  '"$(declare -f planned)"'; planned
  node '"$BIN"' status --json'
check "an entry that is not there is refused" 1 "no roadmap entry named" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "X" --realises nothing-here'
check "a slice with published work is reported" 0 "has published: changes/archive" -- sh -c '
  '"$(declare -f planned)"'; planned
  node '"$BIN"' publish archive >/dev/null
  node '"$BIN"' status'
# Reported, not failed: an entry is a note rather than a governed unit, and failing a build over
# a planning document nobody retired would be refusing somebody's notes for existing.
check "and the corpus stays clean"         0 '"ok": true' -- sh -c '
  '"$(declare -f planned)"'; planned
  node '"$BIN"' publish archive >/dev/null
  node '"$BIN"' status --json'
check "retiring it quietens the report"    0 "ok" -- sh -c '
  '"$(declare -f planned)"'; planned
  node '"$BIN"' publish archive >/dev/null
  rm docs/roadmap/seven-year-archive.md
  node '"$BIN"' status | grep -q "has published" && echo "still reported" || echo ok'
# Only while in flight. An archived change pointing at a retired entry is the finished shape of
# this link, and reporting it would turn every correct publication into a finding.
refute "a published change is not asked again" "realise a roadmap entry that is not there" -- sh -c '
  '"$(declare -f planned)"'; planned
  node '"$BIN"' publish archive >/dev/null
  rm docs/roadmap/seven-year-archive.md
  node '"$BIN"' status'


# ------------------------------------------------------------- the corpus's own language
#
# `mollyguard.yml` was written by `molly init --lang uk` and then never read, so every document
# minted afterwards said `lang: en` inside a corpus that had declared itself Ukrainian — the tool
# producing a document that contradicts the corpus it is in.
printf "\nthe corpus's own language\n"

check "a minted change takes the corpus language" 0 "lang: uk" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init --lang uk >/dev/null
  node '"$BIN"' change new "A thing" --name a-thing >/dev/null
  grep "^lang:" docs/changes/a-thing/change.md'
check "and so does a capability"           0 "lang: uk" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init --lang uk >/dev/null
  node '"$BIN"' capability new "Grouping" --name grouping >/dev/null
  grep "^lang:" docs/capabilities/grouping.md'
check "and a roadmap entry"                0 "lang: uk" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init --lang uk >/dev/null
  node '"$BIN"' roadmap new "Later" --name later >/dev/null
  grep "^lang:" docs/roadmap/later.md'
# The caller has the better claim than the corpus, and both beat the default.
check "the flag still overrides it"        0 "lang: de" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init --lang uk >/dev/null
  node '"$BIN"' change new "A thing" --name a-thing --lang de >/dev/null
  grep "^lang:" docs/changes/a-thing/change.md'
check "and a corpus declaring none is English" 0 "lang: en" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf "root: docs\n" > mollyguard.yml
  node '"$BIN"' change new "A thing" --name a-thing >/dev/null
  grep "^lang:" docs/changes/a-thing/change.md'

# ------------------------------------------------------------------------------- purity
printf '\nthe core stays pure\n'
# A verdict that cannot be reproduced is a claim rather than a check. Core is handed values
# and returns values, so the same code decides the same way behind a terminal, in a server,
# and in a test — which stops being true the moment it reads a file or a clock.
check "core imports no filesystem, no clock" 1 "" -- grep -rlE "from 'node:|require\('node:|Date\.now|new Date" "$ROOT/packages/core/src"

# --------------------------------------------------------------------- inside its corpus
printf '\nthe tool stays inside its corpus\n'
# MollyGuard governs a corpus of specifications. Everything it does outside one borrows authority
# it was never given, and the borrowing is always defensible one step at a time — a hook here, a
# permission there — which is why the boundary is grepped for rather than agreed to.
#
# Two greps and two runs. A grep proves the code cannot do it and passes over code nobody wrote;
# a run proves it does not and passes over a path nobody took. Both, or neither is worth much.

# One subprocess, in one file, and it reads. This fails at the import the day something shells
# out to `git add` — which is a long way before the damage.
check "only identity runs a subprocess"     1 "" -- sh -c '
  grep -rl "node:child_process" '"$ROOT"'/packages/*/src | grep -v "/identity.ts$"'
# An executable bit is wanted for a hook or a script and for nothing else, and this writes
# markdown, YAML and JSONL. Grepping for `.git` instead would need an exception for the
# `.github/prompts` row in the tools table, and an assertion with a carve-out gets edited.
check "nothing makes a file executable"     1 "" -- sh -c '
  grep -rl "chmod" '"$ROOT"'/packages/*/src'
# And the command that would have wanted one is not a command. Installing a hook was never this
# tool's job; refused as an unknown verb rather than accepted and ignored, so re-adding it has to
# be a decision somebody makes on purpose.
check "installing a hook is not a command"  1 "unknown command" -- m hooks install
# Nor is checking a commit message, which is the same boundary from the other side. A commit is
# somebody else's record: the tool owns the corpus, and a rule about what a commit says is the
# repository's to write and its linter's to enforce.
check "checking a commit is not a command"  1 "unknown command" -- m commit-msg msg.txt
# Grepped as well as run, because a run only covers the path somebody took. These are the three
# shapes that functionality had — the trailer, the hook name, the policy key — and any of them
# reappearing in the source fails here long before it ships. `commit` alone is not the grep: the
# word is ordinary prose in this codebase, and an assertion that cries wolf is one people delete.
check "nothing reads a commit message"      1 "" -- sh -c '
  grep -rlE "commit-msg|MollyGuard:|commitRequires" '"$ROOT"'/packages/*/src'

# The claim in full, run rather than argued: everything `init` leaves behind is the corpus, the
# file that says where the corpus is, or a `molly`-namespaced instruction. Anything else is a
# file this tool does not own, and there is no third kind.
#
# Both name a count they must beat before they may pass. A run that wrote nothing leaves nothing
# foreign behind either, so the naive form of this assertion is green on a command that crashed —
# which is the failure mode an absence is always one line away from.
check "init writes the corpus and its own"  0 "nothing foreign" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null 2>&1
  total=$(find . -type f | wc -l)
  foreign=$(find . -type f | grep -v "^\./docs/" | grep -v "^\./mollyguard.yml$" | grep -v molly)
  if [ "$total" -lt 30 ]; then echo "init wrote only $total file(s)"
  elif [ -n "$foreign" ]; then echo "foreign: $foreign"
  else echo "nothing foreign"; fi'
# The same for the one command whose whole job is writing outside a corpus. Every path is
# namespaced, so an install can be removed without surgery on anything of somebody else's.
check "and agents writes only its own"      0 "nothing foreign" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents >/dev/null 2>&1
  total=$(find . -type f | wc -l)
  foreign=$(find . -type f | grep -v molly)
  if [ "$total" -lt 28 ]; then echo "agents wrote only $total file(s)"
  elif [ -n "$foreign" ]; then echo "foreign: $foreign"
  else echo "nothing foreign"; fi'

printf '\n%s\n' "$(dim 'a command that needs a choice offers it')"

# decisions/a-command-that-needs-a-choice-offers-it. The suite runs with no TTY, which makes the
# refusal half free to assert and the interactive half impossible — so what is asserted here is
# that nothing waits, nothing is written when nothing was chosen, and every existing scripted
# caller behaves exactly as it did. The prompt itself is checked by hand and recorded in the
# change's tests.md.
chooser() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  node "$BIN" capability new "Billing" --name billing >/dev/null
  node "$BIN" roadmap new "A plan" --name a-plan >/dev/null
}
# The rule's first bound: nothing reading input is a refusal, never a wait. Under a timeout,
# because the failure this change could introduce is a prompt in a pipeline, and a suite that
# hangs reports nothing at all.
check "nothing waits for input"            1 "no capability named" -- sh -c '
  '"$(declare -f chooser)"'; chooser
  ( node '"$BIN"' change new "A" --capability ghost & pid=$!; ( sleep 10; kill -9 $pid 2>/dev/null ) & wait $pid )'
check "and it names what could be chosen"  1 "billing" -- sh -c '
  '"$(declare -f chooser)"'; chooser
  node '"$BIN"' change new "A" --capability ghost'
check "the same for what it realises"      1 "a-plan" -- sh -c '
  '"$(declare -f chooser)"'; chooser
  node '"$BIN"' change new "A" --realises ghost'
# An optional value nobody was asked about is not an answer that was got wrong. Every scripted
# caller that never passed --capability keeps working, and the note is still what it gets.
check "an unasked question is not refused" 0 "nothing to publish into yet" -- sh -c '
  '"$(declare -f chooser)"'; chooser
  node '"$BIN"' change new "A"'
# The refusal fires before anything is written, so walking away leaves no half-made bundle.
check "and a refusal writes nothing"       0 "only the readme" -- sh -c '
  '"$(declare -f chooser)"'; chooser
  node '"$BIN"' change new "A" --capability ghost >/dev/null 2>&1
  ls docs/changes | grep -qv README.md && echo "a bundle was left" || echo "only the readme"'
# Never an empty menu: a list of nothing is a question with no answer, so the refusal names the
# command that writes the first one instead.
check "an empty set names the remedy"      1 "molly capability new" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "A" --capability ghost'
# And an empty roadmap is the ordinary starting state rather than a mistake, so creating a change
# in one is silent about it — there is nothing to offer and nothing missing.
refute "an empty roadmap is not remarked on" "roadmap" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "A" --capability ghost 2>&1 || true'
# Ask, or refuse with the list, is written once. A second copy is what review is looking for.
check "one implementation, not one per command" 0 "ok" -- sh -c '
  cd '"$ROOT"'
  count=$(grep -c "nothing is reading input" packages/cli/src/*.ts | grep -v ":0$" | wc -l)
  [ "$count" -eq 1 ] && echo ok || { grep -n "nothing is reading input" packages/cli/src/*.ts; exit 1; }'

printf '\n%s\n' "$(dim 'a roadmap is a slice of planned work')"

# The template is half of an agreement the tool cannot otherwise hold: it writes the shape and the
# molly-roadmap skill reads it, and nothing checks the two against each other. So the headings are
# asserted on the file — if they move, this is what says the skill has gone stale.
check "a slice is born in the shape"       0 "ok" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' roadmap new "Billing overhaul" >/dev/null
  missing=""
  for heading in "What this slice is for" "The features, in order" "What has been decided" "What is done"; do
    grep -qF "$heading" docs/roadmap/billing-overhaul.md || missing="$missing [$heading]"
  done
  [ -z "$missing" ] || { printf "%s\n" "$missing"; exit 1; }
  echo ok'
# A fifth skill that reached three roots of four is a failure rather than a surprise.
check "the skill reaches every root"       0 "ok" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents >/dev/null
  missing=""
  for root in $(find . -type d -name molly-corpus | sed "s|/molly-corpus$||"); do
    [ -d "$root/molly-roadmap" ] || missing="$missing [$root]"
  done
  [ -z "$missing" ] || { printf "%s\n" "$missing"; exit 1; }
  echo ok'
# And it says the thing it exists to say. A skill that loads and does not teach the ordering rule
# is the failure this change is a fix for, one level up.
check "and it says the order is prose"     0 "order:" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  cat .agents/skills/molly-roadmap/SKILL.md'
check "and that a slice crosses capabilities" 0 "crosses them" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  cat .agents/skills/molly-roadmap/SKILL.md'
# The drafting skill points at the plan rather than restating it — one more pointer of the kind
# the scaffold already makes, and never a copy.
check "the drafting skill points at it"    0 "molly-roadmap" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' agents --tools agents >/dev/null
  cat .agents/skills/molly-new/SKILL.md'
# Several changes realise one slice over its life, so the finding names them all. The
# single-change wording was a bug the moment a slice held more than one feature.
check "a slice names every change against it" 0 "changes/first, changes/second" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' capability new "Billing" --name billing >/dev/null
  node '"$BIN"' roadmap new "Overhaul" --name overhaul >/dev/null
  for name in first second; do
    node '"$BIN"' change new "$name" --name "$name" --capability billing --realises overhaul >/dev/null
    mkdir -p "docs/changes/$name/publish/specs/$name"
    printf -- "---\ntitle: $name\nlang: en\ncapability: billing\n---\n\nBody.\n" > "docs/changes/$name/publish/specs/$name/spec.md"
    node '"$BIN"' publish "$name" >/dev/null
  done
  node '"$BIN"' status'


printf '\n%s\n' "$(dim 'a new corpus can merge its own ledger')"

# The assertion that matters is a real merge. A pattern at the wrong path, or relative to the
# wrong directory, writes a .gitattributes that looks right and does nothing — which is the
# failure this exists to remove, one level up.
merged() {
  cd "$(mktemp -d)" || exit 2
  git init -q; git config user.email t@t; git config user.name t
  node "$BIN" "$@" >/dev/null 2>&1
  node "$BIN" change new "A" --name a >/dev/null 2>&1
  node "$BIN" change new "B" --name b >/dev/null 2>&1
  git add -A >/dev/null; git commit -qm base
  git checkout -qb fa; node "$BIN" move a review >/dev/null 2>&1; git commit -qam a
  git checkout -q -; git checkout -qb fb; node "$BIN" move b review >/dev/null 2>&1; git commit -qam b
  git checkout -q fa; git merge fb -m m >/dev/null 2>&1
}
check "two branches advancing merge clean" 0 "ok" -- sh -c '
  '"$(declare -f merged)"'; merged init
  grep -q "<<<<" docs/.mollyguard/history.jsonl && { echo "the ledger conflicted"; exit 1; }
  echo ok'
check "and both events survive"            0 "ok" -- sh -c '
  '"$(declare -f merged)"'; merged init
  grep -q "changes/a" docs/.mollyguard/history.jsonl &&
  grep -q "changes/b" docs/.mollyguard/history.jsonl && echo ok || echo "an event was lost"'
# A pattern relative to the repository root passes the first test and fails this one.
check "and it holds at another root"       0 "ok" -- sh -c '
  '"$(declare -f merged)"'; merged init --root kb
  grep -q "<<<<" kb/.mollyguard/history.jsonl && { echo "the ledger conflicted"; exit 1; }
  echo ok'
check "the file is the corpus's own"       0 ".mollyguard/history.jsonl merge=union" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init --root kb >/dev/null
  cat kb/.gitattributes'
refute "and nothing lands at the repository root" ".gitattributes" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  ls -a | grep gitattributes || true'
# Theirs the moment it exists. Reported, never repaired — the same posture --check takes.
check "one already there is left alone"    0 "# ours" -- sh -c '
  cd "$(mktemp -d)" && mkdir -p docs && printf "# ours\n" > docs/.gitattributes
  node '"$BIN"' init >/dev/null
  cat docs/.gitattributes'
check "and the missing line is named"      0 "merge=union" -- sh -c '
  cd "$(mktemp -d)" && mkdir -p docs && printf "# ours\n" > docs/.gitattributes
  node '"$BIN"' init'
check "and that is not a failure"          0 "corpus initialised" -- sh -c '
  cd "$(mktemp -d)" && mkdir -p docs && printf "# ours\n" > docs/.gitattributes
  node '"$BIN"' init'
# The correct case is not remarked on: a tool that reports success trains people to skim.
refute "the right one is not remarked on"  "merge=union" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init'
# Union is for the ledger and nothing else. A specification edited on two branches is a
# disagreement somebody has to resolve, and keeping both sides would be the wrong answer.
check "a document still conflicts"         0 "ok" -- sh -c '
  cd "$(mktemp -d)" || exit 2
  git init -q; git config user.email t@t; git config user.name t
  node '"$BIN"' init >/dev/null
  printf -- "---\ntitle: T\nlang: en\n---\n\nbase\n" > docs/capabilities/t.md
  git add -A >/dev/null; git commit -qm base
  git checkout -qb x; printf "x\n" >> docs/capabilities/t.md; git commit -qam x
  git checkout -q -; git checkout -qb y; printf "y\n" >> docs/capabilities/t.md; git commit -qam y
  git checkout -q x; git merge y -m m >/dev/null 2>&1
  grep -q "<<<<" docs/capabilities/t.md && echo ok || echo "union leaked past the ledger"'


printf '\n%s\n' "$(dim 'the ledger names a change that is gone')"

renamed_away() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  node "$BIN" change new "A" --name a >/dev/null
  mv docs/changes/a docs/changes/after
}
# One `mv` is two findings, and only one of them was reported before this. The other is the one
# that produces a *wrong* answer: the fold for `after` starts from nothing and says `draft`.
check "a renamed bundle is still reported"  0 "the ledger has no record of: after" -- sh -c '
  '"$(declare -f renamed_away)"'; renamed_away
  node '"$BIN"' status'
check "and the events left behind are too"  0 "has events for changes/a, which has no bundle" -- sh -c '
  '"$(declare -f renamed_away)"'; renamed_away
  node '"$BIN"' status'
check "and they read as one problem"        0 "renamed by hand" -- sh -c '
  '"$(declare -f renamed_away)"'; renamed_away
  node '"$BIN"' status'
# Reported, never failed. A corpus somebody reorganised by hand is not broken — its record and its
# directories disagree — and failing would make silencing the tool the first thing anybody does.
check "and the corpus stays clean"          0 '"ok": true' -- sh -c '
  '"$(declare -f renamed_away)"'; renamed_away
  node '"$BIN"' status --json'
# `move` is where a wrong state does damage, so it says so before acting — and still acts.
check "move says so before acting"          0 "which has no bundle" -- sh -c '
  '"$(declare -f renamed_away)"'; renamed_away
  node '"$BIN"' move after review'
check "and performs the move anyway"        0 "draft → review" -- sh -c '
  '"$(declare -f renamed_away)"'; renamed_away
  node '"$BIN"' move after review'
# Independent findings. A rendering that assumes they arrive together would pass a test that only
# ever produced them together.
check "a deleted change orphans on its own" 0 "which has no bundle" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "A" --name a >/dev/null
  rm -rf docs/changes/a
  node '"$BIN"' status'
refute "and reports no missing record"      "the ledger has no record of" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "A" --name a >/dev/null
  rm -rf docs/changes/a
  node '"$BIN"' status'
# The way this gets written wrongly: a published change keeps its events under `changes/<name>`
# while its bundle moves to `history/<name>`, so a check that only scans what is in flight reports
# every correct publication as an orphan.
refute "a published change is not an orphan" "which has no bundle" -- sh -c '
  '"$(declare -f planned)"'; planned
  node '"$BIN"' publish archive >/dev/null
  node '"$BIN"' status'
refute "and move does not say so either"    "which has no bundle" -- sh -c '
  '"$(declare -f planned)"'; planned
  node '"$BIN"' publish archive >/dev/null
  node '"$BIN"' change new "B" --name b >/dev/null
  node '"$BIN"' move b review'
refute "an empty ledger orphans nothing"    "which has no bundle" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' status'
# The repair that must never exist is one line from the check that must.
check "and the check writes nothing"        0 "ok" -- sh -c '
  '"$(declare -f renamed_away)"'; renamed_away
  before=$(md5 -q docs/.mollyguard/history.jsonl 2>/dev/null || md5sum docs/.mollyguard/history.jsonl)
  node '"$BIN"' status >/dev/null
  after=$(md5 -q docs/.mollyguard/history.jsonl 2>/dev/null || md5sum docs/.mollyguard/history.jsonl)
  [ "$before" = "$after" ] && echo ok || echo "status rewrote the ledger"'


printf '\n%s\n' "$(dim 'the knowledge base is read back')"

# The fixture is the adopter path, because that is where the gap was found: init, a capability,
# a change, publish — then ask the tool what is true.
based() {
  cd "$(mktemp -d)" || exit 2
  node "$BIN" init >/dev/null
  node "$BIN" capability new "Billing" --name billing >/dev/null
  node "$BIN" change new "One" --name one --capability billing >/dev/null
  mkdir -p docs/changes/one/publish/specs/invoices
  printf -- '---\ntitle: Invoices\nlang: en\ncapability: billing\n---\n\nBody.\n' \
    > docs/changes/one/publish/specs/invoices/spec.md
  node "$BIN" publish one >/dev/null
}
check "a published specification is named"  0 "invoices" -- sh -c '
  '"$(declare -f based)"'; based
  node '"$BIN"' status'
check "under the capability it declares"    0 "the knowledge base" -- sh -c '
  '"$(declare -f based)"'; based
  node '"$BIN"' status'
# The measurement that started this change: `status --json` contained the string `specs` zero
# times in a corpus with a published specification in it.
check "and a reader that is not a person"   0 '"area": "specs"' -- sh -c '
  '"$(declare -f based)"'; based
  node '"$BIN"' status --json'
check "a decision is listed too"            0 "in force" -- sh -c '
  '"$(declare -f based)"'; based
  printf -- "---\ntitle: A rule\nlang: en\n---\n\nBody.\n" > docs/decisions/a-rule.md
  node '"$BIN"' status'
# The area is not read by slice, so a rendering that grouped one would invent a rule the corpus
# has not got.
refute "and carries no capability"          '"capability"' -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  printf -- "---\ntitle: A rule\nlang: en\ncapability: ghost\n---\n\nBody.\n" > docs/decisions/a-rule.md
  node '"$BIN"' status --json'
# A heading over nothing reads as a broken query.
refute "an empty base says nothing"         "the knowledge base" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' status'

# The check that was aimed at half the corpus, and the half it could not see is the permanent one.
check "a published spec filed nowhere fails" 1 "specs/invoices is filed under billing" -- sh -c '
  '"$(declare -f based)"'; based
  rm docs/capabilities/billing.md
  node '"$BIN"' status'

# Accepted at creation, survived publication, never mentioned — for every version until now.
check "a misspelled alters is reported"     0 "alters specs/invoces" -- sh -c '
  '"$(declare -f based)"'; based
  node '"$BIN"' change new "Two" --name two --alters specs/invoces >/dev/null
  node '"$BIN"' status'
# It must not fail: the document may be arriving in this very change.
check "and does not fail the corpus"        0 '"ok": true' -- sh -c '
  '"$(declare -f based)"'; based
  node '"$BIN"' change new "Two" --name two --alters specs/invoces >/dev/null
  node '"$BIN"' status --json'
refute "one that resolves is not remarked on" "alters specs/invoices, which is not" -- sh -c '
  '"$(declare -f based)"'; based
  node '"$BIN"' change new "Two" --name two --alters specs/invoices >/dev/null
  node '"$BIN"' status'
# The finished shape of the link, exactly as with --realises.
refute "an archived change is not asked"    "alters specs/invoces" -- sh -c '
  '"$(declare -f based)"'; based
  node '"$BIN"' change new "Two" --name two --capability billing --alters specs/invoces >/dev/null
  mkdir -p docs/changes/two/publish/specs/two
  printf -- "---\ntitle: Two\nlang: en\ncapability: billing\n---\n\nBody.\n" > docs/changes/two/publish/specs/two/spec.md
  node '"$BIN"' publish two >/dev/null
  node '"$BIN"' status'

# A listing that drops what it could not read vouches for a corpus it has not seen.
check "a broken record is reported"         0 "specs/invoices" -- sh -c '
  '"$(declare -f based)"'; based
  printf -- "---\ntitle: [unclosed\n---\n\nBody.\n" > docs/specs/invoices/spec.md
  node '"$BIN"' status'
check "and its neighbours still appear"     0 "ok" -- sh -c '
  '"$(declare -f based)"'; based
  mkdir -p docs/specs/other && printf -- "---\ntitle: Other\nlang: en\ncapability: billing\n---\n\nB.\n" > docs/specs/other/spec.md
  printf -- "---\ntitle: [unclosed\n---\n\nBody.\n" > docs/specs/invoices/spec.md
  node '"$BIN"' status | grep -q "other" && echo ok || echo "a neighbour was dropped"'
# Present and readable by a person; only the record is broken.
check "and that does not fail"              0 '"ok": true' -- sh -c '
  '"$(declare -f based)"'; based
  printf -- "---\ntitle: [unclosed\n---\n\nBody.\n" > docs/specs/invoices/spec.md
  node '"$BIN"' status --json'
# A stray file in specs/ is a specification nothing will ever read.
check "a file where folders belong is named" 0 "holds folders" -- sh -c '
  '"$(declare -f based)"'; based
  printf "loose\n" > docs/specs/loose.md
  node '"$BIN"' status'

# The refusal at the write fires at the last recoverable moment and is not replaced by a report.
check "publish still refuses at the write"  1 "would be filed under no capability" -- sh -c '
  cd "$(mktemp -d)" && node '"$BIN"' init >/dev/null
  node '"$BIN"' change new "One" --name one >/dev/null
  mkdir -p docs/changes/one/publish/specs/x
  printf -- "---\ntitle: X\nlang: en\n---\n\nB.\n" > docs/changes/one/publish/specs/x/spec.md
  node '"$BIN"' publish one'


printf '\n'
if [[ $FAIL -eq 0 ]]; then
  printf '%s %s\n' "$(green '✓')" "$PASS assertion(s) passed"
  exit 0
fi
printf '%s %s\n' "$(red '✗')" "$FAIL of $((PASS + FAIL)) assertion(s) failed"
exit 1
