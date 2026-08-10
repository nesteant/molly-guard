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
printf '\nthe tool\n'
check "it answers which build it is"      0 "0.0.1"    -- m --version
check "without needing a corpus"          0 "0.0.1"    -- m version
check "help lists what there is"          0 "molly init" -- m help
check "an unknown command is a refusal"   1 "unknown command" -- m nonsense

# ------------------------------------------------------------------------------- init
printf '\ninit\n'
check "it scaffolds a corpus"             0 "corpus initialised" -- m init
check "it refuses to overwrite one"       1 "already exists"     -- m init

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

check "the config marks the root"         0 "lang: en"        -- cat docs/mollyguard.yml
check "a language can be chosen"          0 "lang: uk"        -- sh -c '
  node '"$BIN"' init --root docs-uk --lang uk >/dev/null && cat docs-uk/mollyguard.yml'

# It seeds nothing. An example is produced by running the flow — the only way to get one
# whose history is not a fiction.
refute "it seeds no example specification"  "invoice"   -- sh -c 'ls -R docs'
check "specs/ holds only its README"      0 "1"               -- sh -c 'ls docs/specs | wc -l | tr -d " "'

# ------------------------------------------------------------------------------- purity
printf '\nthe core stays pure\n'
# A verdict that cannot be reproduced is a claim rather than a check. Core is handed values
# and returns values, so the same code decides the same way behind a terminal, in a server,
# and in a test — which stops being true the moment it reads a file or a clock.
check "core imports no filesystem, no clock" 1 "" -- grep -rlE "from 'node:|require\('node:|Date\.now|new Date" "$ROOT/packages/core/src"

printf '\n'
if [[ $FAIL -eq 0 ]]; then
  printf '%s %s\n' "$(green '✓')" "$PASS assertion(s) passed"
  exit 0
fi
printf '%s %s\n' "$(red '✗')" "$FAIL of $((PASS + FAIL)) assertion(s) failed"
exit 1
