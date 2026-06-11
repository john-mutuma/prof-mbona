# GitHub Models — Connection Guide

> **For the team.** How to set up GitHub Models as the LLM backend for Professor Mbona.

---

## What is GitHub Models?

GitHub Models lets you call hosted LLMs (GPT-4o, GPT-4o-mini, Llama, Mistral, etc.) via a REST API compatible with the OpenAI SDK. It's free for eligible GitHub accounts.

- **Base URL:** `https://models.inference.ai.azure.com`
- **Auth:** GitHub Personal Access Token (PAT)
- **SDK:** Standard `openai` npm package (same as OpenAI API, just different base URL)

---

## Step 1: Check Account Eligibility

GitHub Models is available to:
- GitHub Free, Pro, and Enterprise accounts
- **NOT** all managed/org-restricted accounts

If you get `"Your account type is not currently supported"`, your account doesn't have access. Options:
- Try a different personal GitHub account
- Use an alternative provider (see bottom of this doc)

---

## Step 2: Generate a Personal Access Token (PAT)

1. Go to **https://github.com/settings/tokens**
2. Click **"Generate new token"** → choose **Fine-grained** or **Classic**
3. For **Classic tokens:**
   - No special scopes are required for inference
   - Just generate with default permissions
4. For **Fine-grained tokens:**
   - No repository access needed
   - No special permissions needed
5. Copy the token (starts with `ghp_` for classic or `github_pat_` for fine-grained)

---

## Step 3: Test the Connection

### Quick test with curl:

```bash
curl -X POST "https://models.inference.ai.azure.com/chat/completions" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Say hello in Swahili"}],
    "max_tokens": 50
  }'
```

### Expected response:
```json
{
  "choices": [{"message": {"content": "Habari! That means 'hello' in Swahili."}}]
}
```

### If you get 401:
```json
{"error": {"code": "unauthorized", "message": "Your account type is not currently supported"}}
```
→ Your GitHub account doesn't have access. See "Alternatives" below.

---

## Step 4: Configure Professor Mbona

Edit `.env.local` in the project root:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LLM_MODEL=gpt-4o-mini
```

That's it. The app reads these and connects automatically.

---

## How It Works in the Code

**File:** `lib/tutor.ts`

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

const response = await client.chat.completions.create({
  model: process.env.LLM_MODEL || "gpt-4o-mini",
  messages: [...],
  max_tokens: 200,
  temperature: 0.7,
});
```

The `openai` npm package works with any OpenAI-compatible endpoint — we just override `baseURL`.

---

## Available Models (Free Tier)

| Model | Good for |
|-------|----------|
| `gpt-4o-mini` | Fast, cheap, great for short tutoring answers (recommended) |
| `gpt-4o` | Higher quality but slower |
| `Meta-Llama-3.1-8B-Instruct` | Open source alternative |
| `Mistral-small` | Fast open source |

Full list: https://github.com/marketplace/models

---

## Rate Limits (Free Tier)

- ~150 requests/minute for `gpt-4o-mini`
- ~10 requests/minute for `gpt-4o`
- Sufficient for a hackathon demo

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `401 unauthorized` | Token invalid or account not supported | Regenerate token; try different account |
| `"Your account type is not currently supported"` | Managed/restricted org account | Use a personal GitHub account |
| `429 Too Many Requests` | Rate limited | Wait 60s or switch to `gpt-4o-mini` |
| `fetch failed` / `ENOTFOUND` | Network issue | Check internet; verify base URL |
| `model not found` | Wrong model name | Use exact name from GitHub Models marketplace |

---

## Alternatives (If GitHub Models Doesn't Work)

### Option A: Standard OpenAI API
```env
# Change in .env.local:
OPENAI_API_KEY=sk-xxxxxxxx
LLM_MODEL=gpt-4o-mini
```
Then in `lib/tutor.ts`, remove the `baseURL` override:
```typescript
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```
- Requires: account at platform.openai.com + payment method
- Cost: ~$0.15 per million tokens (negligible for demo)

### Option B: Google Gemini
- Free key from https://aistudio.google.com
- Requires switching to `@google/generative-ai` SDK
- Different API shape (more code changes)

### Option C: Ollama (fully local)
```bash
# Install Ollama, then:
ollama pull llama3.2
ollama serve
```
```env
OLLAMA_BASE_URL=http://localhost:11434/v1
LLM_MODEL=llama3.2
```
Then set `baseURL` to `process.env.OLLAMA_BASE_URL` in `lib/tutor.ts`.
- Free, no account, works offline
- Slower without a GPU

---

## Quick Decision Tree

```
Can you access github.com/marketplace/models?
  → YES: Use GitHub Models (free, fast)
  → NO:
      Do you have an OpenAI API key?
        → YES: Use OpenAI (paid, reliable)
        → NO:
            Do you have a Google account?
              → YES: Use Gemini (free)
              → NO: Use Ollama (local, free)
```

---

*Last updated: 2026-06-11*
