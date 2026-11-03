import { describe, it, expect } from 'vitest';
import {
  encodeSharedCollection,
  decodeSharedCollection,
  generateCollectionShareUrl,
  generateStandaloneMoodboardHtml,
  SharedCollectionData,
} from './collectionSharing';
import { Collection, Reference } from '../types/reference';

describe('collectionSharing', () => {
  const mockCollection: Collection = {
    id: 'col-123',
    name: 'Identidade & Tipografia Suíça',
    description: 'Coleção editorial com foco em grids e minimalismo funcional.',
    createdAt: '2026-03-30T10:00:00Z',
    updatedAt: '2026-03-30T10:00:00Z',
  };

  const mockReferences: Reference[] = [
    {
      id: 'ref-1',
      title: 'Swiss Modern Specimen',
      url: 'https://are.na/swiss',
      domain: 'are.na',
      sourceType: 'url',
      screenshotStatus: 'none',
      projectIds: [],
      notesMarkdown: '',
      codeSnippets: [],
      relatedFiles: [],
      tags: ['tipografia', 'grid'],
      collectionIds: ['col-123'],
      palette: [
        { hex: '#0F1012', name: 'Preto Profundo', role: 'background' },
        { hex: '#FFFFFF', name: 'Branco Puro', role: 'neutral' },
      ],
      createdAt: '2026-03-30T10:00:00Z',
      updatedAt: '2026-03-30T10:00:00Z',
    },
    {
      id: 'ref-2',
      title: 'Kinfolk Magazine',
      url: 'https://kinfolk.com',
      domain: 'kinfolk.com',
      sourceType: 'url',
      screenshotStatus: 'none',
      projectIds: [],
      notesMarkdown: '',
      codeSnippets: [],
      relatedFiles: [],
      tags: ['editorial'],
      collectionIds: ['col-123'],
      palette: [
        { hex: '#2A2C30', name: 'Carvão', role: 'background' },
      ],
      createdAt: '2026-03-30T10:00:00Z',
      updatedAt: '2026-03-30T10:00:00Z',
    },
    {
      id: 'ref-3',
      title: 'Unrelated Ref',
      url: 'https://other.com',
      domain: 'other.com',
      sourceType: 'url',
      screenshotStatus: 'none',
      projectIds: [],
      notesMarkdown: '',
      codeSnippets: [],
      relatedFiles: [],
      tags: ['other'],
      collectionIds: ['other-col'],
      createdAt: '2026-03-30T10:00:00Z',
      updatedAt: '2026-03-30T10:00:00Z',
    },
  ];

  it('correctly encodes and decodes shared collection data with UTF-8 characters', () => {
    const payload: SharedCollectionData = {
      version: 1,
      id: 'col-123',
      name: 'Direção de Arte & Layout — Edição Especial',
      description: 'Acentos e caracteres: á é í ó ú ç ã õ',
      references: [
        {
          id: 'ref-1',
          title: 'Referência com Acentuação',
          url: 'https://exemplo.com.br',
          domain: 'exemplo.com.br',
          tags: ['direção', 'criação'],
          palette: [{ hex: '#FF3366', name: 'Rosa Vibrante' }],
        },
      ],
    };

    const encoded = encodeSharedCollection(payload);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeSharedCollection(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe('col-123');
    expect(decoded?.name).toBe('Direção de Arte & Layout — Edição Especial');
    expect(decoded?.description).toBe('Acentos e caracteres: á é í ó ú ç ã õ');
    expect(decoded?.references[0].tags).toEqual(['direção', 'criação']);
    expect(decoded?.references[0].palette?.[0].hex).toBe('#FF3366');
  });

  it('generates a valid share URL filtered to references of that collection', () => {
    const shareUrl = generateCollectionShareUrl(mockCollection, mockReferences, 'Fellipe Designer');
    expect(shareUrl).toContain('share=collection');
    expect(shareUrl).toContain('id=col-123');
    expect(shareUrl).toContain('#c=');
  });

  it('generates valid standalone HTML moodboard containing references and palette swatches', () => {
    const html = generateStandaloneMoodboardHtml(mockCollection, mockReferences);
    expect(html).toContain('Identidade &amp; Tipografia Suíça');
    expect(html).toContain('Swiss Modern Specimen');
    expect(html).toContain('Kinfolk Magazine');
    expect(html).not.toContain('Unrelated Ref');
    expect(html).toContain('#0F1012');
    expect(html).toContain('copyColor');
    expect(html).toContain('MOODBOARD & CURADORIA');
  });
});
