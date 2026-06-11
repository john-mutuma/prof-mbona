"use client";

import { useState, useRef } from "react";

interface TextInputProps {
  onSubmit: (text: string, lang: "en" | "kik") => void;
  disabled?: boolean;
  /** Name of the selected local language (e.g. "Kikuyu", "Swahili") */
  languageName?: string;
  /** Short code for display (e.g. "KIK", "SWH") */
  languageCode?: string;
}

export default function TextInput({
  onSubmit,
  disabled = false,
  languageName = "Kikuyu",
  languageCode = "KIK",
}: TextInputProps) {
  const [text, setText] = useState("");
  const [lang, setLang] = useState<"en" | "kik">("en");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed, lang);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-lg">
      {/* Language toggle */}
      <button
        type="button"
        onClick={() => setLang(lang === "en" ? "kik" : "en")}
        className="shrink-0 px-2 py-1.5 text-xs font-semibold rounded-md border border-gray-200 
                   bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors uppercase"
        title={`Input language: ${lang === "en" ? "English" : languageName}`}
      >
        {lang === "en" ? "EN" : languageCode.toUpperCase()}
      </button>

      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder={
          lang === "en"
            ? "Type your question in English..."
            : `Type in ${languageName}...`
        }
        className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-white
                   text-sm text-gray-800 placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="shrink-0 w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700
                   flex items-center justify-center text-white
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
        aria-label="Send message"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
      </button>
    </form>
  );
}
