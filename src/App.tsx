import { useState } from 'react';
import { URLInput } from './components/URLInput';
import { CrawlProgress } from './components/CrawlProgress';
import { MockDisplay } from './components/MockDisplay';
import { CrawlReport } from './components/CrawlReport';
import { crawlAndGenerateMocks } from './utils/llmApi';
import type { AppState, CrawlResult, MockPage } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>('input');
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [mockedPages, setMockedPages] = useState<MockPage[]>([]);
  const [activeMockIndex, setActiveMockIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [progressStep, setProgressStep] = useState(0);

  const resetToInput = () => {
    setAppState('input');
    setCrawlResult(null);
    setMockedPages([]);
    setActiveMockIndex(0);
    setShowReport(false);
    setErrorMessage('');
    setCurrentUrl('');
    setProgressStep(0);
  };

  const handleCrawl = async (submittedUrl: string) => {
    setAppState('crawling');
    setErrorMessage('');
    setCurrentUrl(submittedUrl);
    setProgressStep(0);

    try {
      setProgressStep(1);
      await new Promise(r => setTimeout(r, 800));
      setProgressStep(2);
      await new Promise(r => setTimeout(r, 800));
      setProgressStep(3);
      await new Promise(r => setTimeout(r, 800));
      setProgressStep(4);

      const result = await crawlAndGenerateMocks(submittedUrl);
      
      setProgressStep(5);
      setCrawlResult(result.crawlResult);
      setMockedPages(result.mockedPages);
      setActiveMockIndex(0);
      setAppState('done');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not generate mock. Please try again.'
      );
      setAppState('error');
    }
  };

  if (appState === 'input') {
    return <URLInput onSubmit={handleCrawl} />;
  }

  if (appState === 'crawling') {
    return <CrawlProgress url={currentUrl} currentStep={progressStep} />;
  }

  if (appState === 'error') {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-3xl border border-[#1e1e2e] bg-[#13131f] p-8">
          <p className="text-sm uppercase tracking-widest text-red-400">Error</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Could not generate mock</h2>
          <p className="mt-3 text-gray-400">{errorMessage}</p>
          <button
            onClick={resetToInput}
            className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400 transition-colors duration-200"
          >
            Try Another URL
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {crawlResult && (
        <MockDisplay
          mockedPages={mockedPages}
          crawlResult={crawlResult}
          onViewReport={() => setShowReport(true)}
          onCrawlAnother={resetToInput}
          activeIndex={activeMockIndex}
          onSelectMock={setActiveMockIndex}
        />
      )}
      {crawlResult && showReport && (
        <CrawlReport
          crawlResult={crawlResult}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}

export default App;
