"use client";

import { useRef, useEffect } from "react";

export interface Message {
  id: string;
  type: "child" | "tutor";
  textKik: string;
  textEn: string;
  audioBase64?: string;
}

interface ConversationThreadProps {
  messages: Message[];
  showTranslations?: boolean;
}

export default function ConversationThread({
  messages,
  showTranslations = true,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-center p-8">
        <div>
          <p className="text-5xl mb-4">{"\uD83C\uDF99\uFE0F"}</p>
          <p className="text-lg">Tap the microphone and ask a question!</p>
          <p className="text-sm mt-2">Speak in Kikuyu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.type === "child" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.type === "child"
                ? "bg-emerald-100 text-emerald-900 rounded-br-md"
                : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
            }`}
          >
            {/* Speaker label */}
            <p
              className={`text-xs font-semibold mb-1 ${
                msg.type === "child" ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {msg.type === "child" ? "You (Wee)" : `Professor ${"\uD83D\uDC68\u200D\uD83C\uDFEB"}`}
            </p>

            {/* Primary text (Kikuyu) */}
            <p className="text-base leading-relaxed">{msg.textKik}</p>

            {/* English translation (smaller, muted) */}
            {showTranslations && (
              <p className="text-xs text-gray-400 mt-2 italic border-t border-gray-100 pt-2">
                {msg.textEn}
              </p>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
