/**
 * What an agent is told, and where each tool reads it.
 *
 * Data, like the READMEs, so the whole feature is a pure function returning file contents. Its
 * failure mode is a skill that says something no longer true, and a check that had to install
 * files before it could read them would be a check nobody runs.
 *
 * **Two surfaces, one text.** A *skill* is what a model loads when it decides the work is ours,
 * and it is one file everywhere: the [Agent Skills](https://agentskills.io) format — a directory
 * holding a `SKILL.md` whose frontmatter is a `name` and a `description` — is the reason this
 * works on every major tool rather than on one. A *command* is what a person types, and its shape
 * is the vendor's: `/molly:new` where a directory becomes a namespace, `/molly-new` where the
 * filename is the whole name. Both carry the same body from the same table, so the second surface
 * is a path and a wrapper rather than a second text that can disagree with the first.
 *
 * Neither surface substitutes for the other. A skill is loaded by a model that has decided on its
 * own that a request is ours, which is the case somebody who has never read this README is in; a
 * command is how somebody who knows exactly what they want asks for it without describing it.
 * Shipping one and calling it coverage loses whichever half of that the project did not imagine.
 *
 * **Nothing here is corpus-derived.** No decision, no capability, no language tag — a skill says
 * *where* those live and never what they say. A copy would be a second answer to a question the
 * corpus already answers, stale the moment it changes and stale silently, which is the failure
 * this product exists to prevent arriving through the tooling instead of the documents. It is
 * also what makes this an upgrade-time command: nothing goes stale when a change is published,
 * so there is nothing for anybody to remember.
 */

/**
 * The one word that is ours.
 *
 * It prefixes the skill (`molly-new`) and namespaces the command (`/molly:new`), which is what
 * makes an uninstall a directory nobody else writes into and a name collision something that
 * cannot happen. It is also the command somebody already types, so there is nothing to learn.
 */
export const NAMESPACE = 'molly';

export interface Skill {
  /**
   * The last segment of every name this carries: the skill `molly-<id>`, the command `molly:<id>`
   * or `molly-<id>`. One field because two would eventually disagree, and the disagreement would
   * be a command whose documentation names a skill that is not the one it runs.
   */
  readonly id: string;
  /** How a model decides to load it. Loaded at startup for every skill, so it is one line. */
  readonly description: string;
  /**
   * The same thing said to a person. A description is written for a model that has to decide
   * whether an unrelated request is ours, so it ends in the conditions under which to load it —
   * which is the wrong half of the sentence in a palette, where somebody has already chosen and
   * is reading the list to find the one they meant.
   */
  readonly summary: string;
  /** The body, loaded only once the skill is chosen — or pasted whole, when a command is typed. */
  readonly body: string;
}

/** Directory name, and the `name` in the frontmatter — the spec requires they agree. */
export function skillName(skill: Skill): string {
  return `${NAMESPACE}-${skill.id}`;
}

/**
 * One line every skill needs and none may assume.
 *
 * A corpus made with `--root kb` is not at `docs/`, and a skill that hardcoded the default would
 * describe every path in it wrongly. Repeated in each skill rather than referenced, because only
 * one of them may be loaded and a skill that depends on another being open is a skill that is
 * sometimes wrong.
 */
const CORPUS = `\`mollyguard.yml\` sits at the top of the repository and names the corpus directory —
\`docs/\` unless it says otherwise, and is found from anywhere inside. Paths below assume that.`;

/**
 * The skills, and they are short on purpose.
 *
 * They do not restate `molly help`; they say to run it. They do not list the states; the flow
 * shows them once. What they spend words on is the small set of things a capable model gets
 * wrong here *because another tool taught it otherwise* — that a document is replaced whole,
 * that the engine composes no text, and that the terminal state is reached by publishing.
 */
