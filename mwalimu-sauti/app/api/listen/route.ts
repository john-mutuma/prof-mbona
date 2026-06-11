import { NextRequest, NextResponse } from "next/server";
import { transcribe, translate, textToSpeech } from "@/lib/paza";
import { askTutor, ChatMessage } from "@/lib/tutor";
import { getTopicById } from "@/lib/curriculum";

export const maxDuration = 60; // Allow up to 60s for the full chain

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const textInput = formData.get("text") as string | null;
    const inputLang = (formData.get("inputLang") as string) || "en";
    const topicId = formData.get("topic") as string | null;
    const historyJson = formData.get("history") as string | null;

    if (!audioFile && !textInput) {
      return NextResponse.json(
        { error: "No audio file or text input provided" },
        { status: 400 }
      );
    }

    // Topic is optional — if provided, we use curriculum facts for grounding
    const topic = topicId ? getTopicById(topicId) : undefined;

    // Parse conversation history if provided
    const history: ChatMessage[] = historyJson
      ? JSON.parse(historyJson)
      : [];

    let kikuyuText: string;
    let englishQuestion: string;

    if (audioFile) {
      // === VOICE PATH: full 4-call chain ===

      // Convert uploaded file to buffer
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

      // 1. Transcribe: Kikuyu speech -> Kikuyu text
      kikuyuText = await transcribe(audioBuffer, "kik");
      if (!kikuyuText || kikuyuText.trim() === "") {
        return NextResponse.json(
          { error: "Could not transcribe audio. Please speak clearly and try again." },
          { status: 422 }
        );
      }

      // 2. Translate: Kikuyu text -> English text
      englishQuestion = await translate(kikuyuText, "kik", "en");
    } else {
      // === TEXT PATH: skip transcription ===
      const text = textInput!.trim();

      if (inputLang === "en") {
        // English input: translate to Kikuyu for display, use English directly for tutor
        englishQuestion = text;
        kikuyuText = await translate(text, "en", "kik");
      } else {
        // Kikuyu input: translate to English for the tutor
        kikuyuText = text;
        englishQuestion = await translate(text, "kik", "en");
      }
    }

    // 3. LLM Tutor: English question -> English answer
    const englishAnswer = await askTutor(
      englishQuestion,
      topic?.title,
      topic?.facts,
      history
    );

    // 4. Translate: English answer -> Kikuyu text
    const kikuyuAnswer = await translate(englishAnswer, "en", "kik");

    // 5. TTS: Kikuyu text -> Kikuyu audio
    const { audioBase64, sampleRate } = await textToSpeech(kikuyuAnswer, "kik");

    return NextResponse.json({
      // Child's input
      childTextKik: kikuyuText,
      childTextEn: englishQuestion,
      // Tutor's response
      tutorTextEn: englishAnswer,
      tutorTextKik: kikuyuAnswer,
      // Audio response
      audioBase64,
      sampleRate,
      // Metadata
      topic: topicId || null,
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
