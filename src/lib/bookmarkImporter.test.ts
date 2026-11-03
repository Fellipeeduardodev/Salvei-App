import { describe, it, expect } from 'vitest';
import {
  extractDomain,
  parseBookmarksHtml,
  convertBookmarksToReferences,
  parseBackupJson,
} from './bookmarkImporter';

describe('SALVEI — IMPORTADOR DE FAVORITOS & BACKUPS', () => {
  it('extrai domínios corretamente a partir de URLs', () => {
    expect(extractDomain('https://linear.app/features')).toBe('linear.app');
    expect(extractDomain('https://www.are.na/fellipe')).toBe('are.na');
    expect(extractDomain('dribbble.com/shots')).toBe('dribbble.com');
  });

  it('faz parse de arquivo HTML padrão Netscape Bookmarks', () => {
    const htmlSample = `
      <!DOCTYPE NETSCAPE-Bookmark-file-1>
      <TITLE>Bookmarks</TITLE>
      <H1>Bookmarks</H1>
      <DL><p>
          <DT><A HREF="https://linear.app" ADD_DATE="1620000000">Linear App</A>
          <DT><A HREF="https://framer.com"><b>Framer</b> — Design Tool</A>
          <DT><A HREF="javascript:void(0)">Link Inválido</A>
      </DL><p>
    `;

    const bookmarks = parseBookmarksHtml(htmlSample);
    expect(bookmarks).toHaveLength(2);
    expect(bookmarks[0].title).toBe('Linear App');
    expect(bookmarks[0].url).toBe('https://linear.app');
    expect(bookmarks[0].domain).toBe('linear.app');
    expect(bookmarks[1].title).toBe('Framer — Design Tool');
  });

  it('converte favoritos para referências com tags automáticas', () => {
    const bookmarks = [
      { title: 'Stripe', url: 'https://stripe.com', domain: 'stripe.com' },
    ];
    const refs = convertBookmarksToReferences(bookmarks);
    expect(refs).toHaveLength(1);
    expect(refs[0].title).toBe('Stripe');
    expect(refs[0].tags).toContain('favoritos-importados');
    expect(refs[0].sourceType).toBe('url');
  });

  it('faz o parsing de backup JSON restaurando referências e projetos', () => {
    const backupJson = JSON.stringify({
      version: 1,
      references: [
        {
          id: 'ref-123',
          title: 'Referência Salva',
          url: 'https://apple.com',
          tags: ['tech'],
        },
      ],
      projects: [{ id: 'p1', name: 'Design System' }],
      collections: [],
    });

    const parsed = parseBackupJson(backupJson);
    expect(parsed.references).toHaveLength(1);
    expect(parsed.references[0].id).toBe('ref-123');
    expect(parsed.projects).toHaveLength(1);
  });
});
