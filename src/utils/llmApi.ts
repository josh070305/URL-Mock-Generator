import type { PageData, MockPage, MockResult, CrawlResult } from '../types';
import { fetchPage, discoverCorePages } from './fetcher';
import { extractPageStructure } from './extractor';

function getPrompt(pageData: PageData): string {
  return `You are a UI mock generator. I have CRAWLED this real webpage and extracted its actual content. Generate a mock based ONLY on this real extracted data.

REAL CRAWLED DATA:
URL: ${pageData.url}
Title: ${pageData.title}
Description: ${pageData.description}
Hero Headline: ${pageData.heroText}
Hero Subtext: ${pageData.heroSubtext}
Nav Items: ${pageData.navItems.map(n => n.label).join(', ')}
Sections Found: ${pageData.sections.map(s => s.heading + ': ' + s.content.substring(0, 100)).join(' | ')}
Footer Links: ${pageData.footerLinks.join(', ')}
Real Brand Color: ${pageData.colors.primary}
Background Color: ${pageData.colors.background}
Site Type: ${pageData.siteType}

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
    "primary": "${pageData.colors.primary}",
    "background": "${pageData.colors.background}",
    "text": "${pageData.colors.text}"
  }
}`;
}

export async function generatePageMock(pageData: PageData): Promise<MockResult> {
  try {
    const key = import.meta.env.VITE_GROQ_KEY;
    if (!key) throw new Error('Missing VITE_GROQ_KEY — set it in your .env file.');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: getPrompt(pageData),
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Groq API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      mockTitle: pageData.title,
      mockDescription: pageData.description || pageData.heroSubtext,
      navbar: {
        logo: new URL(pageData.url).hostname.replace('www.', ''),
        links: pageData.navItems.slice(0, 4).map(n => n.label),
      },
      hero: {
        headline: pageData.heroText,
        subheadline: pageData.heroSubtext,
        ctaText: 'Get Started',
        ctaSecondary: 'Learn More',
      },
      sections: pageData.sections.slice(0, 3).map((s) => ({
        title: s.heading,
        description: s.content,
        type: s.type,
      })),
      footer: {
        tagline: pageData.title,
        links: pageData.footerLinks.slice(0, 4),
      },
      colorScheme: pageData.colors,
      images: pageData.images,
    };
  }
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

async function callGroq(prompt: string): Promise<string> {
  const key = import.meta.env.VITE_GROQ_KEY;
  if (!key) throw new Error('Missing VITE_GROQ_KEY — set it in your .env file.');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Groq API error: ${response.status} ${errorBody}`);
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

  const html = await fetchPage(url);
  if (!html) {
    const prompt = buildPrompt(url, hostname);
    const raw = await callGroq(prompt);
    return parseMock(raw);
  }

  const pages = discoverCorePages(html, url);
  const mockedPages: MockPage[] = [];

  for (const pageUrl of pages) {
    const pageHtml = await fetchPage(pageUrl);
    if (!pageHtml) continue;
    const pageData = extractPageStructure(pageHtml, pageUrl);
    const mock = await generatePageMock(pageData);
    mockedPages.push({
      url: pageUrl,
      title: pageData.title,
      mock,
    });
  }

  return {
    crawlResult: {
      baseUrl: url,
      totalPages: mockedPages.length,
      pages: mockedPages.map((p) => ({ url: p.url, title: p.title })),
    },
    mockedPages,
  };
}