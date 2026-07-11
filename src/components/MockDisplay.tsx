import type { CrawlResult, MockPage, MockResult } from '../types';

interface MockDisplayProps {
  mockedPages: MockPage[];
  crawlResult: CrawlResult;
  onViewReport: () => void;
  onCrawlAnother: () => void;
  activeIndex: number;
  onSelectMock: (i: number) => void;
}

export function MockDisplay({
  mockedPages,
  crawlResult,
  onViewReport,
  onCrawlAnother,
  activeIndex,
  onSelectMock,
}: MockDisplayProps) {
  const active = mockedPages[activeIndex];

  return (
    <div className="min-h-screen bg-[#0d0d14]">
      <header className="sticky top-0 z-10 border-b border-[#1e1e2e] bg-[#13131f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="text-sm text-gray-400">
            Mock of:{' '}
            <span className="font-semibold text-white">{crawlResult.baseUrl}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={onViewReport}
              className="rounded-xl border border-[#1e1e2e] px-4 py-2 text-sm font-medium text-white hover:border-indigo-500 transition-colors duration-200"
            >
              View Crawl Report
            </button>
            <button
              onClick={onCrawlAnother}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors duration-200"
            >
              Crawl Another
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {mockedPages.map((page, i) => (
            <button
              key={page.url + page.title}
              onClick={() => onSelectMock(i)}
              className={
                i === activeIndex
                  ? 'shrink-0 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200'
                  : 'shrink-0 rounded-xl border border-[#1e1e2e] px-4 py-2 text-sm font-medium text-gray-300 hover:border-indigo-500 transition-colors duration-200'
              }
            >
              {page.title}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {active && <BrowserMock result={active.mock} url={active.url} />}

        <p className="mt-6 text-center text-sm text-gray-500">
          AI-generated mock · Pages identified: {crawlResult.totalPages}
        </p>
      </main>
    </div>
  );
}

function BrowserMock({ result, url }: { result: MockResult; url: string }) {
  const { navbar, hero, sections, footer, colorScheme } = result;
  const primary = colorScheme?.primary || '#6366f1';

  return (
    <div className="overflow-hidden rounded-3xl border border-[#1e1e2e] bg-[#13131f] shadow-xl">
      <div className="flex items-center gap-2 border-b border-[#1e1e2e] bg-[#0d0d14] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
        <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
        <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        <div className="ml-3 flex-1 truncate rounded-lg bg-[#13131f] px-3 py-1.5 text-xs text-gray-400">
          {url}
        </div>
      </div>

      <div>
        <nav
          className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
          style={{ backgroundColor: primary }}
        >
          <span className="text-lg font-bold text-white">{navbar.logo}</span>
          <div className="flex flex-wrap gap-4 text-sm text-white/90">
            {navbar.links.map((link) => (
              <span key={link} className="hover:text-white cursor-default">
                {link}
              </span>
            ))}
          </div>
        </nav>

        <section
          className="px-6 py-16 text-center"
          style={{
            background: `linear-gradient(135deg, ${primary}, #0d0d14)`,
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            {result.mockTitle}
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-white sm:text-4xl">
            {hero.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">{hero.subheadline}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              className="rounded-xl px-6 py-3 font-semibold text-white transition-colors duration-200"
              style={{ backgroundColor: '#0d0d14' }}
            >
              {hero.ctaText}
            </button>
            <button
              className="rounded-xl border px-6 py-3 font-semibold text-white transition-colors duration-200"
              style={{ borderColor: '#ffffff' }}
            >
              {hero.ctaSecondary}
            </button>
          </div>
        </section>

        {sections.map((section, i) => (
          <SectionBlock key={i} section={section} primary={primary} index={i} />
        ))}

        <footer className="bg-[#0d0d14] px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-lg font-bold" style={{ color: primary }}>
                {navbar.logo}
              </span>
              <p className="mt-1 text-sm text-gray-400">{footer.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {footer.links.map((link) => (
                <span key={link} className="hover:text-white cursor-default">
                  {link}
                </span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  primary,
  index,
}: {
  section: MockResult['sections'][number];
  primary: string;
  index: number;
}) {
  const bg = index % 2 === 0 ? '#13131f' : '#0d0d14';

  if (section.type === 'features') {
    return (
      <section className="px-6 py-14" style={{ backgroundColor: bg }}>
        <h3 className="text-center text-2xl font-bold text-white">{section.title}</h3>
        <p className="mx-auto mt-2 max-w-2xl text-center text-gray-400">
          {section.description}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((c) => (
            <div
              key={c}
              className="rounded-xl border border-[#1e1e2e] bg-[#0d0d14] p-6"
            >
              <div className="text-2xl" style={{ color: primary }}>
                ✦
              </div>
              <h4 className="mt-3 font-semibold text-white">{section.title}</h4>
              <p className="mt-2 text-sm text-gray-400">{section.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'cta') {
    return (
      <section
        className="px-6 py-16 text-center"
        style={{ backgroundColor: bg }}
      >
        <h3 className="text-2xl font-bold text-white">{section.title}</h3>
        <p className="mx-auto mt-2 max-w-xl text-gray-400">{section.description}</p>
        <button
          className="mt-6 rounded-xl px-6 py-3 font-semibold text-white transition-colors duration-200"
          style={{ backgroundColor: primary }}
        >
          {section.title}
        </button>
      </section>
    );
  }

  return (
    <section className="px-6 py-14" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-3xl">
        <h3 className="text-2xl font-bold text-white">{section.title}</h3>
        <p className="mt-3 text-gray-400">{section.description}</p>
        <div className="mt-6 flex h-40 items-center justify-center rounded-xl border border-dashed border-[#1e1e2e] bg-[#0d0d14] text-gray-600">
          Image placeholder
        </div>
      </div>
    </section>
  );
}
