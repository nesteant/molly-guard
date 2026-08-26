---
title: A document the tool opens says who it is for
lang: en
kind: feature
state: published
alters:
  - specs/creating-a-change
  - specs/agent-instructions
---

# What this change makes true

Every document MollyGuard opens for somebody to fill in names the reader it is written for, and
that reader is what settles where a sentence goes. `change.md` is written for somebody deciding
whether the work should happen at all; `plan.md` for whoever will build it; `tasks.md` for whoever
picks it up part-done; `tests.md` for whoever has to believe the claim afterwards. A sentence that
fails its document's reader is not deleted — it moves to the document whose reader would need it.

Three further rules travel with it, and they are one rule applied three times: **a rule is stated
as a destination, on the surface where it is broken.** A change carries what it cannot answer under
a heading of its own, so an unresolved change is unresolved on its face and an answer has somewhere
to land. A change revised later is rewritten to say what is in force now, because two accounts of
one decision leave a reviewer nothing to choose between. And correcting filed truth is copying the
document into `publish/` at the same path and editing the copy — an instruction that ends in an
action, where *never edit these* ends in a refusal the reader has to find their own way out of.

# Why

The four documents are partitioned by **subject** today: what and why here, how there. A subject is
something a writer classifies, and classifying one's own prose is the judgement that people and
agents make differently every time. *Why* is the worst case, because it is absorptive: every
architectural argument can be phrased as a reason, truthfully, and then it satisfies the stated
criterion exactly. So construction detail arrives in `change.md` in the form of an honest answer to
the question the document asks.

A reader does not have that property. *Would this reader need it* has an answer, and the answer
does not depend on how the sentence is phrased.

The evidence is a corpus that adopted this tool and wrote down what went wrong in it. Seven
proposals came back, six of them asking for a check, and the useful reading of them is that every
one describes a placement decision made under uncertainty by somebody who had read the rule: an
answer that stayed in a chat window, a correction appended beside the sentence it contradicted, a
filed specification edited because the correction was two lines and publishing was four documents,
frontmatter invented because the neighbours disagreed. A rule that is broken by the reader who has
just read it is not a rule that was missing. It is a rule that could not be applied without a
judgement, offered at the moment the judgement was hardest to make.

What it costs to do it this way is that the tool says more than it did about documents it will
never read. That is the line worth watching, and it is not crossed here: naming a reader is not
naming a form. Nothing gains a keyword, a required section a command checks, or an
acceptance-criteria shape — the engine still parses no body, and a corpus that wants Given/When/Then
still installs a slice that supplies it.

The alternative is what the proposals asked for, which is validation: compare a document with its
neighbours, with an archived copy of itself, with its own earlier revision. Each is a check that
fires after the writing is done, in a session that has usually ended, about a document nobody is
looking at any more. The moment a placement rule can be applied is the moment somebody is placing
something, and the only text present then is the document they are writing in.

# What is not settled

Nothing. The one question this raised — whether naming a reader is the first step toward the tool
having an opinion about the form of a document — is answered in *Why* rather than left open, and the
answer is written into the specification so the next scaffold change meets it.
