"use client";

interface PipelineStatusProps {
  stage: "idle" | "recording" | "transcribing" | "thinking" | "translating" | "speaking" | "done" | "error";
  error?: string;
}

const STAGE_LABELS: Record<string, { label: string; icon: string }> = {
  idle: { label: "Ready", icon: "\u2728" },
  recording: { label: "Listening...", icon: "\uD83D\uDC42" },
  transcribing: { label: "Understanding your words...", icon: "\uD83D\uDCDD" },
  thinking: { label: "Professor is thinking...", icon: "\uD83E\uDD14" },
  translating: { label: "Translating...", icon: "\uD83D\uDD04" },
  speaking: { label: "Preparing voice...", icon: "\uD83D\uDD0A" },
  done: { label: "Done!", icon: "\u2705" },
  error: { label: "Something went wrong", icon: "\u26A0\uFE0F" },
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
      <span className="text-lg">{info.icon}</span>
      <span>{error || info.label}</span>
      {stage !== "done" && stage !== "error" && (
        <span className="inline-block w-4 h-4 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
      )}
    </div>
  );
}
