import { useState } from 'react';
import { normalizeUrl, validateUrl } from '../utils/crawlAndMock';

interface URLInputProps {
  onSubmit: (url: string) => void;
}

const EXAMPLES = ['github.com', 'tailwindcss.com', 'vitejs.dev'];

const STEPS = [
  { icon: '🔍', label: 'Analyse URL' },
  { icon: '🗺️', label: 'Identify Core Pages' },
  { icon: '🤖', label: 'AI Generates Mocks' },
  { icon: '📄', label: 'View Results' },
];

export function URLInput({ onSubmit }: URLInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(value);
    if (!validateUrl(normalized)) return;
    onSubmit(normalized);
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full mx-auto p-8 rounded-3xl border border-[#1e1e2e] bg-[#13131f]">
        <span className="inline-block rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-400">
          Browser-Native · No Backend · AI-Powered
        </span>

        <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
          URL Mock Generator
        </h1>
        <p className="mt-4 text-gray-400">
          Paste any URL — we analyse its core pages and generate visual mocks automatically.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://github.com"
            className="w-full rounded-xl border border-[#1e1e2e] bg-[#0d0d14] px-5 py-4 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors duration-200"
            aria-label="Website URL"
          />

          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-indigo-500 px-5 py-4 font-semibold text-white hover:bg-indigo-400 transition-colors duration-200"
          >
            Crawl &amp; Mock
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          {EXAMPLES.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setValue(`https://${chip}`)}
              className="rounded-full border border-[#1e1e2e] bg-[#0d0d14] px-4 py-2 text-sm text-gray-300 hover:border-indigo-500 hover:text-white transition-colors duration-200"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.label}
              className="rounded-xl border border-[#1e1e2e] bg-[#0d0d14] p-4 text-center"
            >
              <div className="text-2xl">{step.icon}</div>
              <p className="mt-2 text-xs font-medium text-gray-300">{step.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
