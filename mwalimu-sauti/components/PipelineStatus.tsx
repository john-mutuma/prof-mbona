"use client";

interface PipelineStatusProps {
  stage: "idle" | "recording" | "transcribing" | "thinking" | "translating" | "speaking" | "done" | "error";
  error?: string;
}

const STAGE_LABELS: Record<string, { label: string; emoji: string }> = {
  idle: { label: "Ready", emoji: "✨" },
  recording: { label: "Listening...", emoji: "👂" },
  transcribing: { label: "Understanding your words...", emoji: "📝" },
  thinking: { label: "Professor is thinking...", emoji: "🤔" },
  translating: { label: "Translating to Kikuyu...", emoji: "🔄" },
  speaking: { label: "Preparing voice...", emoji: "🔊" },
  done: { label: "Done!", emoji: "✅" },
  error: { label: "Something went wrong", emoji: "⚠️" },
};

export default function PipelineStatus({ stage, error }: PipelineStatusProps) {
  if (stage === "idle") return null;

  const info = STAGE_LABELS[stage] || STAGE_LABELS.idle;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
      ${stage === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}
    `}
    >
      <span className="text-lg">{info.emoji}</span>
      <span>{error || info.label}</span>
      {stage !== "done" && stage !== "error" && (
        <span className="inline-block w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
      )}
    </div>
  );
}
