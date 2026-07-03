/**
 * Emoticons parser — MSN-style text-to-emoji conversion.
 *
 * Design decision (ADR-103.3):
 * - Parsing happens client-side (frontend) only
 * - No HTML generation — text stored as-is in database
 * - Mapa fixo: (L), :-), :), :(
 *
 * Order matters: :-) must be tested before :) to avoid leaving residual "-"
 */

/**
 * EMOTICONS — Map of text emoticons to Unicode emoji.
 * Exported for future UI picker (feature T018).
 */
export const EMOTICONS: Record<string, string> = {
  ":-)" : "😊",
  ":)" : "😊",
  ":(" : "😞",
  "(L)" : "❤️",
};

/**
 * Order of emoticons for parsing.
 * CRITICAL: ":-)" MUST come before ":)" to prevent ":-)" being parsed
 * as ":)" + "-" residue.
 */
const EMOTICONS_ORDER: Array<[string, string]> = [
  [":-)", "😊"],
  [":)", "😊"],
  [":(", "😞"],
  ["(L)", "❤️"],
];

/**
 * parseEmoticons — Replace all emoticon sequences with their emoji equivalents.
 *
 * @param text - Input text (may contain emoticons)
 * @returns Text with all emoticons replaced by emojis
 *
 * Examples:
 * - "oi (L)" → "oi ❤️"
 * - "ok :-) :)" → "ok 😊 😊"
 * - "sem emoticon" → "sem emoticon"
 * - "Não funcionou :(" → "Não funcionou 😞"
 */
export function parseEmoticons(text: string): string {
  let result = text;

  // Process emoticons in order. Using literal string replacement
  // to avoid regex escaping issues with special chars like () and -.
  for (const [emoticon, emoji] of EMOTICONS_ORDER) {
    result = result.replaceAll(emoticon, emoji);
  }

  return result;
}
