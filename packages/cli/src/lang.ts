/**
 * The language a document is written in.
 *
 * A corpus declares one in `mollyguard.yml`, and every document carries the same field so that a
 * file read on its own says what it is. Two records of one fact, which is tolerable only while
 * they cannot disagree — and they could: the config was written by `molly init --lang uk` and
 * then never read, so every document minted afterwards said `lang: en` inside a corpus that had
 * declared itself Ukrainian.
 *
 * Nothing translates anything. `lang` is a label for whoever reads the prose, and the skills tell
 * an agent to write in it; what it is for here is that the label is right.
 */

import { Corpus, readConfig } from '@mollyguard/store';

/** The language, in order of who has the better claim to know: the caller, the corpus, English. */
export async function langFor(corpus: Corpus, given: string | undefined): Promise<string> {
  if (given !== undefined) return given;
  return (await readConfig(corpus.config)).lang ?? 'en';
}
