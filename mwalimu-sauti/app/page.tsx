"use client";

import { useState, useCallback } from "react";
import MicButton from "@/components/MicButton";
import TextInput from "@/components/TextInput";
import LanguageSelector from "@/components/LanguageSelector";
import ConversationThread, { Message } from "@/components/ConversationThread";
import AudioPlayer from "@/components/AudioPlayer";
import PipelineStatus from "@/components/PipelineStatus";
import { TOPICS, Topic, getTopicTitle, getTopicDescription } from "@/lib/curriculum";
import { Language, SUPPORTED_LANGUAGES } from "@/lib/languages";

// Emoji constants using Unicode escapes to avoid encoding issues on Windows
const EMOJI = {
  teacher: "\uD83D\uDC68\u200D\uD83C\uDFEB",
  mic: "\uD83C\uDF99\uFE0F",
  keyboard: "\u2328\uFE0F",
  warning: "\u26A0\uFE0F",
  close: "\u2715",
};

type Stage =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "translating"
  | "speaking"
  | "done"
  | "error";

type InputMode = "voice" | "text";

interface ConversationEntry {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string>("");
  const [latestAudio, setLatestAudio] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [language, setLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);

  const handleResponse = useCallback(
    (data: {
      childTextLocal: string;
      childTextEn: string;
      tutorTextEn: string;
      tutorTextLocal: string;
      audioBase64: string;
    }) => {
      const childMsg: Message = {
        id: `child-${Date.now()}`,
        type: "child",
        textKik: data.childTextLocal,
        textEn: data.childTextEn,
      };

      const tutorMsg: Message = {
        id: `tutor-${Date.now()}`,
        type: "tutor",
        textKik: data.tutorTextLocal,
        textEn: data.tutorTextEn,
        audioBase64: data.audioBase64,
      };

      setMessages((prev) => [...prev, childMsg, tutorMsg]);
      setLatestAudio(data.audioBase64);

      setHistory((prev) => [
        ...prev,
        { role: "user", content: data.childTextEn },
        { role: "assistant", content: data.tutorTextEn },
      ]);

      setStage("done");
      setTimeout(() => setStage("idle"), 2000);
    },
    []
  );

  const handleReset = () => {
    setMessages([]);
    setHistory([]);
    setLatestAudio(null);
    setStage("idle");
    setError("");
    setActiveTopic(null);
  };

  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : "Unknown error";
    setError(message);
    setStage("error");
    setTimeout(() => {
      setStage("idle");
      setError("");
    }, 5000);
  }, []);

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      setStage("transcribing");
      setError("");
      setLatestAudio(null);

      try {
        const formData = new FormData();
        formData.append("audio", blob, "audio.webm");
        formData.append("language", language.code);
        if (activeTopic) formData.append("topic", activeTopic.id);
        formData.append("history", JSON.stringify(history));

        setStage("thinking");

        const response = await fetch("/api/listen", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Request failed (${response.status})`);
        }

        setStage("speaking");
        const data = await response.json();
        handleResponse(data);
      } catch (err) {
        handleError(err);
      }
    },
    [history, activeTopic, language, handleResponse, handleError]
  );

  const handleTextSubmit = useCallback(
    async (text: string, lang: "en" | "kik") => {
      setStage("thinking");
      setError("");
      setLatestAudio(null);

      try {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("inputLang", lang === "kik" ? language.code : "en");
        formData.append("language", language.code);
        if (activeTopic) formData.append("topic", activeTopic.id);
        formData.append("history", JSON.stringify(history));

        const response = await fetch("/api/listen", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Request failed (${response.status})`);
        }

        setStage("speaking");
        const data = await response.json();
        handleResponse(data);
      } catch (err) {
        handleError(err);
      }
    },
    [history, activeTopic, language, handleResponse, handleError]
  );

  const handleTopicSuggestion = (topic: Topic) => {
    setActiveTopic(topic);
    handleTextSubmit(getTopicTitle(topic, language.code) + "?", "kik");
  };

  const isProcessing = stage !== "idle" && stage !== "done" && stage !== "error";
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo / title - clickable to reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            title="Back to home"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg">
              {EMOJI.teacher}
            </div>
            <div className="text-left">
              <h1 className="font-bold text-gray-900 text-base leading-tight">
                Professor Mbona
              </h1>
              <p className="text-xs text-gray-500">
                {language.ui.speakOrType}
              </p>
            </div>
          </button>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {activeTopic && (
              <button
                onClick={() => setActiveTopic(null)}
                className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                title="Clear topic focus"
              >
                {activeTopic.icon} <span className="hidden sm:inline">{getTopicTitle(activeTopic, language.code)}</span> {EMOJI.close}
              </button>
            )}
            <LanguageSelector selected={language} onChange={setLanguage} />
          </div>
        </div>

        {/* Warning banner for partial language support */}
        {language.note && (
          <div className="px-4 pb-2">
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
              {EMOJI.warning} {language.name}: {language.note}
            </p>
          </div>
        )}
      </header>

      {/* Conversation or welcome */}
      {hasMessages ? (
        <ConversationThread messages={messages} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <p className="text-5xl mb-4">{EMOJI.teacher}</p>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {language.ui.greeting}
          </h2>
          <p className="text-gray-500 text-center mb-8 max-w-sm">
            {language.ui.heroSubtitle}
          </p>

          {/* Suggested topics */}
          <div className="w-full max-w-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 text-center">
              {language.ui.tryAsking}
            </p>
            <div className="grid gap-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSuggestion(topic)}
                  disabled={isProcessing}
                  className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-100
                             hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-2xl">{topic.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {getTopicTitle(topic, language.code)}
                    </p>
                    <p className="text-xs text-gray-400">{getTopicDescription(topic, language.code)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audio player (replay) */}
      <AudioPlayer audioBase64={latestAudio} />

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-3 px-4 py-4 bg-white border-t border-gray-100">
        <PipelineStatus stage={stage} error={error} />

        {/* Input mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setInputMode("voice")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              inputMode === "voice"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {EMOJI.mic} Voice
          </button>
          <button
            onClick={() => setInputMode("text")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              inputMode === "text"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {EMOJI.keyboard} Text
          </button>
        </div>

        {/* Voice or Text input */}
        {inputMode === "voice" ? (
          <div className="flex flex-col items-center">
            <MicButton
              onRecordingComplete={handleRecordingComplete}
              isProcessing={isProcessing}
              labelSpeak={language.ui.tapToSpeak}
              labelStop={language.ui.tapToStop}
              labelThinking={language.ui.thinking}
            />
            <div className="h-4" />
          </div>
        ) : (
          <TextInput
            onSubmit={handleTextSubmit}
            disabled={isProcessing}
            languageName={language.name}
            languageCode={language.code}
            placeholder={language.ui.typePlaceholder}
          />
        )}
      </div>
    </div>
  );
}
