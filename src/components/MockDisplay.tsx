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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
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

        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
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

      <main className="mx-auto max-w-7xl px-4 py-6">
        {active && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OriginalSite url={active.url} />
            <GeneratedMock result={active.mock} url={active.url} />
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Comparing original site vs AI-generated mock · Pages identified: {crawlResult.totalPages}
        </p>
      </main>
    </div>
  );
}

function OriginalSite({ url }: { url: string }) {
  const screenshotUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&access_key=free`;

  return (
    <div className="rounded-3xl border border-[#1e1e2e] bg-[#13131f] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[#1e1e2e] bg-[#0d0d14] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
        <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
        <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        <div className="ml-3 flex-1 truncate rounded-lg bg-[#13131f] px-3 py-1.5 text-xs text-gray-400">
          {url}
        </div>
        <span className="shrink-0 text-xs font-medium text-indigo-400">Original Site</span>
      </div>

      <div className="relative" style={{ minHeight: '600px' }}>
        <img
          src={screenshotUrl}
          alt={`Screenshot of ${url}`}
          className="w-full h-auto max-h-[600px] object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function GeneratedMock({ result, url }: { result: MockResult; url: string }) {
  const { navbar, hero, sections, footer, colorScheme, images } = result;
  const primary = colorScheme?.primary || '#6366f1';
  const background = colorScheme?.background || '#ffffff';
  const text = colorScheme?.text || '#000000';
  const darkerPrimary = primary + 'cc';

  return (
    <div className="rounded-3xl border border-[#1e1e2e] bg-[#13131f] overflow-hidden shadow-xl">
      <div className="flex items-center gap-2 border-b border-[#1e1e2e] bg-[#0d0d14] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
        <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
        <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        <div className="ml-3 flex-1 truncate rounded-lg bg-[#13131f] px-3 py-1.5 text-xs text-gray-400">
          {url}
        </div>
        <span className="shrink-0 text-xs font-medium text-indigo-400">Generated Mock</span>
      </div>

      <div style={{ backgroundColor: background }}>
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
            background: `linear-gradient(135deg, ${primary}, ${darkerPrimary})`,
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
              style={{ backgroundColor: primary }}
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

        {images && images.length > 0 && (
          <section className="px-6 py-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Crawled image ${i + 1}`}
                  className="rounded-xl w-full object-cover"
                  style={{ maxHeight: '300px' }}
                />
              ))}
            </div>
          </section>
        )}

        {sections.map((section, i) => (
          <SectionBlock
            key={i}
            section={section}
            primary={primary}
            background={background}
            text={text}
            index={i}
            allSections={sections}
            url={url}
          />
        ))}

        <footer
          className="px-6 py-8"
          style={{ backgroundColor: background !== '#ffffff' ? background : '#0d0d14' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-lg font-bold" style={{ color: primary }}>
                {navbar.logo}
              </span>
              <p className="mt-1 text-sm" style={{ color: text === '#000000' ? '#6b7280' : text + '99' }}>
                {footer.tagline}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: text === '#000000' ? '#6b7280' : text + '99' }}>
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
  background,
  text,
  index,
  allSections,
  url,
}: {
  section: MockResult['sections'][number];
  primary: string;
  background: string;
  text: string;
  index: number;
  allSections: MockResult['sections'];
  url: string;
}) {
  const bg = index % 2 === 0 ? background : (background === '#ffffff' ? '#f3f4f6' : background);
  const textColor = text === '#000000' ? '#1f2937' : text;
  const mutedColor = text === '#000000' ? '#6b7280' : text + '99';

  if (section.type === 'features') {
    const featureItems = allSections.slice(0, 3);
    return (
      <section className="px-6 py-14" style={{ backgroundColor: bg }}>
        <h3 className="text-center text-2xl font-bold" style={{ color: textColor }}>{section.title}</h3>
        <p className="mx-auto mt-2 max-w-2xl text-center" style={{ color: mutedColor }}>
          {section.description}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {featureItems.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border p-6"
              style={{ borderColor: primary + '33', backgroundColor: bg }}
            >
              <div className="text-2xl" style={{ color: primary }}>✦</div>
              <h4 className="mt-3 font-semibold" style={{ color: textColor }}>{s.title}</h4>
              <p className="mt-2 text-sm" style={{ color: mutedColor }}>{s.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'cta') {
    return (
      <section className="px-6 py-16 text-center" style={{ backgroundColor: bg }}>
        <h3 className="text-2xl font-bold" style={{ color: textColor }}>{section.title}</h3>
        <p className="mx-auto mt-2 max-w-xl" style={{ color: mutedColor }}>{section.description}</p>
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
        <h3 className="text-2xl font-bold" style={{ color: textColor }}>{section.title}</h3>
        <p className="mt-3" style={{ color: mutedColor }}>{section.description}</p>
        <div className="mt-6 flex items-center gap-4 rounded-xl border p-5" style={{ borderColor: primary + '33', backgroundColor: bg }}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: primary + '22' }}>
            <svg className="h-6 w-6" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" style={{ color: textColor }}>{url}</p>
            <p className="truncate text-xs" style={{ color: mutedColor }}>{section.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
