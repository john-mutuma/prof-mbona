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

    // Topic is optional — if provided, we use curriculum facts for grounding
    const topic = topicId ? getTopicById(topicId) : undefined;

    // Parse conversation history if provided
    const history: ChatMessage[] = historyJson
      ? JSON.parse(historyJson)
      : [];

    let localText: string;
    let englishQuestion: string;

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
      localText = await transcribe(audioBuffer, languageCode);
      if (!localText || localText.trim() === "") {
        return NextResponse.json(
          { error: "Could not transcribe audio. Please speak clearly and try again." },
          { status: 422 }
        );
      }

      // 2. Translate: local text -> English
      if (language.hasTranslate) {
        englishQuestion = await translate(localText, languageCode, "en");
      } else {
        // No NLLB translation available — ask the LLM to interpret directly
        // The LLM will receive the local text with an instruction to interpret it
        englishQuestion = localText;
      }
    } else {
      // === TEXT PATH: skip transcription ===
      const text = textInput!.trim();

      if (inputLang === "en") {
        englishQuestion = text;
        if (language.hasTranslate) {
          localText = await translate(text, "en", languageCode);
        } else {
          // Can't translate to local — just show English as-is
          localText = text;
        }
      } else {
        localText = text;
        if (language.hasTranslate) {
          englishQuestion = await translate(text, inputLang, "en");
        } else {
          // No translation — pass through to LLM directly
          englishQuestion = text;
        }
      }
    }

    // 3. LLM Tutor: question -> English answer
    // If no translation was available, tell the tutor the input language
    const tutorQuestion = language.hasTranslate
      ? englishQuestion
      : `[The following is in ${language.name}. Interpret and answer in English]: ${englishQuestion}`;

    const englishAnswer = await askTutor(
      tutorQuestion,
      topic?.title,
      topic?.facts,
      history
    );

    // 4. Translate: English answer -> local language
    let localAnswer: string;
    if (language.hasTranslate) {
      localAnswer = await translate(englishAnswer, "en", languageCode);
    } else {
      // No NLLB — we'll still try TTS with English answer or skip
      // Use Swahili as a bridge language since most speakers understand it
      localAnswer = await translate(englishAnswer, "en", "swh");
    }

    // 5. TTS: generate speech if available
    let audioBase64: string | null = null;
    let sampleRate = 16000;

    if (language.hasTTS) {
      const ttsLang = language.hasTranslate ? languageCode : "swh";
      const ttsResult = await textToSpeech(localAnswer, ttsLang);
      audioBase64 = ttsResult.audioBase64;
      sampleRate = ttsResult.sampleRate;
    }

    return NextResponse.json({
      // Child's input
      childTextLocal: localText,
      childTextEn: language.hasTranslate ? englishQuestion : localText,
      // Tutor's response
      tutorTextEn: englishAnswer,
      tutorTextLocal: localAnswer,
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
