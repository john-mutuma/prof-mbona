"use client";

import { useState, useRef, useEffect } from "react";
import { Language, SUPPORTED_LANGUAGES } from "@/lib/languages";

interface LanguageSelectorProps {
  selected: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageSelector({
  selected,
  onChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    onChange(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2
                   text-sm font-medium text-gray-700 cursor-pointer
                   hover:border-emerald-300 hover:bg-emerald-50/50
                   focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
                   transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-base">{selected.flag}</span>
        <span>{selected.name}</span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-lg
                     overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          role="listbox"
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
              Select language
            </p>
          </div>

          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selected.code === lang.code;
              const isFullSupport = lang.hasASR && lang.hasTranslate && lang.hasTTS;

              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                    ${isSelected
                      ? "bg-emerald-50 text-emerald-900"
                      : "hover:bg-gray-50 text-gray-700"
                    }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  {/* Flag */}
                  <span className="text-lg w-7 text-center shrink-0">{lang.flag}</span>

                  {/* Name and native name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${isSelected ? "text-emerald-800" : ""}`}>
                      {lang.name}
                    </p>
                    <p className="text-xs text-gray-400">{lang.nativeName}</p>
                  </div>

                  {/* Capability badges */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isFullSupport ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                        Full
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                        Partial
                      </span>
                    )}
                  </div>

                  {/* Check mark */}
                  {isSelected && (
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400">
              Full = voice + translation + speech. Partial = some features limited.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
