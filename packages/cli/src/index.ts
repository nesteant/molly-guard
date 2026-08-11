/**
 * `mollyguard` — the terminal.
 *
 * Argument parsing and rendering live here and nowhere else. Core decides; this prints. A
 * check that reached for a formatting helper would be a check no server could run.
 */

export { UNKNOWN, identity } from './identity';
export { agentsCommand } from './agents';
export { newCapabilityCommand } from './capability';
export { newChangeCommand } from './change';
export { initCommand } from './init';
export { moveCommand } from './move';
export { publishCommand } from './publish';
export { statusCommand } from './status';
