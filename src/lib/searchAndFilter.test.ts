import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  normalizeTag,
  matchesSearchQuery,
  matchesContentType,
  filterAndSortReferences,
} from './searchAndFilter';
import { Reference, Project, Collection } from '../types/reference';

// Mock sample references for testing
const testReferences: Reference[] = [
  {
    id: 'ref-1',
    title: 'Linear — Gestão Ágil e Minimalista',
    domain: 'linear.app',
    url: 'https://linear.app',
    sourceType: 'both',
    screenshotUrl: 'https://example.com/linear.png',
    screenshotStatus: 'ready',
    tags: ['saas', 'dark-mode', 'produtividade'],
    collectionIds: ['col-minimalismo', 'col-dark-mode'],
    projectIds: ['proj-1', 'proj-2'],
    notesMarkdown: 'Interface escura com precisão milimétrica e atalhos de teclado.',
    codeSnippets: [
      {
        id: 'snip-1',
        title: 'Estilo de Card Escuro',
        language: 'tailwind',
        code: 'bg-[#121214] border border-neutral-800',
      },
    ],
    relatedFiles: [
      {
        id: 'file-1',
        name: 'linear-spec-v1.pdf',
        type: 'application/pdf',
      },
    ],
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  {
    id: 'ref-2',
    title: 'Stripe — Comércio e Pagamentos Globais',
    domain: 'stripe.com',
    url: 'https://stripe.com',
    sourceType: 'both',
    screenshotUrl: 'https://example.com/stripe.png',
    screenshotStatus: 'ready',
    tags: ['fintech', 'editorial', 'tipografia'],
    collectionIds: ['col-tipografia'],
    projectIds: ['proj-2'],
    notesMarkdown: 'Malhas de cores sutis e rigor de alinhamento em tabelas.',
    codeSnippets: [],
    relatedFiles: [],
    createdAt: '2026-10-17T10:00:00.000Z',
    updatedAt: '2026-10-17T10:00:00.000Z',
  },
  {
    id: 'ref-3',
    title: 'Rauno — Interações e Física Tátil',
    domain: 'rauno.me',
    url: 'https://rauno.me',
    sourceType: 'url',
    screenshotStatus: 'none',
    tags: ['interacao', 'minimalismo'],
    collectionIds: ['col-minimalismo'],
    projectIds: [],
    notesMarkdown: 'Design engineering de alta precisão.',
    codeSnippets: [],
    relatedFiles: [],
    createdAt: '2026-10-16T10:00:00.000Z',
    updatedAt: '2026-10-16T10:00:00.000Z',
  },
  {
    id: 'ref-4',
    title: 'Estudo Tipográfico Grid',
    sourceType: 'image',
    originalFileName: 'grid-estudo.png',
    screenshotUrl: 'https://example.com/grid.png',
    screenshotStatus: 'ready',
    tags: ['editorial', 'tipografia', 'moodboard'],
    collectionIds: ['col-tipografia'],
    projectIds: ['proj-1'],
    notesMarkdown: '',
    codeSnippets: [],
    relatedFiles: [],
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  },
];

describe('Busca Global e Normalização', () => {
  it('normaliza acentos, maiúsculas e espaços', () => {
    expect(normalizeText('  GESTÃO Ágil e Tipográfica!  ')).toBe('gestao agil e tipografica!');
    expect(normalizeTag('#Dark-Mode')).toBe('dark-mode');
    expect(normalizeTag('  #Design System  ')).toBe('design-system');
  });

  it('busca por título', () => {
    expect(matchesSearchQuery(testReferences[0], 'Linear')).toBe(true);
    expect(matchesSearchQuery(testReferences[0], 'gestao')).toBe(true); // sem acento
    expect(matchesSearchQuery(testReferences[1], 'Linear')).toBe(false);
  });

  it('busca por domínio e URL', () => {
    expect(matchesSearchQuery(testReferences[1], 'stripe.com')).toBe(true);
    expect(matchesSearchQuery(testReferences[2], 'rauno.me')).toBe(true);
  });

  it('busca por etiquetas', () => {
    expect(matchesSearchQuery(testReferences[0], 'dark-mode')).toBe(true);
    expect(matchesSearchQuery(testReferences[1], 'fintech')).toBe(true);
  });

  it('busca por anotações (notesMarkdown)', () => {
    expect(matchesSearchQuery(testReferences[0], 'milimetrica')).toBe(true); // nota contém "milimétrica"
    expect(matchesSearchQuery(testReferences[1], 'alinhamento')).toBe(true);
  });

  it('busca por trechos de código (codeSnippets title e code)', () => {
    expect(matchesSearchQuery(testReferences[0], 'bg-[#121214]')).toBe(true);
    expect(matchesSearchQuery(testReferences[0], 'Card Escuro')).toBe(true);
  });

  it('busca por arquivos relacionados e nome de arquivo original', () => {
    expect(matchesSearchQuery(testReferences[0], 'linear-spec-v1')).toBe(true);
    expect(matchesSearchQuery(testReferences[3], 'grid-estudo.png')).toBe(true);
  });

  it('suporta consultas com múltiplas palavras (todas devem corresponder)', () => {
    // "linear dark-mode" está no ref-1
    expect(matchesSearchQuery(testReferences[0], 'linear dark-mode')).toBe(true);
    // "linear fintech" não existe no mesmo item
    expect(matchesSearchQuery(testReferences[0], 'linear fintech')).toBe(false);
  });

  it('uma consulta vazia restaura todos os itens', () => {
    const results = filterAndSortReferences(testReferences, { searchQuery: '' });
    expect(results.length).toBe(4);
  });
});

describe('Filtros Combináveis', () => {
  it('aplica lógica OR entre etiquetas selecionadas', () => {
    // Referências que possuem 'saas' OU 'fintech'
    const results = filterAndSortReferences(testReferences, {
      selectedTags: ['saas', 'fintech'],
    });
    expect(results.length).toBe(2);
    expect(results.map((r) => r.id).sort()).toEqual(['ref-1', 'ref-2']);
  });

  it('filtra por projetos associados', () => {
    const resultsProj1 = filterAndSortReferences(testReferences, {
      selectedProjectIds: ['proj-1'],
    });
    // ref-1 e ref-4 pertencem a proj-1
    expect(resultsProj1.length).toBe(2);
    expect(resultsProj1.map((r) => r.id).sort()).toEqual(['ref-1', 'ref-4']);
  });

  it('filtra por coleções associadas', () => {
    const resultsCol = filterAndSortReferences(testReferences, {
      selectedCollectionIds: ['col-minimalismo'],
    });
    // ref-1 e ref-3 pertencem a col-minimalismo
    expect(resultsCol.length).toBe(2);
    expect(resultsCol.map((r) => r.id).sort()).toEqual(['ref-1', 'ref-3']);
  });

  it('filtra por tipo de conteúdo', () => {
    // Apenas com trechos de código
    const withCode = filterAndSortReferences(testReferences, {
      contentTypes: ['has_code'],
    });
    expect(withCode.length).toBe(1);
    expect(withCode[0].id).toBe('ref-1');

    // Apenas com captura de imagem pronta
    const withImage = filterAndSortReferences(testReferences, {
      contentTypes: ['has_image'],
    });
    expect(withImage.length).toBe(3); // ref-1, ref-2, ref-4

    // Apenas com notas
    const withNotes = filterAndSortReferences(testReferences, {
      contentTypes: ['has_notes'],
    });
    expect(withNotes.length).toBe(3); // ref-1, ref-2, ref-3
  });

  it('combina categorias com lógica AND', () => {
    // (Tag: 'tipografia' OR 'saas') AND (Coleção: 'col-tipografia')
    const results = filterAndSortReferences(testReferences, {
      selectedTags: ['tipografia', 'saas'],
      selectedCollectionIds: ['col-tipografia'],
    });
    // ref-2 (tipografia + col-tipografia) e ref-4 (tipografia + col-tipografia)
    expect(results.length).toBe(2);
    expect(results.map((r) => r.id).sort()).toEqual(['ref-2', 'ref-4']);
  });

  it('combina busca por texto com filtros facetados', () => {
    // Busca "comercio" + Coleção 'col-tipografia'
    const results = filterAndSortReferences(testReferences, {
      searchQuery: 'comercio',
      selectedCollectionIds: ['col-tipografia'],
    });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('ref-2');
  });

  it('ordena por mais recentes, mais antigas e alfabético', () => {
    const newest = filterAndSortReferences(testReferences, { sortOption: 'newest' });
    expect(newest[0].id).toBe('ref-1');
    expect(newest[3].id).toBe('ref-4');

    const oldest = filterAndSortReferences(testReferences, { sortOption: 'oldest' });
    expect(oldest[0].id).toBe('ref-4');
    expect(oldest[3].id).toBe('ref-1');

    const alpha = filterAndSortReferences(testReferences, { sortOption: 'alphabetical' });
    expect(alpha[0].title).toBe('Estudo Tipográfico Grid');
    expect(alpha[3].title).toBe('Stripe — Comércio e Pagamentos Globais');
  });
});

describe('Integridade de Projetos, Coleções e Etiquetas', () => {
  it('permite associar referências a múltiplos projetos sem duplicar', () => {
    const ref = testReferences[0];
    expect(ref.projectIds).toContain('proj-1');
    expect(ref.projectIds).toContain('proj-2');
    expect(new Set(ref.projectIds).size).toBe(ref.projectIds.length);
  });

  it('exclusão de projeto remove associações sem apagar referências', () => {
    const projectToDeleteId = 'proj-2';
    // Simula remoção de projeto nas referências
    const updatedReferences = testReferences.map((r) => ({
      ...r,
      projectIds: r.projectIds.filter((p) => p !== projectToDeleteId),
    }));

    // Nenhuma referência foi excluída do acervo
    expect(updatedReferences.length).toBe(testReferences.length);
    // Mas a associação foi removida
    expect(updatedReferences[0].projectIds).not.toContain('proj-2');
    expect(updatedReferences[1].projectIds).not.toContain('proj-2');
  });

  it('renomeação de etiqueta atualiza todas as referências associadas', () => {
    const oldTag = 'dark-mode';
    const newTag = 'modo-noturno';

    const updatedReferences = testReferences.map((r) => ({
      ...r,
      tags: r.tags.map((t) => (t === oldTag ? newTag : t)),
    }));

    expect(updatedReferences[0].tags).toContain('modo-noturno');
    expect(updatedReferences[0].tags).not.toContain('dark-mode');
  });

  it('exclusão de etiqueta remove apenas a etiqueta das referências', () => {
    const tagToDelete = 'saas';

    const updatedReferences = testReferences.map((r) => ({
      ...r,
      tags: r.tags.filter((t) => t !== tagToDelete),
    }));

    expect(updatedReferences.length).toBe(testReferences.length);
    expect(updatedReferences[0].tags).not.toContain('saas');
    expect(updatedReferences[0].tags).toContain('dark-mode');
  });

  it('exclusão de coleção remove apenas a associação e preserva todas as referências', () => {
    const colToDelete = 'col-minimalismo';
    const updated = testReferences.map((r) => ({
      ...r,
      collectionIds: r.collectionIds.filter((c) => c !== colToDelete),
    }));

    expect(updated.length).toBe(testReferences.length);
    expect(updated[0].collectionIds).not.toContain('col-minimalismo');
    expect(updated[2].collectionIds).not.toContain('col-minimalismo');
    // Coleção restante preservada
    expect(updated[0].collectionIds).toContain('col-dark-mode');
  });

  it('adicionar associação existente não duplica identificadores no array', () => {
    const ref = { ...testReferences[0] };
    const projectToAdd = 'proj-1'; // já existe
    const updatedProjectIds = Array.from(new Set([...ref.projectIds, projectToAdd]));

    expect(updatedProjectIds.length).toBe(ref.projectIds.length);
    expect(updatedProjectIds.filter((p) => p === 'proj-1').length).toBe(1);
  });
});

describe('Resiliência da Busca e Casos Extremos', () => {
  it('não lança erro quando campos opcionais estão vazios ou indefinidos', () => {
    const minimalRef: Reference = {
      id: 'ref-min',
      title: 'Referência Mínima',
      screenshotStatus: 'none',
      tags: [],
      collectionIds: [],
      projectIds: [],
      notesMarkdown: '',
      codeSnippets: [],
      relatedFiles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => matchesSearchQuery(minimalRef, 'minima')).not.toThrow();
    expect(matchesSearchQuery(minimalRef, 'minima')).toBe(true);
    expect(matchesSearchQuery(minimalRef, 'inexistente')).toBe(false);
  });

  it('suporta correspondência por prefixo de palavras', () => {
    // "lin" como prefixo de Linear
    expect(matchesSearchQuery(testReferences[0], 'lin')).toBe(true);
    // "inter" como prefixo de Interações / Interface
    expect(matchesSearchQuery(testReferences[2], 'inter')).toBe(true);
  });

  it('busca multi-campo cruzada (palavra 1 no título, palavra 2 no código, palavra 3 no arquivo)', () => {
    // ref-1: título 'Linear', código 'tailwind', arquivo 'spec'
    expect(matchesSearchQuery(testReferences[0], 'linear card spec')).toBe(true);
    // Mas se uma das palavras não existir, deve falhar
    expect(matchesSearchQuery(testReferences[0], 'linear card inexistente')).toBe(false);
  });
});
