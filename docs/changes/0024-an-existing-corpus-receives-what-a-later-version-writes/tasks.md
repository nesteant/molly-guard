# The work, in order

1. Narrow the refusal in `init.ts`: refuse writing a second `mollyguard.yml`, and let the run
   continue. Nothing else changes yet, so the diff is the condition and the message.
2. The summary tells the two runs apart — created, versus added-and-kept.
3. `status` compares what `init` writes against what is present and reports what is absent,
   non-failing, with `molly init` as the remedy.
4. The harness: a corpus with `.gitattributes` removed gains it; every existing file survives
   byte-identical and is named; the config and the ledger are untouched; a second run changes
   nothing; `status` reports the gap before and not after.
5. `specs/finding-the-corpus` rewritten whole — the second-`init` rule becomes a rule about the
   configuration rather than about the command.
