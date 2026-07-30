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
  images: string[];
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

export interface NavItem {
  label: string;
  url: string;
}

export interface Section {
  heading: string;
  content: string;
  type: 'hero' | 'features' | 'content' | 'cta' | 'footer';
}

export interface PageData {
  url: string;
  title: string;
  navItems: NavItem[];
  heroText: string;
  heroSubtext: string;
  sections: Section[];
  footerLinks: string[];
  componentCount: number;
  images: string[];
  colors: {
    primary: string;
    background: string;
    text: string;
  };
  siteType: string;
  description: string;
}
