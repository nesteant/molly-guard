/**
 * The frontmatter block, written.
 *
 * Serialising is core's job because the shape of a record is core's business. *Parsing* is
 * not here — it needs a YAML reader, which is I/O-shaped dependency the engine does without.
 *
 * Deliberately narrow: scalars and arrays of scalars, nothing nested. A record is a handful
 * of fields a person reads at the top of a document, and anything wanting hierarchy points at
 * another document by name instead. Once frontmatter can hold a tree, documents start
 * carrying structure that the prose below them contradicts.
 */

export type Scalar = string | number | boolean;
export type Field = Scalar | readonly Scalar[];

const NEEDS_QUOTES = /^[\s>|&*!%@`{}[\],#?:-]|[:#]\s|\s$|^$|^(true|false|null|~|-?\d+(\.\d+)?)$/i;

function scalar(value: Scalar): string {
  if (typeof value !== 'string') return String(value);
  return NEEDS_QUOTES.test(value) ? `"${value.replace(/(["\\])/g, '\\$1')}"` : value;
}

/**
 * Writes a frontmatter block, omitting absent fields entirely.
 *
 * An empty key is not the same as a missing one and both are worse than either: `alters:`
 * with nothing under it reads as "answered, nothing" while meaning "not answered". Absent
 * fields are left out and the document says what it knows.
 */
export function serializeFrontmatter(fields: Readonly<Record<string, Field | undefined>>): string {
  const lines: string[] = ['---'];

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
        continue;
      }
      lines.push(`${key}:`);
      for (const item of value as readonly Scalar[]) lines.push(`  - ${scalar(item)}`);
      continue;
    }
    lines.push(`${key}: ${scalar(value as Scalar)}`);
  }

  lines.push('---');
  return `${lines.join('\n')}\n`;
}

/** A document: its frontmatter, then its prose. */
export function serializeDocument(
  fields: Readonly<Record<string, Field | undefined>>,
  body: string,
): string {
  return `${serializeFrontmatter(fields)}\n${body.replace(/\n*$/, '\n')}`;
}

/**
 * Both line endings, and the one in use is captured so it can be written back.
 *
 * The reader already accepted `\r\n`; without the same here, a document checked out on Windows
 * or through `core.autocrlf` reads fine and then silently refuses to be updated — the state
 * would be recorded in the ledger and never projected, and the only symptom is a warning most
 * people would read as a one-off.
 */
const BLOCK = /^---(\r?\n)([\s\S]*?)\r?\n---(\r?\n|$)/;

/**
 * Replaces one frontmatter field, leaving every other byte alone.
 *
 * Not a re-serialisation. Reading a document into a model and writing the model back drops
 * whatever the model does not represent — a comment, a field this version has never heard of,
 * the author's ordering — and the loss looks exactly like success. So the line is found and
 * replaced, and everything outside it comes through untouched.
 *
 * Returns null when there is no frontmatter block, because writing one into a file that has
 * none would be inventing a record rather than updating it.
 */
export function withField(text: string, key: string, value: Scalar): string | null {
  const block = BLOCK.exec(text);
  const eol = block?.[1];
  const fields = block?.[2];
  if (block === null || eol === undefined || fields === undefined) return null;

  const line = `${key}: ${scalar(value)}`;
  // `[^\r\n]*` rather than `.*`, because `.` matches a carriage return: replacing with it would
  // strip the `\r` from this one line and leave the file with mixed endings.
  const existing = new RegExp(`^${key}:[^\\r\\n]*`, 'm');
  const updated = existing.test(fields) ? fields.replace(existing, line) : `${fields}${eol}${line}`;

  return `---${eol}${updated}${eol}---${block[3]}${text.slice(block[0].length)}`;
}
