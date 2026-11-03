import { Collection, Reference, ColorPaletteItem } from '../types/reference';

export interface SharedReferenceItem {
  id: string;
  title: string;
  url?: string;
  domain?: string;
  screenshotUrl?: string;
  palette?: ColorPaletteItem[];
  tags?: string[];
  notesMarkdown?: string;
}

export interface SharedCollectionData {
  version: 1;
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  authorName?: string;
  references: SharedReferenceItem[];
}

/**
 * Encodes a SharedCollectionData object into a URL-safe Base64 string.
 * Uses TextEncoder and standard base64 encoding to handle UTF-8 cleanly.
 */
export function encodeSharedCollection(data: SharedCollectionData): string {
  try {
    const jsonStr = JSON.stringify(data);
    // Browser / Node safe UTF-8 base64
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      const bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return encodeURIComponent(window.btoa(binary));
    } else {
      return encodeURIComponent(Buffer.from(jsonStr, 'utf-8').toString('base64'));
    }
  } catch (err) {
    console.error('Failed to encode shared collection data:', err);
    return '';
  }
}

/**
 * Decodes a URL-safe Base64 string back into SharedCollectionData.
 */
export function decodeSharedCollection(encoded: string): SharedCollectionData | null {
  try {
    const cleanStr = decodeURIComponent(encoded);
    let jsonStr = '';
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      const binary = window.atob(cleanStr);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      jsonStr = new TextDecoder().decode(bytes);
    } else {
      jsonStr = Buffer.from(cleanStr, 'base64').toString('utf-8');
    }

    const parsed = JSON.parse(jsonStr) as SharedCollectionData;
    if (parsed && parsed.id && parsed.name && Array.isArray(parsed.references)) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Could not decode shared collection:', err);
    return null;
  }
}

/**
 * Generates the full public shareable URL for a collection.
 * Saves the collection payload into localStorage as a zero-latency fallback.
 */
export function generateCollectionShareUrl(
  collection: Collection,
  references: Reference[],
  authorName?: string
): string {
  const collectionRefs = references.filter((r) => r.collectionIds?.includes(collection.id));

  // Sanitize references to avoid bloated payloads (strip massive data: URLs if over 200KB)
  const sanitizedRefs: SharedReferenceItem[] = collectionRefs.map((r) => {
    let screenshot = r.screenshotUrl;
    if (screenshot && screenshot.startsWith('data:') && screenshot.length > 200000) {
      // In case of huge inline base64 images that exceed URL lengths, leave fallback or domain screenshot
      screenshot = undefined;
    }
    return {
      id: r.id,
      title: r.title,
      url: r.url,
      domain: r.domain,
      screenshotUrl: screenshot,
      palette: r.palette,
      tags: r.tags,
      notesMarkdown: r.notesMarkdown,
    };
  });

  const payload: SharedCollectionData = {
    version: 1,
    id: collection.id,
    name: collection.name,
    description: collection.description,
    createdAt: collection.createdAt,
    authorName: authorName || 'Curador Salvei',
    references: sanitizedRefs,
  };

  // Local cache for instant retrieval in same browser
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`salvei_public_collection_${collection.id}`, JSON.stringify(payload));
    } catch {
      // ignore storage quota error
    }
  }

  const encoded = encodeSharedCollection(payload);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://salvei.app';
  return `${origin}/?share=collection&id=${encodeURIComponent(collection.id)}#c=${encoded}`;
}

/**
 * Inspects the current URL for public collection parameters.
 */
