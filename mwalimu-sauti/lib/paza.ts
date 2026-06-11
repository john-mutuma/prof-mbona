import { getPazaToken } from "./token";

const PAZA_BASE_URL =
  process.env.PAZA_BASE_URL ||
  "https://paza-server-guheh7eyfsb0adhr.westeurope-01.azurewebsites.net";

function getHeaders(contentType?: string): Record<string, string> {
  const token = getPazaToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  return headers;
}

/**
 * Transcribe audio (ASR) using Paza's MMS model.
 * Accepts a .webm audio buffer and returns the transcribed text.
 */
export async function transcribe(
  audioBuffer: Buffer,
  languageCode: string = "kik"
): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/webm" });
  formData.append("file", blob, "audio.webm");
  formData.append("language_code", languageCode);

  const token = getPazaToken();
  const response = await fetch(`${PAZA_BASE_URL}/api/transcribe/mms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Paza transcribe failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  // The API may return the field as "transcription" or "transcript"
  return data.transcription || data.transcript || data.text || "";
}

/**
 * Translate text between languages using Paza's NLLB model.
 */
export async function translate(
  text: string,
  srcLang: string,
  tgtLang: string = "en"
): Promise<string> {
  const response = await fetch(`${PAZA_BASE_URL}/api/translate`, {
    method: "POST",
    headers: getHeaders("application/json"),
    body: JSON.stringify({
      text,
      src_lang: srcLang,
      tgt_lang: tgtLang,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Paza translate failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  return data.translation || data.translated_text || "";
}

/**
 * Convert text to speech using Paza's MMS-TTS.
 * Returns base64-encoded WAV audio.
 */
export async function textToSpeech(
  text: string,
  languageCode: string = "kik"
): Promise<{ audioBase64: string; sampleRate: number }> {
  const response = await fetch(`${PAZA_BASE_URL}/api/tts`, {
    method: "POST",
    headers: getHeaders("application/json"),
    body: JSON.stringify({
      text,
      language_code: languageCode,
      format: "json",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Paza TTS failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    audioBase64: data.audio_base64,
    sampleRate: data.sample_rate || 16000,
  };
}
