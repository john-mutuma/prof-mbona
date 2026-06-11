/**
 * Language support configuration for Professor Mbona.
 * Maps each language to its available Paza API capabilities.
 *
 * All strings use Unicode escape sequences to avoid encoding issues on Windows.
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
 * | Kikuyu   | yes | yes       | yes |
 * | Swahili  | yes | yes       | yes |
 * | Somali   | yes | yes       | yes |
 * | Kalenjin | yes | no        | yes |
 * | Maasai   | yes | no        | yes |
 * | Dholuo   | yes | yes       | no  |
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: "kik",
    name: "Kikuyu",
    nativeName: "G\u0129k\u0169y\u0169",
    flag: "\uD83C\uDDF0\uD83C\uDDEA",
    hasASR: true,
    hasTranslate: true,
    hasTTS: true,
  },
  {
    code: "swh",
    name: "Swahili",
    nativeName: "Kiswahili",
    flag: "\uD83C\uDDF0\uD83C\uDDEA",
    hasASR: true,
    hasTranslate: true,
    hasTTS: true,
  },
  {
    code: "som",
    name: "Somali",
    nativeName: "Soomaali",
    flag: "\uD83C\uDDF8\uD83C\uDDF4",
    hasASR: true,
    hasTranslate: true,
    hasTTS: true,
  },
  {
    code: "kln",
    name: "Kalenjin",
    nativeName: "Kalenjin",
    flag: "\uD83C\uDDF0\uD83C\uDDEA",
    hasASR: true,
    hasTranslate: false,
    hasTTS: true,
    note: "Translation via LLM (no NLLB support)",
  },
  {
    code: "mas",
    name: "Maasai",
    nativeName: "Maa",
    flag: "\uD83C\uDDF0\uD83C\uDDEA",
    hasASR: true,
    hasTranslate: false,
    hasTTS: true,
    note: "Translation via LLM (no NLLB support)",
  },
  {
    code: "luo",
    name: "Dholuo",
    nativeName: "Dholuo",
    flag: "\uD83C\uDDF0\uD83C\uDDEA",
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
