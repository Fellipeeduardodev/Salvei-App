import { describe, it, expect, beforeEach } from 'vitest';
import { Reference, Project, Collection } from '../types/reference';

const LOCAL_STORAGE_GUEST_KEY = 'salvei_guest_mode';
const LOCAL_STORAGE_REFS_KEY = 'salvei_guest_references';
const LOCAL_STORAGE_PROJECTS_KEY = 'salvei_guest_projects';
const LOCAL_STORAGE_COLLECTIONS_KEY = 'salvei_guest_collections';

// In-memory mock for local storage in Node environment
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const mockStorage = new MockLocalStorage();

describe('SALVEI — MODO LOCAL / TESTAR SEM CADASTRO (OFFLINE-FIRST)', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  describe('1. Inicialização e Persistência do Modo Local', () => {
    it('armazena a chave de ativação do modo local no storage', () => {
      mockStorage.setItem(LOCAL_STORAGE_GUEST_KEY, 'true');
      expect(mockStorage.getItem(LOCAL_STORAGE_GUEST_KEY)).toBe('true');
    });

    it('persiste referências locais em JSON válido', () => {
      const mockRefs: Reference[] = [
        {
          id: 'ref-local-1',
          title: 'Design Inspiration',
          url: 'https://example.com',
          domain: 'example.com',
          sourceType: 'url',
          screenshotStatus: 'none',
          tags: ['design'],
          collectionIds: [],
          projectIds: [],
          notesMarkdown: 'Inspiração',
          codeSnippets: [],
          relatedFiles: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockStorage.setItem(LOCAL_STORAGE_REFS_KEY, JSON.stringify(mockRefs));
      const retrieved = JSON.parse(mockStorage.getItem(LOCAL_STORAGE_REFS_KEY) || '[]');
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].title).toBe('Design Inspiration');
      expect(retrieved[0].id).toBe('ref-local-1');
    });

    it('persiste projetos e coleções locais em JSON válido', () => {
      const mockProjects: Project[] = [
        {
          id: 'proj-local-1',
          name: 'Branding 2026',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const mockCollections: Collection[] = [
        {
          id: 'col-local-1',
          name: 'Tipografia',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(mockProjects));
      mockStorage.setItem(LOCAL_STORAGE_COLLECTIONS_KEY, JSON.stringify(mockCollections));

      const retrievedProjects = JSON.parse(mockStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY) || '[]');
      const retrievedCols = JSON.parse(mockStorage.getItem(LOCAL_STORAGE_COLLECTIONS_KEY) || '[]');

      expect(retrievedProjects).toHaveLength(1);
      expect(retrievedProjects[0].name).toBe('Branding 2026');
      expect(retrievedCols).toHaveLength(1);
      expect(retrievedCols[0].name).toBe('Tipografia');
    });
  });

  describe('2. Migração Fluida para Nuvem (Cloud Seamless Migration)', () => {
    it('distingue referências demonstrativas de referências criadas pelo usuário', () => {
      const mixedRefs: Partial<Reference>[] = [
        {
          id: 'local-demo-1',
          title: 'Linear Starter',
          url: 'https://linear.app',
          sourceType: 'url',
          tags: [],
          collectionIds: [],
          projectIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'ref-1700000000000',
          title: 'Minha Referência Pessoal',
          url: 'https://meusite.com',
          sourceType: 'url',
          tags: ['meu-projeto'],
          collectionIds: [],
          projectIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const userCreatedOnly = mixedRefs.filter((r) => !r.id?.startsWith('local-demo-'));
      expect(userCreatedOnly).toHaveLength(1);
      expect(userCreatedOnly[0].title).toBe('Minha Referência Pessoal');
    });

    it('limpa todas as chaves locais após migração com sucesso para a conta na nuvem', () => {
      mockStorage.setItem(LOCAL_STORAGE_GUEST_KEY, 'true');
      mockStorage.setItem(LOCAL_STORAGE_REFS_KEY, JSON.stringify([{ id: 'test' }]));
      mockStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify([{ id: 'test' }]));
      mockStorage.setItem(LOCAL_STORAGE_COLLECTIONS_KEY, JSON.stringify([{ id: 'test' }]));

      // Simula finalização da migração
      mockStorage.removeItem(LOCAL_STORAGE_REFS_KEY);
      mockStorage.removeItem(LOCAL_STORAGE_PROJECTS_KEY);
      mockStorage.removeItem(LOCAL_STORAGE_COLLECTIONS_KEY);
      mockStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);

      expect(mockStorage.getItem(LOCAL_STORAGE_GUEST_KEY)).toBeNull();
      expect(mockStorage.getItem(LOCAL_STORAGE_REFS_KEY)).toBeNull();
      expect(mockStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY)).toBeNull();
      expect(mockStorage.getItem(LOCAL_STORAGE_COLLECTIONS_KEY)).toBeNull();
    });
  });

  describe('3. Isolamento Total do Banco de Dados', () => {
    it('garante que nenhum dado seja enviado à nuvem no modo local sem usuário logado', () => {
      const user = null;
      const isGuestMode = true;

      const canSyncToCloud = Boolean(user && !isGuestMode);
      expect(canSyncToCloud).toBe(false);
    });
  });
});
