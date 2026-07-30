// Registration and search vocabulary rarely match exactly in Japanese
// ("印鑑" vs "はんこ"), so every comparison goes through this normalizer
// first: full/half-width and case folded via NFKC, katakana folded to
// hiragana, and whitespace collapsed away.
export function normalize(input: string): string {
  const widthFolded = input.normalize('NFKC');
  const hiragana = katakanaToHiragana(widthFolded);
  return hiragana.toLowerCase().trim().replace(/\s+/g, '');
}

function katakanaToHiragana(input: string): string {
  return input.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}
