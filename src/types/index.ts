export interface MockPage {
  url: string;
  title: string;
  mock: MockResult;
}

export interface MockResult {
  mockTitle: string;
  mockDescription: string;
  navbar: {
    logo: string;
    links: string[];
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaSecondary: string;
  };
  sections: {
    title: string;
    description: string;
    type: string;
  }[];
  footer: {
    tagline: string;
    links: string[];
  };
  colorScheme: {
    primary: string;
    background: string;
    text: string;
  };
}

export interface CrawlResult {
  baseUrl: string;
  totalPages: number;
  pages: {
    url: string;
    title: string;
  }[];
}

export type AppState = 'input' | 'crawling' | 'done' | 'error';

export interface ProgressStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'done';
}
