/**
 * Language support configuration for Professor Mbona.
 * Maps each language to its available Paza API capabilities.
 */
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  /** Can transcribe speech (ASR) */
  hasASR: boolean;
  /** Can translate to/from English via NLLB */
  hasTranslate: boolean;
  /** Can generate speech (TTS) */
  hasTTS: boolean;
  /** Short note about limitations */
  note?: string;
}

/**
 * All languages available in the app.
 * Capability flags are based on verified Paza API support (2026-06-11).
 *
 * Capability matrix:
 * | Lang     | ASR | Translate | TTS |
 * |----------|-----|-----------|-----|
 * | Kikuyu   | ✓   | ✓         | ✓   |
 * | Swahili  | ✓   | ✓         | ✓   |
 * | Somali   | ✓   | ✓         | ✓   |
 * | Kalenjin | ✓   | ✗         | ✓   |
 * | Maasai   | ✓   | ✗         | ✓   |
 * | Dholuo   | ✓   | ✓         | ✗   |
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: "kik",
    name: "Kikuyu",
    nativeName: "Gĩkũyũ",
    flag: "🇰🇪",
    hasASR: true,
    hasTranslate: true,
    hasTTS: true,
  },
  {
    code: "swh",
    name: "Swahili",
    nativeName: "Kiswahili",
    flag: "🇰🇪",
    hasASR: true,
    hasTranslate: true,
    hasTTS: true,
  },
  {
    code: "som",
    name: "Somali",
    nativeName: "Soomaali",
    flag: "🇸🇴",
    hasASR: true,
    hasTranslate: true,
    hasTTS: true,
  },
  {
    code: "kln",
    name: "Kalenjin",
    nativeName: "Kalenjin",
    flag: "🇰🇪",
    hasASR: true,
    hasTranslate: false,
    hasTTS: true,
    note: "Translation via LLM (no NLLB support)",
  },
  {
    code: "mas",
    name: "Maasai",
    nativeName: "Maa",
    flag: "🇰🇪",
    hasASR: true,
    hasTranslate: false,
    hasTTS: true,
    note: "Translation via LLM (no NLLB support)",
  },
  {
    code: "luo",
    name: "Dholuo",
    nativeName: "Dholuo",
    flag: "🇰🇪",
    hasASR: true,
    hasTranslate: true,
    hasTTS: false,
    note: "Text response only (no TTS support)",
  },
];

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}

/** Languages with all 3 capabilities */
export function getFullPipelineLanguages(): Language[] {
  return SUPPORTED_LANGUAGES.filter(
    (l) => l.hasASR && l.hasTranslate && l.hasTTS
  );
}
