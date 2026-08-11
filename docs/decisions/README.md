# decisions/

Constraints that outlive any one change.

One file per decision: a rule later work has to respect. Not a description of how something is
built — that is a specification's `architecture.md`.

They are not written here by hand. A design in `changes/<name>/plan.md` marks the part of
itself that is a standing constraint, and whoever prepares the change writes that constraint as
a document in `changes/<name>/publish/decisions/`, which `molly publish` files here.

Filed at publication rather than at approval, because until a change is verified its design is
a proposal, and recording it as binding earlier would hold later work to something that might
be reverted.

A decision is in force, or superseded by a change that says so.
