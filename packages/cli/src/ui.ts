/**
 * Terminal output.
 *
 * Colour is opt-out via `NO_COLOR` and off when nothing is a terminal, so output pasted into
 * a build log is readable. Refusals go to stderr and return an exit code — nothing in this
 * codebase throws to refuse, because a crash and a refusal must stay distinguishable.
 */

const plain = process.env['NO_COLOR'] !== undefined || !process.stdout.isTTY;

const wrap = (code: string) => (text: string) => (plain ? text : `[${code}m${text}[0m`);

export const bold = wrap('1');
export const dim = wrap('2');
export const red = wrap('31');
export const green = wrap('32');
export const amber = wrap('33');
export const teal = wrap('36');

export function info(line = ''): void {
  process.stdout.write(`${line}\n`);
}

export function warn(line: string): void {
  process.stderr.write(`${line}\n`);
}

/** Exit codes: 0 clean, 1 a refusal, 2 a defect in the tool. */
export function fail(message: string, hint?: string): never {
  process.stderr.write(`${red('error')} ${message}\n`);
  if (hint) process.stderr.write(`${dim(`  ${hint}`)}\n`);
  process.exit(1);
}
