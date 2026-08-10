/**
 * `@mollyguard/store` — the corpus on disk.
 *
 * Everything I/O-shaped happens here so the engine can stay pure. The rule this module
 * enforces on its own behalf: a file that exists and does not load is reported, never
 * skipped. A silently ignored document is specified as far as its author is concerned and
 * absent as far as every check is concerned, and nothing downstream will ever mention it.
 */

export * from './layout';
