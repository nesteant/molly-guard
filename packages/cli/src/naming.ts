/**
 * The name a document is given, and the three ways deriving one goes wrong.
 *
 * Every command that mints a name goes through here rather than through `slugify` directly.
 * `slugify` is the reduction; this is the reduction, the refusal and the corpus's own policy —
 * and the refusal is the half that has to be impossible to forget, because a name is minted once
 * and never translated, so a partial one is permanent from the second it is written.
 */

import { isSlug, lostWords, slugify } from '@mollyguard/core';
import { Corpus, allocateName, patternFor, readConfig } from '@mollyguard/store';
import { fail } from './ui';

/**
 * The name, or a refusal.
 *
 * A name given by hand is checked for being typable and for nothing else — not for losing words,
 * and not against the corpus pattern. The author looked at their title and chose, and the policy
 * exists to spare people the allocation rather than to forbid them an exception; the migration
 * of a corpus that adopts a pattern is made entirely of such exceptions.
 */
export async function nameFor(
  corpus: Corpus,
  area: string,
  title: string,
  given: string | undefined,
): Promise<string> {
  if (given !== undefined) {
    if (isSlug(given)) return given;
    fail(
      `"${given}" is not a usable name`,
      'Names are lowercase ASCII, hyphenated — so they survive being typed and translated.',
    );
  }

  const slug = slugify(title);

  // Nothing survived. Refused with the message it always had: a title in a script that does not
  // reduce reduces to `""`, and no sentence naming the derived name is worth reading.
  if (!isSlug(slug)) {
    fail(
      `"${title}" does not reduce to a name`,
      'Names are lowercase ASCII so they survive translation. Pass --name <name> to choose one.',
    );
  }

  // Something survived, and it is a fragment. The name it *would* have been is shown, because a
  // refusal saying a name would be partial without saying which one is a refusal the reader
  // cannot check — and this one was silent before, which is how `entra-id` got written.
  const lost = lostWords(title);
  if (lost.length > 0) {
    // Agreeing with the count, because one lost word is the common case — a single foreign noun
    // in an otherwise English title — and a refusal that reads as though it were written for
    // some other title is one the reader trusts a little less.
    const reduce = lost.length === 1 ? 'reduces' : 'reduce';
    fail(
      `"${title}" would be named "${slug}" — ${lost.join(', ')} ${reduce} to nothing`,
      'A name is ASCII and never translated, so a partial one is permanent. Pass --name <name>.',
    );
  }

  // The corpus's own shape, applied last. A configuration that will not parse never reaches
  // here — `bin` refuses before any command runs, so a corpus that believes it numbers its
  // changes and silently does not is impossible rather than merely unlikely.
  const config = await readConfig(corpus.config);

  return allocateName(corpus.root, area, patternFor(config, area), slug);
}
