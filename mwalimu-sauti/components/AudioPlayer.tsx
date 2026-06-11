"use client";

import { useRef, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  /** Base64-encoded WAV audio */
  audioBase64: string | null;
  /** Auto-play when new audio arrives */
  autoPlay?: boolean;
}

export default function AudioPlayer({
  audioBase64,
  autoPlay = true,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevAudioRef = useRef<string | null>(null);

  const playAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => {
        console.warn("Auto-play blocked:", e);
      });
    }
  }, []);

  useEffect(() => {
    if (audioBase64 && audioBase64 !== prevAudioRef.current && autoPlay) {
      prevAudioRef.current = audioBase64;
      // Small delay to ensure the src is updated
      setTimeout(playAudio, 100);
    }
  }, [audioBase64, autoPlay, playAudio]);

  if (!audioBase64) return null;

  const audioSrc = `data:audio/wav;base64,${audioBase64}`;

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <audio ref={audioRef} src={audioSrc} className="hidden" />
      <button
        onClick={playAudio}
        className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 
                   border border-amber-200 rounded-full text-amber-700 text-sm font-medium
                   transition-colors"
        aria-label="Replay audio"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        Replay answer
      </button>
    </div>
  );
}
