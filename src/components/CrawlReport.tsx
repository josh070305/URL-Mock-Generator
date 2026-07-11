import type { CrawlResult } from '../types';

interface CrawlReportProps {
  crawlResult: CrawlResult;
  onClose: () => void;
}

const HOW_IT_WORKS = [
  'URL submitted by user',
  'Claude AI analyses the website',
  'Core pages identified automatically',
  'Visual mock generated for each page',
];

export function CrawlReport({ crawlResult, onClose }: CrawlReportProps) {
  return (
    <aside className="fixed right-0 top-0 z-20 flex h-full w-full max-w-96 flex-col border-l border-[#1e1e2e] bg-[#13131f]">
      <div className="flex items-center justify-between border-b border-[#1e1e2e] px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Crawl Report</h2>
        <button
          onClick={onClose}
          aria-label="Close report"
          className="rounded-xl border border-[#1e1e2e] px-3 py-1.5 text-white hover:border-indigo-500 transition-colors duration-200"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-xs uppercase tracking-widest text-gray-500">Base URL</p>
        <p className="mt-1 break-all text-sm text-white">{crawlResult.baseUrl}</p>

        <p className="mt-6 text-xs uppercase tracking-widest text-gray-500">
          Total pages identified
        </p>
        <p className="mt-1 text-3xl font-bold text-indigo-400">
          {crawlResult.totalPages}
        </p>

        <p className="mt-6 text-xs uppercase tracking-widest text-gray-500">Pages</p>
        <ul className="mt-3 space-y-3">
          {crawlResult.pages.map((page) => (
            <li
              key={page.url + page.title}
              className="rounded-xl border border-[#1e1e2e] bg-[#0d0d14] p-3"
            >
              <p className="text-sm font-medium text-white">{page.title}</p>
              <p className="mt-1 break-all text-xs text-gray-500">{page.url}</p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs uppercase tracking-widest text-gray-500">
          How it works
        </p>
        <ol className="mt-3 space-y-2">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-gray-300">
              <span className="text-indigo-400">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-[#1e1e2e] px-6 py-4">
        <p className="text-xs text-gray-500">
          Mocks are AI-generated based on Claude's knowledge of the website.
        </p>
      </div>
    </aside>
  );
}
