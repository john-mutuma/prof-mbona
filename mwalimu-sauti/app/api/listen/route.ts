import { NextRequest, NextResponse } from "next/server";
import { transcribe, translate, textToSpeech } from "@/lib/paza";
import { askTutor, ChatMessage } from "@/lib/tutor";
import { getTopicById } from "@/lib/curriculum";
import { getLanguageByCode } from "@/lib/languages";

export const maxDuration = 60; // Allow up to 60s for the full chain

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const textInput = formData.get("text") as string | null;
    const inputLang = (formData.get("inputLang") as string) || "en";
    const languageCode = (formData.get("language") as string) || "kik";
    const topicId = formData.get("topic") as string | null;
    const historyJson = formData.get("history") as string | null;

    if (!audioFile && !textInput) {
      return NextResponse.json(
        { error: "No audio file or text input provided" },
        { status: 400 }
      );
    }

    const language = getLanguageByCode(languageCode);
    if (!language) {
      return NextResponse.json(
        { error: `Unsupported language: "${languageCode}"` },
        { status: 400 }
      );
    }

    // Topic is optional - if provided, we use curriculum facts for grounding
    const topic = topicId ? getTopicById(topicId) : undefined;

    // Parse conversation history if provided
    const history: ChatMessage[] = historyJson
      ? JSON.parse(historyJson)
      : [];

    let childTextLocal: string;
    let childTextEn: string;

    if (audioFile) {
      // === VOICE PATH ===

      if (!language.hasASR) {
        return NextResponse.json(
          { error: `Speech recognition is not available for ${language.name}` },
          { status: 400 }
        );
      }

      // Convert uploaded file to buffer
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

      // 1. Transcribe: local language speech -> local text
      childTextLocal = await transcribe(audioBuffer, languageCode);
      if (!childTextLocal || childTextLocal.trim() === "") {
        return NextResponse.json(
          { error: "Could not transcribe audio. Please speak clearly and try again." },
          { status: 422 }
        );
      }

      // 2. Translate to English for the conversation record
      if (language.hasTranslate) {
        childTextEn = await translate(childTextLocal, languageCode, "en");
      } else {
        // No NLLB - provide both to the LLM, it will interpret
        childTextEn = childTextLocal;
      }
    } else {
      // === TEXT PATH: skip transcription ===
      const text = textInput!.trim();

      if (inputLang === "en") {
        childTextEn = text;
        if (language.hasTranslate) {
          childTextLocal = await translate(text, "en", languageCode);
        } else {
          childTextLocal = text;
        }
      } else {
        childTextLocal = text;
        if (language.hasTranslate) {
          childTextEn = await translate(text, inputLang, "en");
        } else {
          childTextEn = text;
        }
      }
    }

    // 3. LLM Tutor: responds directly in the selected language
    // Pass the child's message in local language so the LLM can respond naturally
    const tutorResponse = await askTutor(
      childTextLocal,
      language.name,
      languageCode,
      topic?.title,
      topic?.facts,
      history
    );

    // The tutor already responds in the target language
    const tutorTextLocal = tutorResponse;

    // Get English translation of tutor response for display/records
    let tutorTextEn: string;
    if (language.hasTranslate) {
      tutorTextEn = await translate(tutorResponse, languageCode, "en");
    } else {
      // Ask LLM responded in local language; try translating via Swahili bridge or just show as-is
      tutorTextEn = tutorResponse;
    }

    // 4. TTS: generate speech if available
    let audioBase64: string | null = null;
    let sampleRate = 16000;

    if (language.hasTTS) {
      const ttsResult = await textToSpeech(tutorTextLocal, languageCode);
      audioBase64 = ttsResult.audioBase64;
      sampleRate = ttsResult.sampleRate;
    }

    return NextResponse.json({
      // Child's input
      childTextLocal,
      childTextEn,
      // Tutor's response
      tutorTextEn,
      tutorTextLocal,
      // Audio response (null if TTS not available)
      audioBase64,
      sampleRate,
      // Metadata
      topic: topicId || null,
      language: languageCode,
      capabilities: {
        asr: language.hasASR,
        translate: language.hasTranslate,
        tts: language.hasTTS,
      },
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
