import { NextRequest, NextResponse } from "next/server";
import { transcribe, translate, textToSpeech } from "@/lib/paza";
import { askTutor, ChatMessage } from "@/lib/tutor";
import { getTopicById } from "@/lib/curriculum";

export const maxDuration = 60; // Allow up to 60s for the full chain

// Languages that support the full pipeline
const FULL_PIPELINE_LANGUAGES = ["kik", "swh", "som"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const textInput = formData.get("text") as string | null;
    const inputLang = (formData.get("inputLang") as string) || "en";
    const language = (formData.get("language") as string) || "kik";
    const topicId = formData.get("topic") as string | null;
    const historyJson = formData.get("history") as string | null;

    if (!audioFile && !textInput) {
      return NextResponse.json(
        { error: "No audio file or text input provided" },
        { status: 400 }
      );
    }

    if (!FULL_PIPELINE_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: `Language "${language}" does not support the full voice pipeline. Use: ${FULL_PIPELINE_LANGUAGES.join(", ")}` },
        { status: 400 }
      );
    }

    // Topic is optional — if provided, we use curriculum facts for grounding
    const topic = topicId ? getTopicById(topicId) : undefined;

    // Parse conversation history if provided
    const history: ChatMessage[] = historyJson
      ? JSON.parse(historyJson)
      : [];

    let localText: string;
    let englishQuestion: string;

    if (audioFile) {
      // === VOICE PATH: full chain ===

      // Convert uploaded file to buffer
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

      // 1. Transcribe: local language speech -> local text
      localText = await transcribe(audioBuffer, language);
      if (!localText || localText.trim() === "") {
        return NextResponse.json(
          { error: "Could not transcribe audio. Please speak clearly and try again." },
          { status: 422 }
        );
      }

      // 2. Translate: local text -> English
      englishQuestion = await translate(localText, language, "en");
    } else {
      // === TEXT PATH: skip transcription ===
      const text = textInput!.trim();

      if (inputLang === "en") {
        // English input: translate to local language for display
        englishQuestion = text;
        localText = await translate(text, "en", language);
      } else {
        // Local language input: translate to English for the tutor
        localText = text;
        englishQuestion = await translate(text, inputLang, "en");
      }
    }

    // 3. LLM Tutor: English question -> English answer
    const englishAnswer = await askTutor(
      englishQuestion,
      topic?.title,
      topic?.facts,
      history
    );

    // 4. Translate: English answer -> local language
    const localAnswer = await translate(englishAnswer, "en", language);

    // 5. TTS: local text -> local language audio
    const { audioBase64, sampleRate } = await textToSpeech(localAnswer, language);

    return NextResponse.json({
      // Child's input
      childTextLocal: localText,
      childTextEn: englishQuestion,
      // Tutor's response
      tutorTextEn: englishAnswer,
      tutorTextLocal: localAnswer,
      // Audio response
      audioBase64,
      sampleRate,
      // Metadata
      topic: topicId || null,
      language,
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
