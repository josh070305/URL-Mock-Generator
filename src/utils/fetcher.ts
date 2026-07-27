export async function fetchPage(url: string): Promise<string | null> {
  try {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(proxyUrl, { 
      signal: controller.signal 
    });
    clearTimeout(timer);
    
    if (!response.ok) return null;
    
    const text = await response.text();
    return text && text.length > 200 ? text : null;
  } catch {
    return null;
  }
}

export function discoverCorePages(html: string, baseUrl: string): string[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const base = new URL(baseUrl);
    const seen = new Set<string>();
    const pages: string[] = [baseUrl];
    seen.add(base.pathname);

    const skipPatterns = [
      'login', 'signup', 'register', 'auth', 'signin', 'logout',
      'admin', 'dashboard', 'account', 'profile', 'settings',
      '#', 'javascript:', 'mailto:', 'tel:', '.pdf', '.zip',
      '.png', '.jpg', '.svg', '.ico', '.css', '.js'
    ];

    const selectors = [
      'nav a', 'header a', '[role="navigation"] a',
      '.nav a', '.navbar a', '.menu a', '.navigation a',
      '[class*="nav"] a', '[class*="menu"] a', '[class*="header"] a'
    ].join(', ');

    const navAnchors = doc.querySelectorAll(selectors);

    for (const anchor of navAnchors) {
      if (pages.length >= 5) break;
      const href = anchor.getAttribute('href');
      if (!href) continue;
      if (skipPatterns.some(p => href.toLowerCase().includes(p))) continue;
      try {
        const resolved = new URL(href, baseUrl);
        if (resolved.hostname !== base.hostname) continue;
        if (seen.has(resolved.pathname)) continue;
        if (resolved.pathname === '/') continue;
        seen.add(resolved.pathname);
        pages.push(resolved.toString());
      } catch { continue; }
    }

    if (pages.length === 1) {
      const allAnchors = doc.querySelectorAll('a[href]');
      for (const anchor of allAnchors) {
        if (pages.length >= 5) break;
        const href = anchor.getAttribute('href');
        if (!href) continue;
        if (skipPatterns.some(p => href.toLowerCase().includes(p))) continue;
        try {
          const resolved = new URL(href, baseUrl);
          if (resolved.hostname !== base.hostname) continue;
          if (seen.has(resolved.pathname)) continue;
          if (resolved.pathname === '/') continue;
          seen.add(resolved.pathname);
          pages.push(resolved.toString());
        } catch { continue; }
      }
    }

    return pages;
  } catch {
    return [baseUrl];
  }
}