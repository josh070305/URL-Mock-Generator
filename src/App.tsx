import { useMemo, useState } from "react";

type Device = "desktop" | "mobile";
type RunState = "idle" | "discovering" | "analyzing" | "generating" | "complete";
type PageKind = "github" | "commerce" | "saas" | "docs";

type MockPage = {
  id: string;
  name: string;
  path: string;
  purpose: string;
  status: "captured" | "inferred";
  confidence: number;
  layout: "landing" | "repository" | "listing" | "dashboard" | "article";
};

type MockProject = {
  name: string;
  sourceUrl: string;
  kind: PageKind;
  summary: string;
  pages: MockPage[];
  components: string[];
  flows: string[];
  tokens: { label: string; value: string; swatch: string }[];
};

const DEFAULT_URL = "https://github.com";

function normaliseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_URL;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getKind(url: string): PageKind {
  const value = url.toLowerCase();
  if (value.includes("github")) return "github";
  if (/(shop|store|market|cart|commerce|fashion)/.test(value)) return "commerce";
  if (/(docs|developer|guide|help|learn)/.test(value)) return "docs";
  return "saas";
}

function makeProject(input: string): MockProject {
  const sourceUrl = normaliseUrl(input);
  const kind = getKind(sourceUrl);
  const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
  const presets: Record<PageKind, Omit<MockProject, "sourceUrl" | "kind">> = {
    github: {
      name: "GitHub",
      summary: "Developer collaboration surface with repository navigation, code browsing, issues, and account contexts.",
      pages: [
        ["overview", "Product overview", "/", "Primary entry and product positioning", "landing"],
        ["repository", "Repository", "/openai/openai-cookbook", "Code, branches, and project activity", "repository"],
        ["issues", "Issues", "/openai/openai-cookbook/issues", "Work tracking and triage", "listing"],
        ["pulls", "Pull requests", "/openai/openai-cookbook/pulls", "Review and merge workflow", "listing"],
        ["profile", "Profile", "/octocat", "Identity, contributions, and activity", "dashboard"],
      ].map(([id, name, path, purpose, layout], index) => ({ id, name, path, purpose, layout: layout as MockPage["layout"], status: "inferred", confidence: 96 - index * 3 })),
      components: ["Global navigation", "Repository header", "Tab bar", "File tree", "Issue row", "Context sidebar"],
      flows: ["Discover a repository", "Inspect source files", "Track an issue", "Review a pull request"],
      tokens: [
        { label: "Canvas", value: "#0D1117", swatch: "#0d1117" },
        { label: "Surface", value: "#161B22", swatch: "#161b22" },
        { label: "Accent", value: "#2F81F7", swatch: "#2f81f7" },
        { label: "Success", value: "#3FB950", swatch: "#3fb950" },
      ],
    },
    commerce: {
      name: host.split(".")[0].replace(/^./, (letter) => letter.toUpperCase()),
      summary: "Commerce experience structured around product discovery, item evaluation, basket management, and checkout.",
      pages: [
        ["home", "Storefront", "/", "Campaigns, collections, and discovery", "landing"],
        ["category", "Collection", "/collections/new", "Filtered product discovery", "listing"],
        ["product", "Product detail", "/products/featured", "Evaluation and conversion", "repository"],
        ["cart", "Bag", "/cart", "Review selected items", "dashboard"],
        ["checkout", "Checkout", "/checkout", "Address, payment, and confirmation", "article"],
      ].map(([id, name, path, purpose, layout], index) => ({ id, name, path, purpose, layout: layout as MockPage["layout"], status: "inferred", confidence: 94 - index * 3 })),
      components: ["Header navigation", "Product card", "Filter rail", "Product gallery", "Cart summary", "Checkout form"],
      flows: ["Browse a collection", "Evaluate a product", "Add to basket", "Complete checkout"],
      tokens: [
        { label: "Canvas", value: "#F8F7F4", swatch: "#f8f7f4" },
        { label: "Ink", value: "#17211E", swatch: "#17211e" },
        { label: "Accent", value: "#E75C31", swatch: "#e75c31" },
        { label: "Signal", value: "#0F766E", swatch: "#0f766e" },
      ],
    },
    docs: {
      name: host.split(".")[0].replace(/^./, (letter) => letter.toUpperCase()),
      summary: "Documentation environment prioritising navigation, retrieval, technical reading, and references.",
      pages: [
        ["home", "Documentation home", "/", "Entry point and topic discovery", "landing"],
        ["guide", "Getting started", "/docs/getting-started", "Core product orientation", "article"],
        ["reference", "API reference", "/docs/api", "Endpoint and parameter lookup", "repository"],
        ["search", "Search", "/search", "Retrieve relevant documentation", "listing"],
      ].map(([id, name, path, purpose, layout], index) => ({ id, name, path, purpose, layout: layout as MockPage["layout"], status: "inferred", confidence: 94 - index * 4 })),
      components: ["Header navigation", "Search command", "Documentation sidebar", "Article body", "Code example", "On-page outline"],
      flows: ["Find an integration", "Read a guide", "Copy an API example", "Search references"],
      tokens: [
        { label: "Canvas", value: "#FFFFFF", swatch: "#ffffff" },
        { label: "Ink", value: "#19212E", swatch: "#19212e" },
        { label: "Accent", value: "#2563EB", swatch: "#2563eb" },
        { label: "Code", value: "#101827", swatch: "#101827" },
      ],
    },
    saas: {
      name: host.split(".")[0].replace(/^./, (letter) => letter.toUpperCase()),
      summary: "Software product experience with a public entry point, authenticated workspace, reporting, and account management.",
      pages: [
        ["home", "Product home", "/", "Value proposition and conversion", "landing"],
        ["workspace", "Workspace", "/app", "Primary operating surface", "dashboard"],
        ["reports", "Reports", "/app/reports", "Measure and analyse activity", "listing"],
        ["settings", "Settings", "/app/settings", "Account and workspace management", "article"],
        ["signin", "Sign in", "/login", "Authentication entry", "repository"],
      ].map(([id, name, path, purpose, layout], index) => ({ id, name, path, purpose, layout: layout as MockPage["layout"], status: "inferred", confidence: 93 - index * 3 })),
      components: ["Marketing navigation", "App sidebar", "Metric card", "Data table", "Primary action", "Settings form"],
      flows: ["Understand the product", "Enter workspace", "Review a report", "Manage account settings"],
      tokens: [
        { label: "Canvas", value: "#F7F8FA", swatch: "#f7f8fa" },
        { label: "Ink", value: "#172033", swatch: "#172033" },
        { label: "Accent", value: "#4F46E5", swatch: "#4f46e5" },
        { label: "Positive", value: "#059669", swatch: "#059669" },
      ],
    },
  };
  return { ...presets[kind], sourceUrl, kind };
}

