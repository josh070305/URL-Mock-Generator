interface CrawlProgressProps {
  url: string;
  label: string;
  currentPage: number;
  totalPages: number;
}

export function CrawlProgress({ url, label, currentPage, totalPages }: CrawlProgressProps) {
  const progressPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        <p className="text-center text-sm uppercase tracking-widest text-indigo-400">
          Crawling &amp; Generating Mocks
        </p>
        <h2 className="mt-3 text-center text-xl font-semibold text-white break-all">
          {url}
        </h2>

        <div className="mt-8 rounded-3xl border border-[#1e1e2e] bg-[#13131f] p-8">
          <div className="flex items-center gap-4">
            <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-white">{label}</span>
          </div>

          {totalPages > 0 && (
            <p className="mt-4 text-sm text-gray-400">
              Processing page {currentPage} of {totalPages}
            </p>
          )}

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#0d0d14]">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-right text-xs text-gray-500">{progressPercent}%</p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          This may take 30-60 seconds
        </p>
      </div>
    </div>
  );
}