export const SKILLS: readonly Skill[] = [
  {
    id: 'corpus',
    description:
      'How a MollyGuard corpus works - where accumulated truth lives, what may never be edited by hand, and how a document enters it. Use when the repository has a mollyguard.yml and any specification, decision or change is being read or written.',
    summary: 'How this corpus works - where truth lives and what may never be edited by hand',
    body: `# MollyGuard

${CORPUS}

\`docs/specs/\` and \`docs/decisions/\` are the knowledge base: what the product is currently
believed to be. **Nothing enters it except by publishing a change.** Never edit them directly.

\`molly help\` lists the commands. Exit codes: \`0\` clean, \`1\` a refusal, \`2\` a defect in the tool.

## Read before writing

1. \`molly status\` — what is in flight, the capabilities that exist, and what is already
   intended in \`docs/roadmap/\`.
2. Every file in \`docs/decisions/\` — each is a constraint your work must respect.
3. \`docs/conventions.md\`, if it is there — this project's own rules for writing in this corpus.
   The rest of this skill is how MollyGuard works; that file is how *this* repository uses it,
   and where the two differ it wins.
4. \`lang:\` in \`mollyguard.yml\` — write all document prose in that language.

## The flow

\`\`\`
molly change new "<title>" --capability <name> [--alters specs/<name>]
    then fill in docs/changes/<name>/{change,plan,tasks,tests}.md

molly move <change> <state>     draft → review → approved → in_progress
                                → implemented → verified → deployed

    then write docs/changes/<name>/publish/, mirroring the corpus:
    publish/specs/<name>/spec.md becomes docs/specs/<name>/spec.md

molly publish <change> [--dry-run]
\`\`\`

## What you will otherwise get wrong

- **The engine composes no text.** You write every document; \`molly publish\` verifies and files
  it. A publication where nothing differs from the knowledge base is refused.
- **A document is replaced whole.** There is no delta format — no \`## ADDED Requirements\`, no
  patch, no merge of two texts. To change a specification, write the new version of it entire.
- **\`publish/\` mirrors the corpus**, and the path is the whole instruction. A new specification
  must carry its \`spec.md\`; a decision is one file at \`publish/decisions/<name>.md\`.
- **A decision is rare**, and is a live constraint rather than a record — only a rule a check
  enforces and that binds work not yet done. History is \`history/\` and the ledger, so a decision
  doing no work is deleted rather than kept.
- **Never** edit \`docs/.mollyguard/history.jsonl\`, and never hand-write \`state:\` — \`molly move\`
  writes it, and a document disagreeing with the ledger is refused.
- **One claim per change.** A second claim is a second change.
- \`published\` is reached only by \`molly publish\`, never by \`molly move\`.
`,
  },
  {
    id: 'new',
    description:
      'Draft a MollyGuard change - the four documents one unit of intent is made of. Use when asked to propose, specify or plan something in a repository with a mollyguard.yml.',
    summary: 'Draft a change - the four documents one unit of intent is made of',
    body: `# Draft a change

${CORPUS}

1. \`molly status\` for the capabilities and what \`docs/roadmap/\` already intends —
   contradicting a slice there is an argument somebody has later. Read \`docs/decisions/\`, and
   \`docs/conventions.md\` if it is there: that is how *this* repository writes, and it wins.
2. **If the work is in a roadmap slice, read it first** — the \`molly-roadmap\` skill acts on one.
3. \`molly change new "<title>" --capability <name>\`, with \`--alters specs/<name>\` per document
   it changes and \`--realises <slice>\` where a slice already intends it.
4. Fill in all four documents. \`change.md\` states one claim and why; \`plan.md\` how it will be
   built; \`tasks.md\` the work in order; \`tests.md\` what would have to be observed for the
   claim to be believed.
5. Write in the corpus's language, from \`lang:\` in \`mollyguard.yml\`.
6. **Never guess at what the documents do not answer.** Write the unknown into \`change.md\` under
   its own heading and stop — locally, ask; unattended, exit non-zero. Nothing in the tool refuses
   a change for holding one, and nothing needs to: an unresolved change is one nobody approves.

One claim per change; a second claim is a second change.

Mark a standing constraint in \`plan.md\` only where a check enforces it and it binds work not yet
done. Most changes leave none, and saying so is the answer — restating the design is not a
constraint, and a marker is a proposal whoever reviews may drop. Report the change's name and
what is still empty. Do not move it — that is the next step.
`,
  },
  {
    id: 'advance',
    description:
      'Move a MollyGuard change to its next state. Use when asked to approve, start, implement, verify, deploy or otherwise advance a change in a repository with a mollyguard.yml.',
    summary: 'Move a change to its next state - approve, start, implement, verify, deploy',
    body: `# Advance a change

${CORPUS}

1. \`molly status\` to see where it is, and whether anything disagrees with the ledger.
2. \`molly move <change> <state>\`, choosing the next state in the sequence unless told otherwise:

\`\`\`
draft → review → approved → in_progress → implemented → verified → deployed
\`\`\`

Backwards is allowed and is how work reopens. Never hand-write \`state:\` in a document — the
command writes it, and a document disagreeing with the ledger is refused.

The terminal state is not reachable this way. When the work is done and the documents are
written, publish instead.
`,
  },
  {
    id: 'publish',
    description:
      "Write what a MollyGuard change puts into the knowledge base, then publish it. Use when a change's work is done and its specifications or decisions should enter the knowledge base.",
    summary: 'Write what a change puts into the knowledge base, then publish it',
    body: `# Publish a change

${CORPUS}

1. Read the change's four documents, and the knowledge-base documents it alters.
2. Write \`docs/changes/<change>/publish/\`, mirroring the corpus. Each file is the **whole** new
   version of the document at that path — never a delta, never an append. A new specification
   carries its \`spec.md\`, and its \`architecture.md\` where the design is worth keeping.
3. **A decision is rare.** Write \`publish/decisions/<name>.md\` only for a rule a check enforces
   and that binds work not yet done; a rule the specification already states belongs there, not
   in a second document. It records no history — the archived change does — so whoever reviews
   the diff may delete one that is not doing work, and nothing is lost.
4. \`molly publish <change> --dry-run\`, then without it once the plan reads correctly.

The engine composes no text: you write every document and it verifies and files them. Everything
it writes is in the working tree and nothing is committed. Report what landed so it can be
reviewed as a diff.
`,
  },
  {
    id: 'roadmap',
    description:
      'Read a MollyGuard roadmap slice and turn what is next in it into a change. Use when asked what to build next, to plan or prioritise work, to draft the next change, or to add something to the plan, in a repository with a mollyguard.yml.',
    summary: 'Read the plan and turn what is next in it into a change',
    body: `# Read the plan

${CORPUS}

\`docs/roadmap/\` holds **slices**: one document per body of planned work — what it is for, its
features **in the order they are wanted**, what has been decided, and what is done.

**None of it is parsed.** The order is an argument in prose and you are the reader it was written
for; there is no \`order:\` field to sort on. A slice names no capability — it crosses them.

1. \`molly status\` — the slices, and every change with its state.
2. Read the whole slice. The order is stated in it and derivable from nothing else.
3. The next feature is the first one not under *what is done* and not already claimed by a change
   in flight. A change already drafted is the usual reason the next thing is not the first thing.
4. \`molly change new "<title>" --capability <name> --realises <slice>\`, then the drafting skill.

**The title comes from the feature, not the slice** — one named after a body of work makes several
claims. Several changes realise one slice over its life, and \`molly status\` reports that rather
than treating the slice as finished. Never invent a feature the slice does not name: say so, and
offer to add it. Never reorder or reprioritise unasked — the order is somebody's judgement. Never
mark a feature done that has not published.

No change alters a slice, so keeping it true is a direct edit: move a realised feature under
*what is done* and name the change that did it. \`molly roadmap new "<title>"\` starts one.
`,
  },
];

