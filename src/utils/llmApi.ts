import type { CrawlResult, MockPage, PageData } from '../types';
import { fetchPage, discoverCorePages } from './fetcher';
import { extractPageStructure } from './extractor';

type Provider = 'gemini' | 'anthropic' | 'openrouter' | 'groq';

function getProvider(): Provider {
  const p = (import.meta.env.VITE_LLM_PROVIDER || 'gemini').toLowerCase();
  if (p === 'anthropic' || p === 'openrouter' || p === 'groq') return p;
  return 'gemini';
}

function buildMockPrompt(page: PageData): string {
  return `You are a UI mock generator. I have CRAWLED this real webpage and extracted its actual content. Generate a polished mock based ONLY on this real extracted data.

REAL CRAWLED DATA:
URL: ${page.url}
Title: ${page.title}
Description: ${page.description}
Hero Headline: ${page.heroText}
Hero Subtext: ${page.heroSubtext}
Nav Items: ${page.navItems.map(n => n.label).join(', ')}
Sections Found: ${page.sections.map(s => s.heading + ': ' + s.content.substring(0, 100)).join(' | ')}
Footer Links: ${page.footerLinks.join(', ')}
Real Brand Color: ${page.colors.primary}
Background Color: ${page.colors.background}
Text Color: ${page.colors.text}
Site Type: ${page.siteType}

Generate a mock using ONLY the real data above.
Return ONLY valid JSON, no markdown, no backticks:

{
  "mockTitle": "use real title from data",
  "mockDescription": "use real description from data",
  "navbar": {
    "logo": "brand name from title",
    "links": ["use real nav items from data"]
  },
  "hero": {
    "headline": "use real heroText from data",
    "subheadline": "use real heroSubtext from data",
    "ctaText": "primary action button text",
    "ctaSecondary": "secondary action button text"
  },
  "sections": [
    {
      "title": "use real section headings from data",
      "description": "use real section content from data",
      "type": "features|content|cta"
    }
  ],
  "footer": {
    "tagline": "brand tagline",
    "links": ["use real footer links from data"]
  },
  "colorScheme": {
    "primary": "${page.colors.primary}",
    "background": "${page.colors.background}",
    "text": "${page.colors.text}"
  },
  "images": ${JSON.stringify(page.images)}
}`;
}

function parseMock(raw: string) {
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function callLLM(prompt: string): Promise<string> {
  const provider = getProvider();

  switch (provider) {
    case 'anthropic': {
      const key = import.meta.env.VITE_ANTHROPIC_KEY;
      if (!key) throw new Error('Missing VITE_ANTHROPIC_KEY');
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
          max_tokens: 2000,
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

    case 'gemini': {
      const key = import.meta.env.VITE_GEMINI_KEY;
      if (!key) throw new Error('Missing VITE_GEMINI_KEY');
      const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 2048,
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

    case 'openrouter':
    case 'groq': {
      const isOpenRouter = provider === 'openrouter';
      const baseUrl = isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.groq.com/openai/v1';
      const apiKey = isOpenRouter
        ? import.meta.env.VITE_OPENROUTER_KEY
        : import.meta.env.VITE_GROQ_KEY;
      if (!apiKey) throw new Error(`Missing VITE_${provider.toUpperCase()}_KEY`);
      const model = import.meta.env.VITE_MODEL || (isOpenRouter ? 'qwen/qwen3-32b:free' : 'llama-3.3-70b-versatile');
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
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

    default:
      throw new Error('Unknown provider');
  }
}

function buildFallbackMock(page: PageData) {
  return {
    mockTitle: page.title,
    mockDescription: page.description || page.heroSubtext,
    navbar: {
      logo: new URL(page.url).hostname.replace('www.', ''),
      links: page.navItems.slice(0, 4).map(n => n.label),
    },
    hero: {
      headline: page.heroText,
      subheadline: page.heroSubtext,
      ctaText: 'Get Started',
      ctaSecondary: 'Learn More',
    },
    sections: page.sections.slice(0, 3).map(s => ({
      title: s.heading,
      description: s.content,
      type: s.type,
    })),
    footer: {
      tagline: page.title,
      links: page.footerLinks.slice(0, 4),
    },
      colorScheme: page.colors,
      images: page.images,
    };
}

export async function crawlAndGenerateMocks(url: string): Promise<{
  crawlResult: CrawlResult;
  mockedPages: MockPage[];
}> {
  const baseUrl = new URL(url).origin ? `${new URL(url).protocol}//${new URL(url).hostname}` : url;

  const homeHtml = await fetchPage(url);
  if (!homeHtml) {
    throw new Error('Could not fetch the homepage. The site may be blocking automated requests.');
  }

  const pageUrls = discoverCorePages(homeHtml, url);
  const crawlResult: CrawlResult = {
    baseUrl,
    totalPages: pageUrls.length,
    pages: pageUrls.map(u => ({ url: u, title: new URL(u).pathname.replace(/^\//, '') || 'Home' })),
  };

  const mockedPages: MockPage[] = [];

  for (let i = 0; i < pageUrls.length; i++) {
    const pageUrl = pageUrls[i];
    const html = await fetchPage(pageUrl);
    const pageData: PageData = html
      ? extractPageStructure(html, pageUrl)
      : {
          url: pageUrl,
          title: crawlResult.pages[i]?.title || new URL(pageUrl).hostname,
          navItems: [],
          heroText: crawlResult.pages[i]?.title || new URL(pageUrl).hostname,
          heroSubtext: '',
          sections: [],
          footerLinks: [],
          componentCount: 0,
          images: [],
          colors: { primary: '#6366f1', background: '#ffffff', text: '#000000' },
          siteType: 'general',
          description: '',
        };

    let mock;
    try {
      const prompt = buildMockPrompt(pageData);
      const raw = await callLLM(prompt);
      mock = parseMock(raw);
    } catch {
      mock = buildFallbackMock(pageData);
    }

    mockedPages.push({ url: pageUrl, title: pageData.title, mock });
  }

  return { crawlResult, mockedPages };
}
