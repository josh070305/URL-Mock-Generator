import type { PageData, Section, NavItem } from '../types';

function extractColors(doc: Document): { primary: string; background: string; text: string } {
  let primary = '#6366f1';
  let background = '#ffffff';
  let text = '#000000';

  try {
    const themeColor = doc.querySelector('meta[name="theme-color"]')?.getAttribute('content');
    if (themeColor) primary = themeColor;

    const styles = Array.from(doc.querySelectorAll('style'));
    for (const style of styles) {
      const content = style.textContent || '';
      
      const primaryMatch = content.match(/--(?:primary|brand|accent|color-primary)[^:]*:\s*(#[0-9a-fA-F]{3,6}|rgb[^;]+)/);
      if (primaryMatch) primary = primaryMatch[1];
      
      const bgMatch = content.match(/--(?:background|bg|surface)[^:]*:\s*(#[0-9a-fA-F]{3,6})/);
      if (bgMatch) background = bgMatch[1];

      const textMatch = content.match(/--(?:text|foreground|color-text)[^:]*:\s*(#[0-9a-fA-F]{3,6})/);
      if (textMatch) text = textMatch[1];
    }

    const links = doc.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
    links.forEach(link => {
      const color = link.getAttribute('color');
      if (color) primary = color;
    });

  } catch { /* use defaults */ }

  return { primary, background, text };
}

function detectSiteType(doc: Document, url: string): string {
  const html = doc.body?.innerHTML?.toLowerCase() || '';
  const hostname = new URL(url).hostname;

  if (html.includes('pricing') && html.includes('plan')) return 'saas';
  if (html.includes('product') && html.includes('cart')) return 'ecommerce';
  if (html.includes('article') || html.includes('blog') || html.includes('post')) return 'blog';
  if (html.includes('documentation') || html.includes('sidebar') || hostname.includes('docs')) return 'docs';
  if (html.includes('portfolio') || html.includes('project')) return 'portfolio';
  return 'general';
}

export function extractPageStructure(html: string, url: string): PageData {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.title?.trim() || 
      doc.querySelector('h1')?.textContent?.trim() || 
      new URL(url).hostname;

    const description = doc.querySelector('meta[name="description"]')
      ?.getAttribute('content')?.trim() || '';

    const navItems: NavItem[] = [];
    const navSelectors = 'nav a, header a, [role="navigation"] a';
    doc.querySelectorAll(navSelectors).forEach(a => {
      if (navItems.length >= 8) return;
      const label = a.textContent?.trim();
      const href = a.getAttribute('href');
      if (label && href && label.length > 0 && label.length < 40) {
        navItems.push({ label, url: href });
      }
    });

    const heroEl = doc.querySelector(
      '.hero, [class*="hero"], [class*="banner"], [class*="jumbotron"], header'
    );
    const heroText = heroEl?.querySelector('h1, h2')?.textContent?.trim() ||
      doc.querySelector('h1')?.textContent?.trim() ||
      title;
    
    const heroSubtext = heroEl?.querySelector('p, h3')?.textContent?.trim() ||
      doc.querySelector('h1 + p, h2 + p, .subtitle, .tagline')?.textContent?.trim() ||
      description;

    const sections: Section[] = [];
    const sectionEls = doc.querySelectorAll(
      'section, article, [class*="section"], [class*="feature"], [class*="block"]'
    );
    
    sectionEls.forEach(el => {
      if (sections.length >= 6) return;
      const heading = el.querySelector('h2, h3, h4')?.textContent?.trim();
      const content = el.querySelector('p')?.textContent?.trim();
      if (heading && content && heading.length < 100 && content.length > 10) {
        let type: 'hero' | 'features' | 'content' | 'cta' | 'footer' = 'content';
        const elClass = el.className.toLowerCase();
        if (elClass.includes('feature')) type = 'features';
        else if (elClass.includes('cta') || elClass.includes('action')) type = 'cta';
        sections.push({ heading, content, type });
      }
    });

    const footerLinks: string[] = [];
    doc.querySelectorAll('footer a').forEach(a => {
      if (footerLinks.length >= 8) return;
      const text = a.textContent?.trim();
      if (text && text.length > 0 && text.length < 30) {
        footerLinks.push(text);
      }
    });

    const images: string[] = [];
    doc.querySelectorAll('img[src]').forEach(img => {
      if (images.length >= 3) return;
      const src = img.getAttribute('src');
      if (src && (src.startsWith('http') || src.startsWith('//'))) {
        images.push(src.startsWith('//') ? 'https:' + src : src);
      }
    });

    const colors = extractColors(doc);
    const siteType = detectSiteType(doc, url);

    const componentCount = doc.querySelectorAll(
      'div, section, article, header, footer, nav, main, aside'
    ).length;

    return {
      url,
      title,
      navItems,
      heroText,
      heroSubtext,
      sections,
      footerLinks,
      componentCount,
      images,
      colors,
      siteType,
      description,
    };
  } catch {
    return {
      url,
      title: new URL(url).hostname,
      navItems: [],
      heroText: new URL(url).hostname,
      heroSubtext: 'Content could not be extracted.',
      sections: [],
      footerLinks: [],
      componentCount: 0,
      images: [],
      colors: { primary: '#6366f1', background: '#ffffff', text: '#000000' },
      siteType: 'general',
      description: '',
    };
  }
}