/**
 * Where a tool reads command files, and therefore what a person types to run one.
 *
 * The name is not declared anywhere; it is read off the path, which is why this is three fields
 * and not four. A tool that turns a subdirectory into a prefix registers `molly:new` from
 * `commands/molly/new.md`; one that does not registers whatever the filename says, so the prefix
 * has to be in the filename — `commands/molly-new.md`. Getting that backwards writes files a
 * palette never lists, and nothing about the install looks wrong when it happens.
 */
export interface Commands {
  /** The directory the tool reads, relative to the repository root. */
  readonly dir: string;
  /** `namespaced` nests under `molly/` for a `/molly:new`; `flat` spells it `/molly-new`. */
  readonly style: 'namespaced' | 'flat';
  /** What the tool requires the file to end with. */
  readonly extension: string;
  /** Frontmatter and a markdown body, unless the tool wants a TOML table instead. */
  readonly shape?: 'toml';
}

/** Where a tool reads project skills. Paths repeat across rows; the files are written once. */
export interface Tool {
  readonly id: string;
  readonly title: string;
  /** Project skills directory, relative to the repository root. */
  readonly skills: string;
  /** Where it reads typed commands, when it reads them at all. */
  readonly commands?: Commands;
  /**
   * Whether skills and commands land in one namespace, so a tool given both lists everything
   * twice. Claude Code does: a file under `commands/` *is* a skill there, which is why the two
   * surfaces have to be told apart by frontmatter rather than by which directory they are in.
   * Every other tool keeps them separate — its skills were never in a menu to be doubled.
   */
  readonly merges?: boolean;
  /** A settings file to pre-authorise the commands in. Merged, never overwritten. */
  readonly settings?: string;
  /** Installed when no `--tools` is given. */
  readonly byDefault?: boolean;
}

