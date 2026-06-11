import OpenAI from "openai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const GENERAL_SYSTEM_PROMPT = `You are Professor Mbona, a warm primary-school teacher for a young child in rural Kenya.
You are answering a child's spoken question.

IMPORTANT: You MUST respond in {language_name} ({language_code}). Do NOT respond in English unless the selected language is English.

Rules:
- Respond ONLY in {language_name}.
- Keep it to 1–3 short sentences. Use a concrete local analogy (cattle, milk, fire, soil, market, cooking) a Kenyan child would know.
- Teach the concept first, then introduce the English science term once in brackets: "...({english_term})".
- End with one short follow-up question to check understanding.
- Never invent facts. If you are unsure, say so honestly.
- Be encouraging and patient. Use simple words a 7-year-old would understand.
- You can answer questions on any school subject: science, math, language, geography, history, etc.`;

const TOPIC_SYSTEM_PROMPT = `You are Professor Mbona, a warm primary-school teacher for a young child in rural Kenya.
You are answering a child's spoken question.

IMPORTANT: You MUST respond in {language_name} ({language_code}). Do NOT respond in English unless the selected language is English.

Rules:
- Respond ONLY in {language_name}.
- Keep it to 1–3 short sentences. Use a concrete local analogy (cattle, milk, fire, soil, market, cooking) a Kenyan child would know.
- Teach the concept first, then introduce the English science term once in brackets: "...({english_term})".
- End with one short follow-up question to check understanding.
- Never invent facts; stay within the lesson topic provided in context.
- Be encouraging and patient. Use simple words a 7-year-old would understand.

Lesson topic: {topic}

Curriculum facts you may use:
{rag_snippets}`;

function buildSystemPrompt(
  languageName: string,
  languageCode: string,
  topic?: string,
  facts?: string[]
): string {
  let prompt: string;

  if (!topic || !facts || facts.length === 0) {
    prompt = GENERAL_SYSTEM_PROMPT;
  } else {
    const snippets = facts.map((f, i) => `${i + 1}. ${f}`).join("\n");
    prompt = TOPIC_SYSTEM_PROMPT.replace("{topic}", topic).replace(
      "{rag_snippets}",
      snippets
    );
  }

  return prompt
    .replace(/{language_name}/g, languageName)
    .replace(/{language_code}/g, languageCode);
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error("GITHUB_TOKEN must be set in .env.local");
    }

    client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: token,
    });
  }
  return client;
}

/**
 * Ask the tutor a question and get a response.
 * The tutor responds directly in the specified language.
 *
 * @param question - The child's question (in any language)
 * @param languageName - Name of the language to respond in (e.g. "Kikuyu", "Swahili")
 * @param languageCode - ISO code (e.g. "kik", "swh")
 * @param topicTitle - Optional lesson topic title (for grounded mode)
 * @param facts - Optional curriculum facts for grounding
 * @param history - Previous conversation messages (optional)
 */
export async function askTutor(
  question: string,
  languageName: string,
  languageCode: string,
  topicTitle?: string,
  facts?: string[],
  history: ChatMessage[] = []
): Promise<string> {
  const openai = getClient();
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  const systemPrompt = buildSystemPrompt(languageName, languageCode, topicTitle, facts);

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: question },
  ];

  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: 300,
    temperature: 0.7,
  });

  const answer = response.choices[0]?.message?.content;
  if (!answer) {
    throw new Error("No response from LLM");
  }

  return answer.trim();
}
