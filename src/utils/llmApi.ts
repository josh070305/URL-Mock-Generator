import type { CrawlResult, MockPage } from '../types';

type Provider = 'gemini' | 'anthropic' | 'openrouter' | 'groq';

function getProvider(): Provider {
  const p = (import.meta.env.VITE_LLM_PROVIDER || 'gemini').toLowerCase();
  if (p === 'anthropic' || p === 'openrouter' || p === 'groq') return p;
  return 'gemini';
}

function buildPrompt(url: string, hostname: string): string {
  return `You are a web application crawler and UI mock generator.

The user wants to create a static mock of this website: ${url}

Your job:
1. Based on your knowledge of ${hostname}, identify the 3-4 most important
   CORE pages of this website (not login, not signup, not admin).
   Core pages = the main pages a visitor would see: Home, About, Features,
   Pricing, Documentation, Products, etc.

2. For each core page, generate a detailed visual mock layout.

Return ONLY valid JSON with no markdown, no backticks, no explanation.
Exactly this structure:

{
  "crawlResult": {
    "baseUrl": "${url}",
    "totalPages": 4,
    "pages": [
      { "url": "${url}", "title": "Home" },
      { "url": "${url}/about", "title": "About" },
      { "url": "${url}/features", "title": "Features" },
      { "url": "${url}/pricing", "title": "Pricing" }
    ]
  },
  "mockedPages": [
    {
      "url": "${url}",
      "title": "Home",
      "mock": {
        "mockTitle": "actual page title",
        "mockDescription": "one line description of this page",
        "navbar": {
          "logo": "brand name",
          "links": ["Home", "About", "Features", "Pricing"]
        },
        "hero": {
          "headline": "actual headline this site uses",
          "subheadline": "actual subheadline or tagline",
          "ctaText": "primary CTA button text",
          "ctaSecondary": "secondary CTA button text"
        },
        "sections": [
          {
            "title": "actual section title",
            "description": "actual section description",
            "type": "features"
          },
          {
            "title": "actual section title",
            "description": "actual section description",
            "type": "content"
          },
          {
            "title": "actual section title",
            "description": "actual section description",
            "type": "cta"
          }
        ],
        "footer": {
          "tagline": "footer tagline",
          "links": ["Privacy", "Terms", "Contact", "Blog"]
        },
        "colorScheme": {
          "primary": "#actual primary color of this brand",
          "background": "#0d0d14",
          "text": "#ffffff"
        }
      }
    }
  ]
}

IMPORTANT:
- Use REAL content from ${hostname} — actual headlines, actual CTAs,
  actual section names that this website actually uses
- Generate exactly 3-4 core pages
- Each page mock must be unique and different
- Use the brand's actual primary color in colorScheme.primary
- Return ONLY the JSON, nothing else`;
}

async function callAnthropic(prompt: string): Promise<string> {
  const key = import.meta.env.VITE_ANTHROPIC_KEY;
  if (!key) throw new Error('Missing VITE_ANTHROPIC_KEY — set it in your .env file.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Claude API error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGemini(prompt: string): Promise<string> {
  const key = import.meta.env.VITE_GEMINI_KEY;
  if (!key) throw new Error('Missing VITE_GEMINI_KEY — get a free key at https://aistudio.google.com/apikey');

  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  authHeader: string,
  model: string,
  prompt: string,
): Promise<string> {
  if (!apiKey) throw new Error('Missing API key — set the provider key in your .env file.');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${authHeader} ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`LLM API error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function parseMock(raw: string): { crawlResult: CrawlResult; mockedPages: MockPage[] } {
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

export async function crawlAndGenerateMocks(url: string): Promise<{
  crawlResult: CrawlResult;
  mockedPages: MockPage[];
}> {
  const hostname = new URL(url).hostname;
  const prompt = buildPrompt(url, hostname);
  const provider = getProvider();

  let raw: string;

  switch (provider) {
    case 'anthropic':
      raw = await callAnthropic(prompt);
      break;
    case 'gemini':
      raw = await callGemini(prompt);
      break;
    case 'openrouter':
      raw = await callOpenAICompatible(
        'https://openrouter.ai/api/v1',
        import.meta.env.VITE_OPENROUTER_KEY,
        'Bearer',
        import.meta.env.VITE_MODEL || 'qwen/qwen3-32b:free',
        prompt,
      );
      break;
    case 'groq':
      raw = await callOpenAICompatible(
        'https://api.groq.com/openai/v1',
        import.meta.env.VITE_GROQ_KEY,
        'Bearer',
        import.meta.env.VITE_MODEL || 'llama-3.3-70b-versatile',
        prompt,
      );
      break;
    default:
      raw = await callGemini(prompt);
  }

  return parseMock(raw);
}
