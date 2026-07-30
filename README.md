# Omnisavant URL Mock Generator

A static React, TypeScript, and Tailwind CSS application that turns a public application URL into an inspectable mock set. It maps the core journey, identifies repeatable UI patterns, produces responsive static page previews, and exports a transparent mock specification.

## What it demonstrates

- A bounded crawl plan instead of a single generic screen
- A route inventory with captured versus inferred confidence
- Desktop and mobile previews for each core page
- A component inventory, design-token extraction, and primary user flows
- A JSON export containing the reconstruction evidence and assumptions
- A GitHub scenario that shows how a complex application is represented across landing, repository, issues, pull requests, and profile surfaces

## Create a mock

1. Paste a public URL into the URL field.
2. Select **Crawl & Mock**.
3. Review the discovered core pages in the left-hand crawl plan.
4. Switch between desktop and mobile previews, then inspect the fidelity report and component inventory.
5. Add captured HTML, navigation labels, or notes when a site is authenticated or protected, then run again for a more evidence-led reconstruction.
6. Select **Export mock report** to download the resulting JSON specification.

## Local development

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

To create an optimised production build:

```bash
npm run build
```

## Static browser constraints

This is intentionally frontend-only: no backend, database, or automated browser service is required for the demo. Browsers block many cross-origin requests, authenticated pages, and bot-protected sites. For that reason the app is explicit about which routes are captured and which are inferred, and it provides an evidence field for user-supplied page detail.

A production crawler would move fetching and authenticated Playwright sessions to a server-side worker. The visible workspace, mock format, fidelity reporting, and page reconstruction flow are designed around that production architecture without hiding the constraints of a static demo.

## API key note

The current static demonstration does not require an API key. `.env` remains ignored by Git and should never be committed. Keep `.env.example` only as a safe template when adding optional AI analysis in the future.

## Deployment

Deploy as a Vite application on Vercel. The included `vercel.json` supports SPA routing.
