/**
 * `@mollyguard/cli` — the terminal.
 *
 * Argument parsing and rendering live here and nowhere else. Core decides; this prints. A
 * check that reached for a formatting helper would be a check no server could run.
 */

export { initCommand } from './init';
