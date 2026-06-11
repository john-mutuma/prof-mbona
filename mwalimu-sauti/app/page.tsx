"use client";

import { useState, useCallback } from "react";
import MicButton from "@/components/MicButton";
import TextInput from "@/components/TextInput";
import LanguageSelector from "@/components/LanguageSelector";
import ConversationThread, { Message } from "@/components/ConversationThread";
import AudioPlayer from "@/components/AudioPlayer";
import PipelineStatus from "@/components/PipelineStatus";
import { TOPICS, Topic } from "@/lib/curriculum";
import { Language, SUPPORTED_LANGUAGES } from "@/lib/languages";

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
  const [language, setLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]); // Default: Kikuyu

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
        // If user selected "kik" in TextInput, map to the actual selected language code
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
    handleTextSubmit(topic.title + "?", "en");
  };

  const isProcessing = stage !== "idle" && stage !== "done" && stage !== "error";
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex flex-col gap-2 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h1 className="font-bold text-gray-800 text-lg">
              Professor Mbona
            </h1>
            <p className="text-xs text-emerald-600">
              Ask anything — speak or type in English or {language.name}
            </p>
          </div>
          {activeTopic && (
            <button
              onClick={() => setActiveTopic(null)}
              className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
              title="Clear topic focus"
            >
              {activeTopic.icon} {activeTopic.title} ✕
            </button>
          )}
        </div>
        {/* Language selector */}
        <LanguageSelector selected={language} onChange={setLanguage} />
      </header>

      {/* Conversation or welcome */}
      {hasMessages ? (
        <ConversationThread messages={messages} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <p className="text-5xl mb-4">👨‍🏫</p>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Habari! I&apos;m Professor Mbona
          </h2>
          <p className="text-gray-500 text-center mb-8 max-w-sm">
            Ask me any question — about science, math, nature, anything!
            Speak in {language.name} or type in English.
          </p>

          {/* Suggested topics */}
          <div className="w-full max-w-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 text-center">
              Try asking about...
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
                      {topic.title}
                    </p>
                    <p className="text-xs text-gray-400">{topic.titleKikuyu}</p>
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
            🎤 Voice
          </button>
          <button
            onClick={() => setInputMode("text")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              inputMode === "text"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ⌨️ Text
          </button>
        </div>

        {/* Voice or Text input */}
        {inputMode === "voice" ? (
          <div className="flex flex-col items-center">
            <MicButton
              onRecordingComplete={handleRecordingComplete}
              isProcessing={isProcessing}
            />
            <div className="h-4" />
          </div>
        ) : (
          <TextInput
            onSubmit={handleTextSubmit}
            disabled={isProcessing}
            languageName={language.name}
            languageCode={language.code}
          />
        )}
      </div>
    </div>
  );
}
