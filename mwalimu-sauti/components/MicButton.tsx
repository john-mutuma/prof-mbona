"use client";

import { useState, useRef, useCallback } from "react";

interface MicButtonProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
  isProcessing?: boolean;
  labelSpeak?: string;
  labelStop?: string;
  labelThinking?: string;
}

export default function MicButton({
  onRecordingComplete,
  disabled = false,
  isProcessing = false,
  labelSpeak = "Tap to speak",
  labelStop = "Tap to stop",
  labelThinking = "Thinking...",
}: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert(
        "Could not access microphone. Please allow microphone access and try again."
      );
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleClick = () => {
    if (disabled || isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`
        relative w-24 h-24 rounded-full flex items-center justify-center
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-offset-2
        ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 focus:ring-red-300 scale-110"
            : isProcessing
            ? "bg-amber-500 cursor-wait"
            : disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300 hover:scale-105"
        }
        shadow-lg
      `}
      aria-label={
        isRecording
          ? "Stop recording"
          : isProcessing
          ? "Processing..."
          : "Start recording"
      }
    >
      {/* Pulse animation when recording */}
      {isRecording && (
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
      )}

      {/* Icon */}
      <span className="relative text-white text-4xl">
        {isRecording ? (
          // Stop icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : isProcessing ? (
          // Spinner
          <svg
            className="w-10 h-10 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          // Mic icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </span>

      {/* Label below */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-600 whitespace-nowrap">
        {isRecording
          ? labelStop
          : isProcessing
          ? labelThinking
          : labelSpeak}
      </span>
    </button>
  );
}
