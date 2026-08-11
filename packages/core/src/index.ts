/**
 * `@mollyguard/core` — the engine.
 *
 * Pure: no filesystem, no network, no clock. Values in, values out, timestamps as arguments.
 * That is what lets the same code decide the same way behind the CLI, inside a server, and in
 * a test against a fixed corpus — and a verdict that cannot be reproduced is a claim rather
 * than a check.
 *
 * It is also what a plugin depends on. A slice that had to import the CLI to contribute a
 * check would be a slice no backend could load.
 */

export * from './areas';
export * from './capability';
export * from './change';
export * from './choices';
export * from './frontmatter';
export * from './lifecycle';
export * from './readmes';
export * from './scaffold';
export * from './slug';
export * from './templates';