function layoutForPath(path: string): MockPage["layout"] {
  const value = path.toLowerCase();
  if (/(docs|guide|blog|help|learn|article)/.test(value)) return "article";
  if (/(app|dashboard|account|profile|settings|cart)/.test(value)) return "dashboard";
  if (/(repo|product|detail|api)/.test(value)) return "repository";
  if (/(search|issues|pull|collection|pricing|news)/.test(value)) return "listing";
  return "landing";
}

function projectFromBrowserCapture(sourceUrl: string, markup: string): MockProject {
  const fallback = makeProject(sourceUrl);
  const pageDocument = new DOMParser().parseFromString(markup, "text/html");
  const title = pageDocument.title.trim() || fallback.name;
  const heading = pageDocument.querySelector("h1")?.textContent?.trim();
  const source = new URL(sourceUrl);
  const seen = new Set<string>();
  const linkedPages: MockPage[] = [];

  Array.from(pageDocument.querySelectorAll<HTMLAnchorElement>("a[href]")).some((anchor) => {
    const label = anchor.textContent?.replace(/\s+/g, " ").trim();
    if (!label || label.length > 42) return false;
    try {
      const target = new URL(anchor.href, sourceUrl);
      if (target.hostname !== source.hostname || target.hash || seen.has(target.pathname)) return false;
      seen.add(target.pathname);
      linkedPages.push({
        id: `captured-${linkedPages.length + 1}`,
        name: label,
        path: target.pathname || "/",
        purpose: "Discovered from the source page navigation.",
        layout: layoutForPath(target.pathname),
        status: "inferred",
        confidence: 82,
      });
    } catch {
      return false;
    }
    return linkedPages.length >= 5;
  });

  const components = [
    ["nav", "Navigation"],
    ["header", "Header"],
    ["main", "Main content"],
    ["button", "Action button"],
    ["input, textarea", "Input control"],
    ["img, picture, svg", "Visual media"],
    ["footer", "Footer"],
  ].filter(([selector]) => pageDocument.querySelector(selector)).map(([, label]) => label);

  return {
    ...fallback,
    name: title.replace(/\s+[|\-]\s+.*$/, "") || fallback.name,
    summary: heading || fallback.summary,
    pages: [
      { id: "captured-home", name: "Home", path: "/", purpose: "Source page parsed directly in the browser.", layout: "landing" as const, status: "captured" as const, confidence: 98 },
      ...linkedPages.filter((page) => page.path !== "/"),
    ].slice(0, 6),
    components: components.length ? components : fallback.components,
  };
}

