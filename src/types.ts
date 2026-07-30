export type ExtractedContent = {
  title: string;
  summary: string;
  key_concepts: string[];
  entities: string[];
  structure: string[];
};

export type ConceptNode = {
  id: string;
  label: string;
  type: string;
};

export type ConceptEdge = {
  from: string;
  to: string;
  relationship: string;
};

export type ConceptMap = {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
};

export type AgentAction = "extract_detail" | "find_connection" | "identify_gap";

export type AgentStep = {
  thought: string;
  action: AgentAction;
  observation: string;
  confidence: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type StageState = "locked" | "ready" | "loading" | "complete" | "error";

// Retained crawler contracts from the original URL-Mock-Generator project.
export interface MockPage {
  url: string;
  title: string;
  mock: MockResult;
}

export interface MockResult {
  mockTitle: string;
  mockDescription: string;
  navbar: { logo: string; links: string[] };
  hero: { headline: string; subheadline: string; ctaText: string; ctaSecondary: string };
  sections: { title: string; description: string; type: string }[];
  footer: { tagline: string; links: string[] };
  colorScheme: { primary: string; background: string; text: string };
  images: string[];
}

export interface CrawlResult {
  baseUrl: string;
  totalPages: number;
  pages: { url: string; title: string }[];
}

export type AppState = "input" | "crawling" | "done" | "error";
export interface ProgressStep { id: number; label: string; status: "pending" | "active" | "done"; }
export interface NavItem { label: string; url: string; }
export interface Section { heading: string; content: string; type: "hero" | "features" | "content" | "cta" | "footer"; }
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
  colors: { primary: string; background: string; text: string };
  siteType: string;
  description: string;
}
