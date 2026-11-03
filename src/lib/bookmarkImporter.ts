/**
 * SALVEI — IMPORTADOR DE FAVORITOS & BACKUPS
 * 
 * Suporta:
 * 1. Arquivos HTML de Favoritos dos principais navegadores (Chrome, Safari, Firefox, Edge, Arc)
 * 2. Arquivos JSON de Backup do Salvei (ou exportações compatíveis)
 */

import { Reference, Project, Collection } from '../types/reference';

export interface ParsedBookmark {
  title: string;
  url: string;
  domain: string;
  addDate?: string;
  tags?: string[];
}

export interface ImportedBackupData {
  references: Reference[];
  projects: Project[];
  collections: Collection[];
}

/**
 * Extrai o domínio limpo a partir de uma URL
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
}

/**
 * Faz o parsing de um arquivo HTML de favoritos no padrão universal Netscape Bookmark
 */
export function parseBookmarksHtml(htmlContent: string): ParsedBookmark[] {
  const bookmarks: ParsedBookmark[] = [];

  // Regex para capturar tags <A HREF="..." ...>Título</A>
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const rawUrl = match[1]?.trim();
    let rawTitle = match[2]?.trim() || '';

    // Limpa tags HTML internas do título (ex: <B>, <SPAN>)
    rawTitle = rawTitle.replace(/<[^>]*>/g, '').trim();

    // Filtra URLs inválidas ou de javascript/placeholders
    if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      const domain = extractDomain(rawUrl);
      bookmarks.push({
        url: rawUrl,
        title: rawTitle || domain,
        domain,
      });
    }
  }

  return bookmarks;
}

/**
 * Converte favoritos parseados em objetos de Referência do Salvei
 */
export function convertBookmarksToReferences(bookmarks: ParsedBookmark[]): Reference[] {
  const now = new Date().toISOString();

  return bookmarks.map((b, idx) => {
    return {
      id: `imported-bookmark-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      title: b.title,
      url: b.url,
      domain: b.domain,
      sourceType: 'url',
      screenshotStatus: 'none',
      tags: ['favoritos-importados'],
      notesMarkdown: `> Importado dos favoritos do navegador em ${new Date().toLocaleDateString('pt-BR')}`,
      collectionIds: [],
      projectIds: [],
      codeSnippets: [],
      relatedFiles: [],
      createdAt: now,
      updatedAt: now,
    };
  });
}

/**
 * Faz o parsing seguro de arquivo de backup JSON do Salvei
 */
export function parseBackupJson(jsonString: string): ImportedBackupData {
  const parsed = JSON.parse(jsonString);

  // Validação de formato Salvei
  const rawReferences = Array.isArray(parsed.references) ? parsed.references : (Array.isArray(parsed) ? parsed : []);
  const rawProjects = Array.isArray(parsed.projects) ? parsed.projects : [];
  const rawCollections = Array.isArray(parsed.collections) ? parsed.collections : [];

  const references: Reference[] = rawReferences.map((r: any) => ({
    id: r.id || `restored-${Math.random().toString(36).slice(2, 9)}`,
    title: r.title || 'Referência Importada',
    url: r.url,
    domain: r.domain || (r.url ? extractDomain(r.url) : undefined),
    sourceType: r.sourceType || (r.screenshotUrl && r.url ? 'both' : r.screenshotUrl ? 'image' : 'url'),
    screenshotUrl: r.screenshotUrl,
    screenshotStatus: r.screenshotStatus || (r.screenshotUrl ? 'ready' : 'none'),
    palette: Array.isArray(r.palette) ? r.palette : undefined,
    ocrText: r.ocrText,
    isFavorite: Boolean(r.isFavorite),
    tags: Array.isArray(r.tags) ? r.tags : [],
    collectionIds: Array.isArray(r.collectionIds) ? r.collectionIds : [],
    projectIds: Array.isArray(r.projectIds) ? r.projectIds : [],
    notesMarkdown: r.notesMarkdown || '',
    codeSnippets: Array.isArray(r.codeSnippets) ? r.codeSnippets : [],
    relatedFiles: Array.isArray(r.relatedFiles) ? r.relatedFiles : [],
    createdAt: r.createdAt || new Date().toISOString(),
    updatedAt: r.updatedAt || new Date().toISOString(),
  }));

  return {
    references,
    projects: rawProjects,
    collections: rawCollections,
  };
}
