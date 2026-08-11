# .mollyguard/

The audit trail. Written by the tool, read by the tool.

`history.jsonl` is every lifecycle event, appended and never rewritten. A change's state is
folded from it rather than stored, which is what lets a change advance without its content
moving — an approval pinned to text that changed on every transition would expire on the
very next step.

Commit it. It is what makes an approval reconstructable months later.

**Never edit it by hand.** It is the record of what happened; editing it is how that record
starts to disagree with what happened, and nothing downstream can tell.