/**
 * Where each tool reads, taken from that tool's own documentation, 2026-08-11.
 *
 * `.agents/skills/` is the convergence, and most of the table sits on it. The rest read
 * somewhere else and would find nothing there: Claude Code reads only its own directory, Cline
 * reads Claude Code's and not the shared root, and Junie and Kiro each read one of their own.
 * Four directories is therefore the coverage rather than the ambition.
 *
 * A tool has its own row even where the path repeats, because "does this work with Cursor" is
 * the question people ask and the answer should be a row rather than a paragraph. A row is also
 * a claim about somebody else's software: it goes in when their documentation says so, and not
 * on the strength of a comparison table, which is how a directory nobody reads gets written.
 * Kilo Code documents the shared root and has an open report that it does not load from it, so
 * it has no row — a contradicted claim does not meet the standard either.
 *
 * A `commands` entry is the same claim about a second directory, and most rows do not have one.
 * Seven tools document a project command directory; the rest are reached by their skills alone,
 * which is the surface a model uses anyway. Two of the seven read a subdirectory as a namespace
 * and get `/molly:new`; five name the command with the filename and get `/molly-new`. Nobody
 * should have to know which is which, so the install prints what it just made typable.
 */
export const TOOLS: readonly Tool[] = [
  { id: 'agents', title: 'the shared root', skills: '.agents/skills', byDefault: true },
  {
    id: 'claude',
    title: 'Claude Code',
    skills: '.claude/skills',
    commands: { dir: '.claude/commands', style: 'namespaced', extension: '.md' },
    merges: true,
    settings: '.claude/settings.json',
    byDefault: true,
  },
  { id: 'codex', title: 'OpenAI Codex', skills: '.agents/skills' },
  {
    id: 'cursor',
    title: 'Cursor',
    skills: '.agents/skills',
    commands: { dir: '.cursor/commands', style: 'flat', extension: '.md' },
  },
  {
    id: 'copilot',
    title: 'GitHub Copilot',
    skills: '.agents/skills',
    commands: { dir: '.github/prompts', style: 'flat', extension: '.prompt.md' },
  },
  {
    id: 'gemini',
    title: 'Gemini CLI',
    skills: '.agents/skills',
    commands: { dir: '.gemini/commands', style: 'namespaced', extension: '.toml', shape: 'toml' },
  },
  { id: 'antigravity', title: 'Antigravity', skills: '.agents/skills' },
  { id: 'windsurf', title: 'Windsurf', skills: '.agents/skills' },
  { id: 'amp', title: 'Amp', skills: '.agents/skills' },
  { id: 'zed', title: 'Zed', skills: '.agents/skills' },
  {
    id: 'opencode',
    title: 'OpenCode',
    skills: '.agents/skills',
    commands: { dir: '.opencode/commands', style: 'flat', extension: '.md' },
  },
  { id: 'goose', title: 'Goose', skills: '.agents/skills' },
  { id: 'roo', title: 'Roo Code', skills: '.agents/skills' },
  { id: 'openhands', title: 'OpenHands', skills: '.agents/skills' },
  { id: 'cline', title: 'Cline', skills: '.claude/skills' },
  // Defaults, and the reason is the check rather than the install. A directory installed only
  // when named is a directory `--check` never looks at, so it keeps whatever an old version
  // wrote — a skill describing a command that has moved on, which is what the check exists to
  // catch. Junie ships in every JetBrains IDE and Kiro is the same shape; both have an open
  // request to read the shared root, and an open request is not a location.
  {
    id: 'junie',
    title: 'Junie',
    skills: '.junie/skills',
    commands: { dir: '.junie/commands', style: 'flat', extension: '.md' },
    byDefault: true,
  },
  {
    id: 'kiro',
    title: 'Kiro',
    skills: '.kiro/skills',
    commands: { dir: '.kiro/prompts', style: 'flat', extension: '.prompt.md' },
    byDefault: true,
  },
];

