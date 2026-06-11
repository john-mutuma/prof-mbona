"use client";

import { useState, useCallback } from "react";
import MicButton from "@/components/MicButton";
import TextInput from "@/components/TextInput";
import TopicSelector from "@/components/TopicSelector";
import ConversationThread, { Message } from "@/components/ConversationThread";
import AudioPlayer from "@/components/AudioPlayer";
import PipelineStatus from "@/components/PipelineStatus";
import { TOPICS, Topic } from "@/lib/curriculum";

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
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string>("");
  const [latestAudio, setLatestAudio] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("voice");

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setMessages([]);
    setHistory([]);
    setLatestAudio(null);
    setStage("idle");
    setError("");
  };

  const handleBack = () => {
    setSelectedTopic(null);
    setMessages([]);
    setHistory([]);
    setLatestAudio(null);
    setStage("idle");
    setError("");
  };

  const handleResponse = useCallback(
    (data: {
      childTextKik: string;
      childTextEn: string;
      tutorTextEn: string;
      tutorTextKik: string;
      audioBase64: string;
    }) => {
      const childMsg: Message = {
        id: `child-${Date.now()}`,
        type: "child",
        textKik: data.childTextKik,
        textEn: data.childTextEn,
      };

      const tutorMsg: Message = {
        id: `tutor-${Date.now()}`,
        type: "tutor",
        textKik: data.tutorTextKik,
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
      if (!selectedTopic) return;

      setStage("transcribing");
      setError("");
      setLatestAudio(null);

      try {
        const formData = new FormData();
        formData.append("audio", blob, "audio.webm");
        formData.append("topic", selectedTopic.id);
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
    [selectedTopic, history, handleResponse, handleError]
  );

  const handleTextSubmit = useCallback(
    async (text: string, lang: "en" | "kik") => {
      if (!selectedTopic) return;

      setStage("thinking");
      setError("");
      setLatestAudio(null);

      try {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("inputLang", lang);
        formData.append("topic", selectedTopic.id);
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
    [selectedTopic, history, handleResponse, handleError]
  );

  const isProcessing = stage !== "idle" && stage !== "done" && stage !== "error";

  // Topic selection screen
  if (!selectedTopic) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-6">
        <TopicSelector topics={TOPICS} onSelect={handleTopicSelect} />
      </div>
    );
  }

  // Conversation screen
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Back to topics"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-gray-800 text-sm">
            {selectedTopic.icon} {selectedTopic.title}
          </h1>
          <p className="text-xs text-emerald-600">{selectedTopic.titleKikuyu}</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Kikuyu
        </span>
      </header>

      {/* Conversation */}
      <ConversationThread messages={messages} />

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
          <TextInput onSubmit={handleTextSubmit} disabled={isProcessing} />
        )}
      </div>
    </div>
  );
}
