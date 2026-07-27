# URL Mock Generator

A tool that crawls any public website and automatically generates
visual mocks of its core pages.


Live Demo : https://url-mock-generator.vercel.app/

## How to Create a Mock

1. Open the live app: url-mock-generator.vercel.app
2. Paste any public URL (e.g. https://github.com)
3. Click "Crawl & Mock"
4. The tool crawls the real website and extracts:
   - Real page titles and content
   - Real brand colors
   - Real navigation structure
   - Real sections and layout
5. View generated mocks for each core page
6. Click "View Crawl Report" to see what was extracted

## How it Works

1. URL submitted by user
2. Vercel serverless function fetches the real HTML
3. Real content extracted: colors, nav, hero, sections, footer
4. Groq AI generates a polished mock from the real data
5. Mock displayed with real brand colors and content

## How to Run Locally

1. Clone the repo
2. npm install
3. Create .env: VITE_GROQ_KEY=your-key
4. npm run dev

## How to Deploy on Vercel

1. Push to GitHub
2. Import in Vercel
3. Add VITE_GROQ_KEY environment variable
4. Deploy — serverless proxy deploys automatically

## Example URLs

- https://github.com
- https://tailwindcss.com
- https://vitejs.dev
- https://react.dev

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Vite
- Vercel serverless functions (proxy)
- Groq AI (Llama 3.3) for mock generation
- Vercel (deployment)