export function tool(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

/** The tools installed for when nobody names any. */
export function defaultTools(): readonly Tool[] {
  return TOOLS.filter((t) => t.byDefault === true);
}

/** Every tool that reads a directory, so the writer can say who it just served. */
export function readers(skills: string): readonly Tool[] {
  return TOOLS.filter((t) => t.skills === skills && t.id !== 'agents');
}

export interface ScaffoldFile {
  /** Relative to the repository root, POSIX-separated. */
  readonly path: string;
  readonly text: string;
}

/**
 * A `SKILL.md`, frontmatter first. Two fields, which is every field the spec requires and every
 * field all of its implementations read.
 *
 * `merged` adds a third, for the one tool that would otherwise list this in the same menu as its
 * command: `user-invocable: false` takes it out of the `/` menu and leaves everything else about
 * it alone — the description stays in the model's context, which is the half of a skill that
 * matters here. Written only into that tool's copy. Every other implementation of the spec would
 * see a key it does not know, and this file does not spend a claim about how sixteen of them
 * treat an unknown key when it can spend nothing instead.
 */
export function skillFile(skill: Skill, merged = false): string {
  const hidden = merged ? '\nuser-invocable: false' : '';
  return `---\nname: ${skillName(skill)}\ndescription: ${skill.description}${hidden}\n---\n\n${skill.body}`;
}

/** The file a tool reads a command out of. `commands/molly/new.md`, or `commands/molly-new.md`. */
export function commandPath(commands: Commands, skill: Skill): string {
  const leaf = commands.style === 'namespaced' ? `${NAMESPACE}/${skill.id}` : `${NAMESPACE}-${skill.id}`;
  return `${commands.dir}/${leaf}${commands.extension}`;
}

/**
 * The command file. The same body as the skill, in the shape the tool parses.
 *
 * `description` and nothing else, because it is the only field all seven agree on and a field one
 * of them rejects is a command that silently does not load. It carries the `summary` rather than
 * the skill's `description`, which is the same sentence written for the other reader. Notably
 * absent is `allowed-tools`: permissions go in the settings file, for the reason at `PERMISSIONS`.
 *
 * TOML takes the body as a literal string — `'''`, never `"""` — so that backslashes, quotes and
 * backticks in a body written for markdown arrive unescaped rather than reinterpreted.
 *
 * `merged` is the other half of the pair: where a command is also a skill, this one says it is
 * only ever typed. Without it the model reads eight descriptions of four things, and the four it
 * would be reading here are the summaries — the version with the routing half taken out.
 */
export function commandFile(commands: Commands, skill: Skill, merged = false): string {
  if (commands.shape === 'toml') {
    return `description = "${skill.summary.replace(/"/g, '\\"')}"\nprompt = '''\n${skill.body}'''\n`;
  }
  const typed = merged ? '\ndisable-model-invocation: true' : '';
  return `---\ndescription: ${skill.summary}${typed}\n---\n\n${skill.body}`;
}

/**
 * What a person types. `/molly:new` where the directory namespaced it, `/molly-new` where it did
 * not — read off the same two fields that decided the path, so the two cannot disagree.
 */
export function invocation(commands: Commands, skill: Skill): string {
  return `/${NAMESPACE}${commands.style === 'namespaced' ? ':' : '-'}${skill.id}`;
}

/**
 * Every file the named tools want, and exactly what belongs in each.
 *
 * Deduplicated by path: naming Cursor and Codex asks for one directory twice, and a writer that
 * reported the same file twice would be a writer whose count means nothing.
 *
 * Settings are not here: that file belongs to the project rather than to this tool, so it is
 * merged rather than composed, and merging needs to read what is already there.
 */
export function scaffoldFor(tools: readonly Tool[]): readonly ScaffoldFile[] {
  const files: ScaffoldFile[] = [];
  const seen = new Set<string>();

  for (const t of tools) {
    for (const skill of SKILLS) {
      const path = `${t.skills}/${skillName(skill)}/SKILL.md`;
      if (seen.has(path)) continue;
      seen.add(path);
      files.push({ path, text: skillFile(skill, t.merges === true) });
    }
    if (t.commands === undefined) continue;
    for (const skill of SKILLS) {
      const path = commandPath(t.commands, skill);
      if (seen.has(path)) continue;
      seen.add(path);
      files.push({ path, text: commandFile(t.commands, skill, t.merges === true) });
    }
  }

  return files;
}

/**
 * What a session should not be interrupted to be asked.
 *
 * An agent that must ask before every `molly status` spends the session asking, and somebody who
 * has approved the same command nine times approves the tenth without reading it — which is
 * worse than never asking. Every one of these is a local write in a git working tree, the
 * refusals are the safety net, and the diff is the review.
 *
 * Claude Code only, because its project settings file is the one whose location and shape are
 * documented. The spec's `allowed-tools` would carry a grant into every tool, and is not used:
 * it is a space-separated string, `Bash(npx molly:*)` contains a space, and a permission that
 * parses into two halves is worse than one that was never claimed.
 */
export const PERMISSIONS: readonly string[] = ['Bash(molly:*)', 'Bash(npx molly:*)'];
