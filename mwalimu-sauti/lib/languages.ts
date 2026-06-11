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
  /** Pre-translated UI strings for this language */
  ui: {
    greeting: string;
    heroSubtitle: string;
    tryAsking: string;
    speakOrType: string;
    tapToSpeak: string;
    tapToStop: string;
    thinking: string;
    typePlaceholder: string;
  };
}

/**
 * All languages available in the app.
 * Capability flags are based on verified Paza API support (2026-06-11).
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
    ui: {
      greeting: "W\u0129m\u0169thie! N\u0129 Professor Mbona",
      heroSubtitle: "Njuria k\u0129\u0169ria k\u0129othe \u2014 \u0169h\u0169r\u0169 sayansi, math\u0129, th\u0129, k\u0129othe! Aria kana and\u0129ka na G\u0129k\u0169y\u0169.",
      tryAsking: "\u0128ria k\u0169uria \u0169h\u0129t\u0129...",
      speakOrType: "Aria kana and\u0129ka na G\u0129k\u0169y\u0169",
      tapToSpeak: "Guta \u0169arie",
      tapToStop: "Guta \u0169tigane",
      thinking: "Ar\u0129\u0129r\u0129ria...",
      typePlaceholder: "And\u0129ka k\u0129\u0169ria g\u0129aku haha...",
    },
  },
  {
    code: "swh",
    name: "Swahili",
    nativeName: "Kiswahili",
    flag: "\uD83C\uDDF0\uD83C\uDDEA",
    hasASR: true,
    hasTranslate: true,
    hasTTS: true,
    ui: {
      greeting: "Habari! Mimi ni Professor Mbona",
      heroSubtitle: "Niulize swali lolote \u2014 kuhusu sayansi, hisabati, mazingira, chochote! Sema au andika kwa Kiswahili.",
      tryAsking: "Jaribu kuuliza kuhusu...",
      speakOrType: "Sema au andika kwa Kiswahili",
      tapToSpeak: "Gusa useme",
      tapToStop: "Gusa usimame",
      thinking: "Anafikiri...",
      typePlaceholder: "Andika swali lako hapa...",
    },
  },
  {
    code: "som",
    name: "Somali",
    nativeName: "Soomaali",
    flag: "\uD83C\uDDF8\uD83C\uDDF4",
    hasASR: true,
    hasTranslate: true,
    hasTTS: true,
    ui: {
      greeting: "Salaan! Waxaan ahay Professor Mbona",
      heroSubtitle: "I weydii su\u2019aal kasta \u2014 ku saabsan saynis, xisaab, dabiiciga, wax kasta! Ku hadal ama ku qor Soomaali.",
      tryAsking: "Isku day inaad weydiiso...",
      speakOrType: "Ku hadal ama ku qor Soomaali",
      tapToSpeak: "Taabo si aad u hadasho",
      tapToStop: "Taabo si aad u joojiso",
      thinking: "Wuu fakrayaa...",
      typePlaceholder: "Halkan ku qor su\u2019aashaada...",
    },
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
    ui: {
      greeting: "Chamge! Ane Professor Mbona",
      heroSubtitle: "Tebeng\u2019 taunet age tugul \u2014 komosta science, math, nature, age tugul! Imwa anan isir ak Kalenjin.",
      tryAsking: "Teben ikas komosta...",
      speakOrType: "Imwa anan isir ak Kalenjin",
      tapToSpeak: "Tap imwa",
      tapToStop: "Tap itinye",
      thinking: "Nenekta...",
      typePlaceholder: "Isir taunet yen...",
    },
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
    ui: {
      greeting: "Supa! Nanu Professor Mbona",
      heroSubtitle: "Iyieu enkulie nabo \u2014 tenebo science, math, enkop, nabo! Ina ake isujui te Maa.",
      tryAsking: "Etaa iyieu...",
      speakOrType: "Ina ake isujui te Maa",
      tapToSpeak: "Idipa ina",
      tapToStop: "Idipa itoki",
      thinking: "Eirikiore...",
      typePlaceholder: "Isujui enkulie neno...",
    },
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
    ui: {
      greeting: "Misawa! An e Professor Mbona",
      heroSubtitle: "Penya penjo moro amora \u2014 kuom sayans, math, piny, gimoro amora! Wuo kata ndik gi Dholuo.",
      tryAsking: "Tem penjo kuom...",
      speakOrType: "Wuo kata ndik gi Dholuo",
      tapToSpeak: "Mul iwuo",
      tapToStop: "Mul ichung'",
      thinking: "Oparo...",
      typePlaceholder: "Ndik penjoni ka...",
    },
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
