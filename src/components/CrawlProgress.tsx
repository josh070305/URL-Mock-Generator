import { buildProgressSteps } from '../utils/crawlAndMock';

interface CrawlProgressProps {
  url: string;
  currentStep: number;
}

export function CrawlProgress({ url, currentStep }: CrawlProgressProps) {
  const steps = buildProgressSteps(currentStep);
  const progressPercent = Math.min(100, Math.round((currentStep / 5) * 100));

  return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        <p className="text-center text-sm uppercase tracking-widest text-indigo-400">
          Generating Mocks
        </p>
        <h2 className="mt-3 text-center text-xl font-semibold text-white break-all">
          {url}
        </h2>

        <div className="mt-8 rounded-3xl border border-[#1e1e2e] bg-[#13131f] p-8">
          <div className="space-y-5">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {step.status === 'done' ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e]">
                      ✓
                    </span>
                  ) : step.status === 'active' ? (
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  ) : (
                    <span className="h-6 w-6 rounded-full border-2 border-[#1e1e2e]" />
                  )}
                </span>
                <span
                  className={
                    step.status === 'pending'
                      ? 'text-gray-500'
                      : 'text-white'
                  }
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-[#0d0d14]">
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
