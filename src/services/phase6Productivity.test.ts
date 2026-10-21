import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as supabaseService from './supabaseService';
import { matchesContentType, filterAndSortReferences } from '../lib/searchAndFilter';
import type { Reference } from '../types/reference';

const mockFrom = vi.fn();

vi.mock('../lib/supabase', () => {
  return {
    supabase: {
      from: (...args: any[]) => mockFrom(...args),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ data: { path: 'test' }, error: null }),
          createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://test' }, error: null }),
          createSignedUrls: vi.fn().mockResolvedValue({ data: [], error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test' } }),
        }),
      },
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      },
    },
    isSupabaseConfigured: vi.fn().mockReturnValue(true),
  };
});

describe('Fase 6: Operações em Lote e Ações Rápidas no Supabase', () => {
  const userId = 'user-test-uuid-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleFavorite & bulkUpdateFavorite', () => {
    it('alterna o favorito de uma referência individual com user_id restrito', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await supabaseService.toggleFavorite(userId, 'ref-1', true);

      expect(mockFrom).toHaveBeenCalledWith('references');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ is_favorite: true })
      );
      expect(mockEq1).toHaveBeenCalledWith('id', 'ref-1');
      expect(mockEq2).toHaveBeenCalledWith('user_id', userId);
    });

    it('atualiza o status de favorito em lote para múltiplas referências', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockUpdate = vi.fn().mockReturnValue({ in: mockIn });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await supabaseService.bulkUpdateFavorite(userId, ['ref-1', 'ref-2', 'ref-3'], true);

      expect(result.totalRequested).toBe(3);
      expect(result.successCount).toBe(3);
      expect(result.failedCount).toBe(0);
      expect(mockIn).toHaveBeenCalledWith('id', ['ref-1', 'ref-2', 'ref-3']);
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
    });

    it('retorna resultado zerado quando a lista de IDs para favorito for vazia', async () => {
      const result = await supabaseService.bulkUpdateFavorite(userId, [], false);
      expect(result.totalRequested).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.failedCount).toBe(0);
    });

    it('trata falha de conexão ou erro do banco ao atualizar favoritos em lote', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Database connection timeout' } });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockUpdate = vi.fn().mockReturnValue({ in: mockIn });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await supabaseService.bulkUpdateFavorite(userId, ['ref-1'], true);

      expect(result.successCount).toBe(0);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toContain('Database connection timeout');
    });
  });

  describe('bulkAddCollection & bulkRemoveCollection', () => {
    it('rejeita associação em lote se a coleção não pertencer ao usuário autenticado', async () => {
      // Mock collection query returning null
      mockFrom.mockImplementation((table: string) => {
        if (table === 'collections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await supabaseService.bulkAddCollection(userId, ['ref-1', 'ref-2'], 'col-other-user');

      expect(result.successCount).toBe(0);
      expect(result.failedCount).toBe(2);
      expect(result.errors?.[0]).toContain('Coleção não encontrada ou não pertence ao usuário');
    });

    it('adiciona referências a uma coleção evitando duplicatas na tabela de junção', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'collections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'col-1' }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'references') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [{ id: 'ref-1' }, { id: 'ref-2' }], error: null }),
              }),
            }),
          };
        }
        if (table === 'collection_references') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  // ref-1 already in collection, ref-2 is new
                  data: [{ reference_id: 'ref-1' }],
                  error: null,
                }),
              }),
            }),
            insert: mockInsert,
          };
        }
        return {};
      });

      const result = await supabaseService.bulkAddCollection(userId, ['ref-1', 'ref-2'], 'col-1');

      expect(result.totalRequested).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(0);

      // Only ref-2 should be inserted
      expect(mockInsert).toHaveBeenCalledWith([
        { collection_id: 'col-1', reference_id: 'ref-2' },
      ]);
    });

    it('remove referências de uma coleção em lote', async () => {
      const mockIn = vi.fn().mockResolvedValue({ error: null });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'collections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'col-1' }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'collection_references') {
          return {
            delete: mockDelete,
          };
        }
        return {};
      });

      const result = await supabaseService.bulkRemoveCollection(userId, ['ref-1', 'ref-2'], 'col-1');

      expect(result.totalRequested).toBe(2);
      expect(result.successCount).toBe(2);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('collection_id', 'col-1');
      expect(mockIn).toHaveBeenCalledWith('reference_id', ['ref-1', 'ref-2']);
    });

    it('rejeita remoção em lote se a coleção não pertencer ao usuário', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'collections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await supabaseService.bulkRemoveCollection(userId, ['ref-1'], 'col-unauthorized');

      expect(result.successCount).toBe(0);
      expect(result.failedCount).toBe(1);
      expect(result.errors?.[0]).toContain('Coleção não encontrada ou não pertence ao usuário');
    });
  });

  describe('bulkAddProject & bulkRemoveProject', () => {
    it('rejeita associação a projeto se o projeto não pertencer ao usuário', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await supabaseService.bulkAddProject(userId, ['ref-1'], 'proj-unauthorized');
      expect(result.successCount).toBe(0);
      expect(result.failedCount).toBe(1);
      expect(result.errors?.[0]).toContain('Projeto não encontrado ou não pertence ao usuário');
    });

    it('associa referências a um projeto validando pertencimento ao usuário', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'proj-1' }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'references') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [{ id: 'ref-1' }], error: null }),
              }),
            }),
          };
        }
        if (table === 'project_references') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            insert: mockInsert,
          };
        }
        return {};
      });

      const result = await supabaseService.bulkAddProject(userId, ['ref-1'], 'proj-1');

      expect(result.totalRequested).toBe(1);
      expect(result.successCount).toBe(1);
      expect(mockInsert).toHaveBeenCalledWith([
        { project_id: 'proj-1', reference_id: 'ref-1' },
      ]);
    });

    it('desassocia referências de um projeto em lote', async () => {
      const mockIn = vi.fn().mockResolvedValue({ error: null });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'proj-1' }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'project_references') {
          return {
            delete: mockDelete,
          };
        }
        return {};
      });

      const result = await supabaseService.bulkRemoveProject(userId, ['ref-1', 'ref-2'], 'proj-1');

      expect(result.successCount).toBe(2);
      expect(mockEq).toHaveBeenCalledWith('project_id', 'proj-1');
      expect(mockIn).toHaveBeenCalledWith('reference_id', ['ref-1', 'ref-2']);
    });
  });

  describe('bulkAddTags & bulkRemoveTags', () => {
    it('adiciona tags em lote para referências sem duplicar pares', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'tags') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'tag-minimal' }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'references') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [{ id: 'ref-1' }, { id: 'ref-2' }], error: null }),
              }),
            }),
          };
        }
        if (table === 'reference_tags') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  // ref-1 already has tag-minimal
                  data: [{ reference_id: 'ref-1', tag_id: 'tag-minimal' }],
                  error: null,
                }),
              }),
            }),
            insert: mockInsert,
          };
        }
        return {};
      });

      const result = await supabaseService.bulkAddTags(userId, ['ref-1', 'ref-2'], ['minimal']);

      expect(result.successCount).toBe(2);
      // Only ref-2 should have the insert
      expect(mockInsert).toHaveBeenCalledWith([
        { reference_id: 'ref-2', tag_id: 'tag-minimal' },
      ]);
    });

    it('remove tags em lote com segurança', async () => {
      const mockInTag = vi.fn().mockResolvedValue({ error: null });
      const mockInRef = vi.fn().mockReturnValue({ in: mockInTag });
      const mockDelete = vi.fn().mockReturnValue({ in: mockInRef });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'tags') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ data: [{ id: 'tag-1' }], error: null }),
              }),
            }),
          };
        }
        if (table === 'reference_tags') {
          return {
            delete: mockDelete,
          };
        }
        return {};
      });

      const result = await supabaseService.bulkRemoveTags(userId, ['ref-1'], ['minimal']);
      expect(result.successCount).toBe(1);
      expect(mockInRef).toHaveBeenCalledWith('reference_id', ['ref-1']);
      expect(mockInTag).toHaveBeenCalledWith('tag_id', ['tag-1']);
    });
  });

  describe('bulkDeleteReferences', () => {
    it('exclui referências em lote do Supabase com verificação do user_id', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockIn = vi.fn().mockReturnValue({ eq: mockEq });
      const mockDelete = vi.fn().mockReturnValue({ in: mockIn });
      mockFrom.mockReturnValue({ delete: mockDelete });

      const result = await supabaseService.bulkDeleteReferences(userId, ['ref-1', 'ref-2']);

      expect(result.totalRequested).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(mockIn).toHaveBeenCalledWith('id', ['ref-1', 'ref-2']);
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
    });

    it('retorna resultado zerado para exclusão de array vazio', async () => {
      const result = await supabaseService.bulkDeleteReferences(userId, []);
      expect(result.totalRequested).toBe(0);
      expect(result.successCount).toBe(0);
    });
  });
});

