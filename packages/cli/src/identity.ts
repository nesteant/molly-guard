/**
 * Who is doing this.
 *
 * Read from git, because the corpus lives in a repository and that is where a person has
 * already said who they are. Resolved here rather than in core: core is handed its caller the
 * same way it is handed its timestamps, so a backend passes the account it authenticated and a
 * test passes a fixed string.
 *
 * **An identity is never invented.** With no git config and no repository the answer is the
 * literal `unknown`, not a guess from `$USER` or the hostname. A ledger that attributes a
 * transition to somebody who did not make it is worse than one that admits it does not know —
 * the whole value of the record is that what it says happened, happened.
 */

import { execFileSync } from 'node:child_process';

export const UNKNOWN = 'unknown';

let resolved: string | undefined;

function config(key: string): string | undefined {
  try {
    const value = execFileSync('git', ['config', '--get', key], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return value === '' ? undefined : value;
  } catch {
    return undefined;
  }
}

/** `Name <email>`, or whichever half exists, or `unknown`. Resolved once per process. */
export function identity(): string {
  if (resolved !== undefined) return resolved;

  const name = config('user.name');
  const email = config('user.email');

  resolved = name && email ? `${name} <${email}>` : (name ?? email ?? UNKNOWN);
  return resolved;
}
