/**
 * Supported languages for the full voice loop (ASR + translate + TTS).
 * Only languages that support ALL three capabilities are listed here.
 */
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

/** Languages with full pipeline support (ASR + translate both ways + TTS) */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "kik", name: "Kikuyu", nativeName: "Gĩkũyũ", flag: "🇰🇪" },
  { code: "swh", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪" },
  { code: "som", name: "Somali", nativeName: "Soomaali", flag: "🇸🇴" },
];

/** Languages with partial support (for info display only) */
export const PARTIAL_LANGUAGES: Language[] = [
  { code: "kln", name: "Kalenjin", nativeName: "Kalenjin", flag: "🇰🇪" }, // ASR + TTS, no translate
  { code: "mas", name: "Maasai", nativeName: "Maa", flag: "🇰🇪" },       // ASR + TTS, no translate
  { code: "luo", name: "Dholuo", nativeName: "Dholuo", flag: "🇰🇪" },    // ASR + translate, no TTS
];

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}
