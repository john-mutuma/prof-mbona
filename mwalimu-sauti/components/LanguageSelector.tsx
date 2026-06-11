"use client";

import { Language, SUPPORTED_LANGUAGES } from "@/lib/languages";

interface LanguageSelectorProps {
  selected: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageSelector({
  selected,
  onChange,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selected.code === lang.code
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm"
              : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
          }`}
          title={`${lang.name} (${lang.nativeName})`}
        >
          {lang.flag} {lang.nativeName}
        </button>
      ))}
    </div>
  );
}