export function parseShareFromLocation(): {
  isShared: boolean;
  collectionId: string | null;
  data: SharedCollectionData | null;
} {
  if (typeof window === 'undefined') {
    return { isShared: false, collectionId: null, data: null };
  }

  const params = new URLSearchParams(window.location.search);
  const shareType = params.get('share');
  const collectionId = params.get('id');

  if (shareType !== 'collection' || !collectionId) {
    return { isShared: false, collectionId: null, data: null };
  }

  // 1. Try decoding from hash (#c=... or #data=...)
  const hash = window.location.hash;
  if (hash) {
    const match = hash.match(/#(?:c|data)=([^&]+)/);
    if (match && match[1]) {
      const decoded = decodeSharedCollection(match[1]);
      if (decoded) {
        return { isShared: true, collectionId, data: decoded };
      }
    }
  }

  // 2. Fallback to localStorage
  try {
    const stored = localStorage.getItem(`salvei_public_collection_${collectionId}`);
    if (stored) {
      const parsed = JSON.parse(stored) as SharedCollectionData;
      return { isShared: true, collectionId, data: parsed };
    }
  } catch {
    // ignore
  }

  return { isShared: true, collectionId, data: null };
}

/**
 * Generates a self-contained, standalone single-file HTML moodboard document.
 * Includes interactive color swatch copying, tag filters, modal inspection, and responsive layout.
 */
export function generateStandaloneMoodboardHtml(
  collection: Collection,
  references: Reference[]
): string {
  const collectionRefs = references.filter((r) => r.collectionIds?.includes(collection.id));
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Collect all unique tags
  const tagsSet = new Set<string>();
  collectionRefs.forEach((r) => r.tags?.forEach((t) => tagsSet.add(t)));
  const uniqueTags = Array.from(tagsSet).sort();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(collection.name)} — Moodboard Salvei</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0B0C0E;
      --card-bg: #14161B;
      --border: #222630;
      --border-hover: #363B47;
      --text-main: #F3F4F6;
      --text-muted: #9CA3AF;
      --text-dim: #6B7280;
      --accent: #4A4CFF;
      --accent-hover: #585BFF;
    }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
      padding: 32px 24px;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 32px;
      margin-bottom: 36px;
    }
    .badge-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      font-size: 18px;
      letter-spacing: -0.03em;
      color: #FFF;
      text-decoration: none;
    }
    .pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(74, 76, 255, 0.12);
      color: #7B7DFF;
      border: 1px solid rgba(74, 76, 255, 0.25);
    }
    h1 {
      font-size: clamp(28px, 4vw, 44px);
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.15;
      margin-bottom: 12px;
      color: #FFF;
    }
    p.desc {
      font-size: 15px;
      color: var(--text-muted);
      max-width: 720px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--text-dim);
    }
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 32px;
      align-items: center;
    }
    .filter-btn {
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-btn:hover {
      border-color: var(--border-hover);
      color: var(--text-main);
    }
    .filter-btn.active {
      background: #FFF;
      color: #000;
      border-color: #FFF;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: var(--border-hover);
      box-shadow: 0 12px 30px rgba(0,0,0,0.5);
    }
    .thumb-wrap {
      width: 100%;
      height: 220px;
      background: #191B22;
      overflow: hidden;
      position: relative;
    }
    .thumb-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .card:hover .thumb-wrap img {
      transform: scale(1.03);
    }
    .domain-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(11, 12, 14, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #E2E8F0;
    }
    .content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }
    .title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }
    .swatches {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }
    .swatch {
      width: 22px;
      height: 22px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      position: relative;
      transition: transform 0.15s ease;
    }
    .swatch:hover {
      transform: scale(1.2);
      z-index: 2;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--text-dim);
    }
    footer {
      margin-top: auto;
      border-top: 1px solid var(--border);
      padding: 40px 24px;
      text-align: center;
      font-size: 13px;
      color: var(--text-dim);
    }
    footer a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }
    footer a:hover {
      text-decoration: underline;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #FFF;
      color: #000;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 6px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 999;
    }
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge-bar">
        <a href="https://salvei.app" class="brand" target="_blank" rel="noreferrer">
          <svg width="24" height="24" viewBox="0 0 120 120" fill="none">
            <path d="M 74.4 0.0 L 79.76 0.6 C 84 2 86 6 86 11 L 86 17 C 82 20 78 24 78 32 C 78 37 81 40 85 41 L 76 43 L 26.2 55.8 C 22 57 17 56 13 52 C 8 47 6 42 6 34 L 6 27 C 9 20 16 16 23 14 L 68 2.5 Z" fill="#4A4CFF" />
            <path d="M 25.6 104.0 L 20.24 103.4 C 16 102 14 98 14 93 L 14 87 C 18 84 22 80 22 72 C 22 67 19 64 15 63 L 24 61 L 73.8 48.2 C 78 47 83 48 87 52 C 92 57 94 62 94 70 L 94 77 C 91 84 84 88 77 90 L 32 101.5 Z" fill="#3032D6" />
          </svg>
          salvei
        </a>
        <span class="pill">MOODBOARD & CURADORIA</span>
      </div>

      <h1>${escapeHtml(collection.name)}</h1>
      ${collection.description ? `<p class="desc">${escapeHtml(collection.description)}</p>` : ''}

      <div class="meta-row">
        <span>[ ${collectionRefs.length} referências ]</span>
        <span>•</span>
        <span>Exportado em ${dateStr}</span>
      </div>
    </header>

    ${
      uniqueTags.length > 0
        ? `<div class="filter-bar">
        <button class="filter-btn active" data-tag="all">Todas (${collectionRefs.length})</button>
        ${uniqueTags
          .map(
            (tag) => `<button class="filter-btn" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`
          )
          .join('')}
      </div>`
        : ''
    }

    <div class="grid" id="referenceGrid">
      ${collectionRefs
        .map((ref) => {
          const tagsStr = (ref.tags || []).join(' ');
          const thumb = ref.screenshotUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
          return `
      <div class="card" data-tags="${escapeHtml(tagsStr)}" onclick="window.open('${escapeHtml(ref.url || '#')}', '_blank')">
        <div class="thumb-wrap">
          <img src="${escapeHtml(thumb)}" alt="${escapeHtml(ref.title)}" loading="lazy">
          <span class="domain-badge">${escapeHtml(ref.domain || 'link')}</span>
        </div>
        <div class="content">
          <div class="title">${escapeHtml(ref.title)}</div>
          ${
            ref.tags && ref.tags.length > 0
              ? `<div class="tags">${ref.tags
                  .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
                  .join(' ')}</div>`
              : ''
          }
          ${
            ref.palette && ref.palette.length > 0
              ? `<div class="swatches" onclick="event.stopPropagation()">
              ${ref.palette
                .slice(0, 5)
                .map(
                  (c) =>
                    `<div class="swatch" style="background-color: ${escapeHtml(
                      c.hex
                    )}" title="Copiar ${escapeHtml(c.hex)}" onclick="copyColor('${escapeHtml(
                      c.hex
                    )}')"></div>`
                )
                .join('')}
            </div>`
              : ''
          }
        </div>
      </div>`;
        })
        .join('')}
    </div>
  </div>

  <footer>
    Curado com carinho no <a href="https://salvei.app" target="_blank" rel="noreferrer">Salvei</a> — O acervo visual para designers e desenvolvedores.
  </footer>

  <div id="toast" class="toast">Cor copiada!</div>

  <script>
    function copyColor(hex) {
      navigator.clipboard.writeText(hex).then(() => {
        const toast = document.getElementById('toast');
        toast.textContent = 'Hex copiado: ' + hex;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      });
    }

    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tag = btn.getAttribute('data-tag');
        cards.forEach(card => {
          if (tag === 'all') {
            card.style.display = 'flex';
          } else {
            const cardTags = card.getAttribute('data-tags') || '';
            card.style.display = cardTags.includes(tag) ? 'flex' : 'none';
          }
        });
      });
    });
  </script>
</body>
</html>`;
}

/**
 * Initiates the download of the standalone HTML file in the user's browser.
 */
export function downloadStandaloneMoodboard(collection: Collection, references: Reference[]): void {
  const html = generateStandaloneMoodboardHtml(collection, references);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = collection.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  a.href = url;
  a.download = `salvei-moodboard-${safeName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
