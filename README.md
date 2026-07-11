# URL Mock Generator

A browser-native AI tool that analyses any website and automatically
generates visual mocks of its core pages.

## How to Create a Mock

1. Open the live app
2. Paste any website URL (e.g. https://github.com)
3. Click "Crawl & Mock"
4. Wait 30-60 seconds
5. View AI-generated mocks for each core page
6. Click "View Crawl Report" to see which pages were identified

## How to Run Locally

1. Clone the repo
2. Run: npm install
3. Create .env file (see .env.example). Recommended free provider is Groq:
   VITE_LLM_PROVIDER=groq
   VITE_GROQ_KEY=your-groq-key   # free key from https://console.groq.com/keys
   Other options (set VITE_LLM_PROVIDER accordingly):
     - openrouter -> VITE_OPENROUTER_KEY (https://openrouter.ai/keys)
     - gemini   -> VITE_GEMINI_KEY (https://aistudio.google.com/apikey)
     - anthropic-> VITE_ANTHROPIC_KEY (paid)
4. Run: npm run dev
5. Open: http://localhost:5173

## How to Deploy on Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables (VITE_LLM_PROVIDER + the matching provider key)
4. Deploy

## Example URLs to Try

- https://github.com
- https://tailwindcss.com
- https://vitejs.dev
- https://react.dev
- https://anthropic.com

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Vite
- LLM provider: Google Gemini (free default) or Claude (Anthropic)
- Vercel (deployment)

## Why No CORS Proxy?

Instead of fetching websites through unreliable CORS proxies,
this tool uses an LLM directly from the browser. The model analyses
the URL and generates accurate mocks based on its knowledge of the
website. This works reliably after deployment with no CORS issues.
The default provider (Gemini) is free and fully CORS-enabled.