describe('Fase 6: Filtragem e Reconhecimento de Favoritos', () => {
  const sampleRefs: Reference[] = [
    {
      id: 'ref-1',
      title: 'Linear Design System',
      screenshotStatus: 'ready',
      isFavorite: true,
      tags: ['minimal', 'dark'],
      projectIds: [],
      collectionIds: [],
      notesMarkdown: '',
      codeSnippets: [],
      relatedFiles: [],
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 'ref-2',
      title: 'Stripe Documentation',
      screenshotStatus: 'ready',
      isFavorite: false,
      tags: ['api', 'docs'],
      projectIds: [],
      collectionIds: [],
      notesMarkdown: '',
      codeSnippets: [],
      relatedFiles: [],
      createdAt: '2026-10-19T10:00:00Z',
      updatedAt: '2026-10-19T10:00:00Z',
    },
  ];

  it('filtra referências pelo critério is_favorite', () => {
    expect(matchesContentType(sampleRefs[0], 'is_favorite')).toBe(true);
    expect(matchesContentType(sampleRefs[1], 'is_favorite')).toBe(false);
  });

  it('retorna apenas itens favoritos através de filterAndSortReferences', () => {
    const results = filterAndSortReferences(sampleRefs, {
      searchQuery: '',
      selectedTags: [],
      selectedProjectIds: [],
      selectedCollectionIds: [],
      contentTypes: ['is_favorite'],
      sortOption: 'newest',
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('ref-1');
  });
});