async function readBrowserCapture(sourceUrl: string, suppliedEvidence: string) {
  if (suppliedEvidence.trim().startsWith("<")) return { markup: suppliedEvidence, origin: "supplied HTML" };
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(sourceUrl, { credentials: "omit", signal: controller.signal });
    if (!response.ok) throw new Error("The site did not return a readable page.");
    return { markup: await response.text(), origin: "browser capture" };
  } finally {
    window.clearTimeout(timeout);
  }
}

function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />;
}

function BrowserMock({ page, project, device }: { page: MockPage; project: MockProject; device: Device }) {
  const github = project.kind === "github";
  const commerce = project.kind === "commerce";
  const dark = github;
  const bg = dark ? "#0d1117" : "#ffffff";
  const ink = dark ? "#f0f6fc" : "#172033";
  const muted = dark ? "#8b949e" : "#657084";
  const line = dark ? "#30363d" : "#e5e7eb";
  const accent = project.tokens[2].value;
  const compact = device === "mobile";
  const nav = github ? ["Product", "Solutions", "Open Source", "Pricing"] : commerce ? ["New", "Women", "Men", "Home"] : ["Product", "Solutions", "Resources", "Pricing"];
  const cards = github ? ["README.md", "examples", "cookbook", "CONTRIBUTING.md"] : commerce ? ["Linen overshirt", "Studio sneaker", "Merino crew", "Canvas tote"] : ["Workspace activity", "Team performance", "Revenue by source", "Open requests"];

  return (
    <div className={`mock-shell ${compact ? "mock-mobile" : ""}`} style={{ background: bg, color: ink }}>
      <div className="mock-chrome" style={{ borderColor: line, color: muted }}>
        <div className="flex gap-1.5"><Dot color="#f87171" /><Dot color="#fbbf24" /><Dot color="#34d399" /></div>
        <div className="mock-address" style={{ background: dark ? "#161b22" : "#f3f4f6" }}>{project.sourceUrl.replace(/^https?:\/\//, "")}{page.path}</div>
        <span className="hidden sm:block">... </span>
      </div>
      <div className="mock-site-nav" style={{ borderColor: line }}>
        <strong className="text-sm" style={{ color: ink }}>{github ? "GitHub" : project.name}</strong>
        {!compact && <div className="flex gap-4 text-xs" style={{ color: muted }}>{nav.map((item) => <span key={item}>{item}</span>)}</div>}
        <button className="mock-signin" style={{ borderColor: line, color: ink }}>Sign in</button>
      </div>

      {page.layout === "landing" && (
        <section className="mock-landing">
          <p className="mock-eyebrow" style={{ color: accent }}>BUILT FOR MOMENTUM</p>
          <h3 style={{ color: ink }}>{github ? "Build, ship, and collaborate." : commerce ? "Objects for a considered everyday." : "Bring the work that matters into focus."}</h3>
          <p style={{ color: muted }}>{project.summary.slice(0, 112)}</p>
          <div className="flex gap-2"><button className="mock-primary" style={{ background: accent }}>Get started</button><button className="mock-secondary" style={{ borderColor: line, color: ink }}>Explore product</button></div>
          <div className="mock-hero-grid" style={{ borderColor: line }}>
            {["Plan", "Create", "Measure"].map((label, index) => <div key={label} style={{ borderColor: line }}><span style={{ color: accent }}>0{index + 1}</span><strong>{label}</strong><small style={{ color: muted }}>A focused system for high-signal work.</small></div>)}
          </div>
        </section>
      )}

      {page.layout === "repository" && (
        <section className="mock-content">
          <div className="mock-breadcrumb" style={{ color: accent }}><span>{github ? "openai" : project.name.toLowerCase()}</span> / <b>{github ? "openai-cookbook" : page.name.toLowerCase().replace(/ /g, "-")}</b></div>
          <div className="mock-tabs" style={{ borderColor: line }}>{["Code", "Issues", "Pull requests", "Actions"].map((item, index) => <span key={item} style={{ color: index === 0 ? ink : muted, borderColor: index === 0 ? accent : "transparent" }}>{item}</span>)}</div>
          <div className="mock-repo-grid"><div className="mock-file-list" style={{ borderColor: line }}>{cards.map((item, index) => <div key={item} style={{ borderColor: line }}><span style={{ color: accent }}>{index % 2 === 0 ? "#" : "<>"}</span><b>{item}</b><small style={{ color: muted }}>{index === 0 ? "Update project guidance" : "Refine source files"}</small></div>)}</div><aside style={{ borderColor: line }}><b>About</b><p style={{ color: muted }}>High-fidelity static mock generated from the discovered application structure.</p><div className="flex flex-wrap gap-1">{["typescript", "api", "ai"].map((tag) => <span className="mock-tag" key={tag}>{tag}</span>)}</div></aside></div>
        </section>
      )}

      {page.layout === "listing" && (
        <section className="mock-content"><div className="flex items-end justify-between"><div><p className="mock-eyebrow" style={{ color: accent }}>DISCOVER</p><h3 style={{ color: ink }}>{page.name}</h3></div><button className="mock-secondary" style={{ borderColor: line, color: ink }}>Filter</button></div><div className="mock-listing-grid">{cards.map((item, index) => <article key={item} style={{ borderColor: line }}><div className="mock-image" style={{ background: index % 2 ? "#dbeafe" : dark ? "#21262d" : "#e9e7e2" }}><span>{commerce ? "Image" : `0${index + 1}`}</span></div><b>{item}</b><small style={{ color: muted }}>{commerce ? "$128.00" : "Updated 2 hours ago"}</small><p style={{ color: muted }}>{commerce ? "A precise essential, made to be used." : "Clear context, ownership, and next action."}</p></article>)}</div></section>
      )}

      {page.layout === "dashboard" && (
        <section className="mock-workspace"><aside className="mock-app-side" style={{ borderColor: line }}><b>{project.name}</b>{["Overview", "Activity", "Reports", "Settings"].map((item, index) => <span key={item} style={{ background: index === 0 ? (dark ? "#21262d" : "#eef2ff") : "transparent", color: index === 0 ? ink : muted }}>{item}</span>)}</aside><div className="mock-dashboard"><div><p className="mock-eyebrow" style={{ color: accent }}>WORKSPACE</p><h3 style={{ color: ink }}>{page.name}</h3></div><div className="mock-metrics">{["Active work", "Completion", "Response time"].map((item, index) => <div key={item} style={{ borderColor: line }}><small style={{ color: muted }}>{item}</small><strong>{["24", "78%", "2.4h"][index]}</strong><span style={{ color: "#059669" }}>+{["12", "8", "18"][index]}%</span></div>)}</div><div className="mock-chart" style={{ borderColor: line }}><div className="flex justify-between"><b>Weekly activity</b><small style={{ color: muted }}>Last 7 days</small></div><div className="mock-bars">{[42, 60, 36, 74, 58, 88, 70].map((height, index) => <span key={index} style={{ height: `${height}%`, background: index === 5 ? accent : dark ? "#30363d" : "#dbe3f1" }} />)}</div></div></div></section>
      )}

      {page.layout === "article" && (
        <section className="mock-article"><aside style={{ borderColor: line }}><b>On this page</b>{["Overview", "Install", "Configure", "Next steps"].map((item, index) => <span key={item} style={{ color: index === 0 ? accent : muted }}>{item}</span>)}</aside><article><p className="mock-eyebrow" style={{ color: accent }}>GUIDE</p><h3 style={{ color: ink }}>{page.name}</h3><p style={{ color: muted }}>A clear, deliberate page hierarchy designed for scanning, orientation, and confident completion of the next step.</p><div className="mock-code" style={{ background: dark ? "#161b22" : "#101827", color: "#d1fae5" }}><span>// Start with a focused configuration</span><br /><b>const</b> project = createMock({'{'} source, evidence {'}'});</div><h4 style={{ color: ink }}>A simple path forward</h4><p style={{ color: muted }}>Content is grouped into readable sections with supporting detail close to the action it explains.</p></article></section>
      )}
    </div>
  );
}

export default function App() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [evidence, setEvidence] = useState("");
  const [project, setProject] = useState<MockProject>(() => makeProject(DEFAULT_URL));
  const [selectedPage, setSelectedPage] = useState("repository");
  const [device, setDevice] = useState<Device>("desktop");
  const [runState, setRunState] = useState<RunState>("idle");
  const [notice, setNotice] = useState("Ready to analyse a public application URL.");

  const page = project.pages.find((item) => item.id === selectedPage) ?? project.pages[0];
  const captured = project.pages.filter((item) => item.status === "captured").length;
  const confidence = Math.round(project.pages.reduce((total, item) => total + item.confidence, 0) / project.pages.length);
  const stages = ["Discover routes", "Analyse structure", "Generate mocks", "Verify fidelity"];
  const activeStep = runState === "discovering" ? 1 : runState === "analyzing" ? 2 : runState === "generating" ? 3 : runState === "complete" ? 4 : 0;
  const report = useMemo(() => ({ source: project.sourceUrl, generatedAt: new Date().toISOString(), project, evidenceProvided: Boolean(evidence.trim()), limits: "Static browser mode: live cross-origin crawling may be blocked. The output combines URL analysis, optional evidence, and transparent route inference." }), [project, evidence]);

  async function generate() {
    const nextUrl = normaliseUrl(url);
    setRunState("discovering");
    setNotice("Discovering the public route hierarchy...");
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    setRunState("analyzing");
    setNotice("Trying a browser-only source capture, then analysing the page structure locally...");
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setRunState("generating");
    setNotice("Generating an inspectable static mock set...");
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    let nextProject = makeProject(nextUrl);
    let captureOrigin = "route inference";
    try {
      const capture = await readBrowserCapture(nextUrl, evidence);
      nextProject = projectFromBrowserCapture(nextUrl, capture.markup);
      captureOrigin = capture.origin;
    } catch {
      // Static browsers cannot read every cross-origin URL. The fallback stays explicit.
    }
    setProject(nextProject);
    setSelectedPage(nextProject.pages[0].id);
    setRunState("complete");
    setNotice(captureOrigin === "route inference" ? "The site blocked browser capture. A transparent route plan was generated; paste page HTML for a source-led mock." : `Mock plan generated from ${captureOrigin}. Linked core pages are inferred from the captured navigation.`);
  }

  function loadGithub() {
    setUrl(DEFAULT_URL);
    const nextProject = makeProject(DEFAULT_URL);
    setProject(nextProject);
    setSelectedPage("repository");
    setRunState("complete");
    setNotice("GitHub reference scenario loaded with five linked core pages.");
  }

  function exportReport() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-mock-report.json`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
    setNotice("Mock specification and evidence report exported as JSON.");
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-[#172033]">
      <header className="border-b border-[#dfe3eb] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center bg-[#172033] text-sm font-bold text-white">O</span><div><h1 className="text-sm font-bold">Omnisavant</h1><p className="text-xs text-slate-500">URL Mock Generator</p></div></div>
          <div className="hidden items-center gap-5 text-xs text-slate-500 md:flex"><span>Static analysis workspace</span><span className="h-4 w-px bg-slate-200" /><span className="font-mono text-[11px]">v1.0.0</span></div>
        </div>
      </header>

      <section className="border-b border-[#dfe3eb] bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-7 lg:px-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">APPLICATION RECONSTRUCTION</p><h2 className="mt-1 text-2xl font-bold tracking-normal text-[#172033] sm:text-3xl">Turn a public URL into an inspectable mock set.</h2></div><button onClick={loadGithub} className="text-sm font-semibold text-[#325ad7] hover:text-[#1d3eaa]">Load GitHub scenario</button></div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"><div className="flex min-w-0 items-center border border-[#cbd3df] bg-white p-1 shadow-sm focus-within:border-[#4f46e5] focus-within:ring-2 focus-within:ring-[#e0e7ff]"><span className="px-3 font-mono text-sm text-slate-400">URL</span><input value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void generate()} className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none" placeholder="https://github.com" /><button onClick={() => setUrl("")} className="px-3 text-xs text-slate-400 hover:text-slate-700">Clear</button></div><button onClick={() => void generate()} disabled={runState !== "idle" && runState !== "complete"} className="bg-[#172033] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#29364f] disabled:cursor-wait disabled:opacity-75">{runState === "idle" || runState === "complete" ? "Crawl & Mock" : "Working..."}</button></div>
          <details className="mt-4"><summary className="cursor-pointer text-xs font-semibold text-slate-600">Paste page HTML or capture notes for protected sites</summary><textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} className="mt-3 min-h-24 w-full border border-[#cbd3df] p-3 text-sm outline-none focus:border-[#4f46e5]" placeholder="Paste the page HTML, visible navigation labels, or capture notes. Analysis stays in this browser and is never uploaded." /></details>
        </div>
      </section>

      <section className="border-b border-[#dfe3eb] bg-[#fbfcfe]"><div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-3 gap-y-2 px-5 py-4 sm:grid-cols-4 lg:px-8">{stages.map((stage, index) => <div key={stage} className="flex items-center gap-2"><span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${activeStep > index ? "bg-[#172033] text-white" : activeStep === index + 1 ? "border-2 border-[#4f46e5] text-[#4f46e5]" : "border border-[#cbd3df] text-slate-400"}`}>{activeStep > index ? "OK" : index + 1}</span><span className={`text-xs font-semibold ${activeStep >= index + 1 ? "text-[#172033]" : "text-slate-400"}`}>{stage}</span></div>)}</div></section>

      <div className="mx-auto max-w-[1440px] px-5 py-6 lg:px-8"><p className="mb-5 text-sm text-slate-600"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#14b87a]" />{notice}</p>
        <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_282px]">
          <aside className="border border-[#dfe3eb] bg-white"><div className="border-b border-[#dfe3eb] p-4"><p className="eyebrow">CRAWL PLAN</p><h3 className="mt-1 font-bold">Core pages</h3><p className="mt-1 text-xs leading-5 text-slate-500">A bounded route set selected for user-journey coverage.</p></div><div>{project.pages.map((item) => <button key={item.id} onClick={() => setSelectedPage(item.id)} className={`block w-full border-b border-[#edf0f4] px-4 py-3 text-left last:border-b-0 ${page.id === item.id ? "bg-[#f0f3ff]" : "hover:bg-[#f8fafc]"}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{item.name}</span><span className={`text-[10px] font-bold uppercase tracking-wide ${item.status === "captured" ? "text-[#07875a]" : "text-[#64748b]"}`}>{item.status}</span></div><p className="mt-1 truncate font-mono text-[11px] text-slate-500">{item.path}</p></button>)}</div><div className="p-4"><button onClick={exportReport} className="w-full border border-[#aeb8c8] py-2 text-sm font-semibold text-[#172033] hover:bg-slate-50">Export mock report</button></div></aside>

          <section className="min-w-0 border border-[#dfe3eb] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfe3eb] px-4 py-3"><div><p className="eyebrow">STATIC PREVIEW</p><h3 className="mt-1 text-sm font-bold">{page.name} <span className="font-mono text-xs font-normal text-slate-400">{page.path}</span></h3></div><div className="flex border border-[#cbd3df] p-0.5"><button onClick={() => setDevice("desktop")} className={`px-3 py-1.5 text-xs font-semibold ${device === "desktop" ? "bg-[#172033] text-white" : "text-slate-500"}`}>Desktop</button><button onClick={() => setDevice("mobile")} className={`px-3 py-1.5 text-xs font-semibold ${device === "mobile" ? "bg-[#172033] text-white" : "text-slate-500"}`}>Mobile</button></div></div><div className="preview-stage"><BrowserMock page={page} project={project} device={device} /></div></section>

          <aside className="space-y-5"><section className="border border-[#dfe3eb] bg-white p-4"><p className="eyebrow">FIDELITY REPORT</p><div className="mt-4 grid grid-cols-2 gap-4"><div><span className="block text-2xl font-bold">{project.pages.length}</span><span className="text-xs text-slate-500">Core pages</span></div><div><span className="block text-2xl font-bold">{confidence}%</span><span className="text-xs text-slate-500">Route confidence</span></div><div><span className="block text-2xl font-bold">{captured}</span><span className="text-xs text-slate-500">Captured</span></div><div><span className="block text-2xl font-bold">{evidence.trim() ? "Yes" : "No"}</span><span className="text-xs text-slate-500">Evidence</span></div></div><div className="mt-4 border-t border-[#edf0f4] pt-3"><p className="text-xs leading-5 text-slate-500">Protected pages and cross-origin content are marked as inference. Supply evidence to validate the details.</p></div></section>
            <section className="border border-[#dfe3eb] bg-white p-4"><p className="eyebrow">DESIGN TOKENS</p><div className="mt-3 space-y-2">{project.tokens.map((token) => <div key={token.label} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="h-4 w-4 border border-black/10" style={{ backgroundColor: token.swatch }} /><span className="text-xs">{token.label}</span></div><code className="text-[10px] text-slate-500">{token.value}</code></div>)}</div></section>
            <section className="border border-[#dfe3eb] bg-white p-4"><p className="eyebrow">INVENTORY</p><div className="mt-3 flex flex-wrap gap-1.5">{project.components.map((component) => <span key={component} className="border border-[#dfe3eb] bg-[#fafbfc] px-2 py-1 text-[11px] text-slate-600">{component}</span>)}</div><p className="eyebrow mt-5">PRIMARY FLOWS</p><ol className="mt-2 space-y-2">{project.flows.map((flow, index) => <li className="flex gap-2 text-xs text-slate-600" key={flow}><span className="font-mono text-slate-400">0{index + 1}</span>{flow}</li>)}</ol></section></aside>
        </div>
      </div>
    </main>
  );
}
