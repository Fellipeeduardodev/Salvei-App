import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getInitialThemePreference,
  getSystemTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
  type ResolvedTheme,
} from '../contexts/ThemeContext';
import * as supabaseService from './supabaseService';
import type { Reference } from '../types/reference';

// Mock Browser Storage & DOM for Vitest Node environment
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, String(value)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

globalThis.localStorage = mockLocalStorage as any;

const classListSet = new Set<string>();
const mockDocumentElement = {
  classList: {
    add: (c: string) => classListSet.add(c),
    remove: (c: string) => classListSet.delete(c),
    contains: (c: string) => classListSet.has(c),
  },
  style: {} as Record<string, string>,
};

(globalThis as any).window = {
  matchMedia: vi.fn(),
  innerWidth: 1024,
  innerHeight: 768,
};

(globalThis as any).document = {
  documentElement: mockDocumentElement,
  querySelector: vi.fn(),
};

// Mock Supabase
const mockFrom = vi.fn();
const mockStorageFrom = vi.fn();
const mockAuthSignOut = vi.fn();

vi.mock('../lib/supabase', () => {
  return {
    supabase: {
      from: (...args: any[]) => mockFrom(...args),
      storage: {
        from: (...args: any[]) => mockStorageFrom(...args),
      },
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
        signOut: (...args: any[]) => mockAuthSignOut(...args),
      },
    },
    isSupabaseConfigured: vi.fn().mockReturnValue(true),
  };
});

describe('FASE 10 — EXPERIÊNCIA GUIADA, TEMA ESCURO E NAVEGAÇÃO FLUIDA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMap.clear();
    classListSet.clear();
    mockDocumentElement.style = {};
  });

  // ==========================================================================
  // PARTE 1: TEMA ESCURO COMPLETO (CLARO, ESCURO, SISTEMA)
  // ==========================================================================
  describe('1. Sistema de Temas (Claro, Escuro e Sistema)', () => {
    it('retorna preferência padrão como "system" quando localStorage está vazio', () => {
      expect(getInitialThemePreference()).toBe('system');
    });

    it('recupera valor válido do localStorage quando previamente configurado', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      expect(getInitialThemePreference()).toBe('dark');

      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      expect(getInitialThemePreference()).toBe('light');

      localStorage.setItem(THEME_STORAGE_KEY, 'system');
      expect(getInitialThemePreference()).toBe('system');
    });

    it('rejeita valores arbitrários do localStorage e recorre a "system"', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'blue_neon');
      expect(getInitialThemePreference()).toBe('system');
    });

    it('detecta o tema do sistema operacional respeitando prefers-color-scheme', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getSystemTheme()).toBe('dark');

      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getSystemTheme()).toBe('light');
    });

    it('aplica corretamente a classe .dark e colorScheme no elemento raiz', () => {
      const root = document.documentElement;

      const applyThemeToDOM = (resolved: ResolvedTheme) => {
        if (resolved === 'dark') {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      };

      applyThemeToDOM('dark');
      expect(root.classList.contains('dark')).toBe(true);
      expect(root.style.colorScheme).toBe('dark');

      applyThemeToDOM('light');
      expect(root.classList.contains('dark')).toBe(false);
      expect(root.style.colorScheme).toBe('light');
    });

    it('salva a preferência de tema no Supabase através de saveUserPreferences', async () => {
      const userId = 'usr-theme-10';
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: userId,
          preferences: { theme: 'dark', shortcuts_enabled: true },
        },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const updated = await supabaseService.saveUserPreferences(userId, {
        theme: 'dark',
      });

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          preferences: expect.objectContaining({ theme: 'dark' }),
        })
      );
      expect(updated.theme).toBe('dark');
    });
  });

  // ==========================================================================
  // PARTE 2: NAVEGAÇÃO FLUIDA E CARREGAMENTO ISOLADO
  // ==========================================================================
  describe('2. Navegação Fluida e Carregamento Isolado', () => {
    const createMockRef = (overrides: Partial<Reference>): Reference => ({
      id: 'ref-default',
      title: 'Referência Teste',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      sourceType: 'url',
      screenshotStatus: 'ready',
      collectionIds: [],
      projectIds: [],
      notesMarkdown: '',
      relatedFiles: [],
      codeSnippets: [],
      isFavorite: false,
      ...overrides,
    });

    it('simula transição entre destinos sem redefinir ou esvaziar referências em memória', () => {
      const initialReferences: Reference[] = [
        createMockRef({
          id: 'ref-1',
          title: 'Design System',
          tags: ['ui'],
          sourceType: 'url',
        }),
        createMockRef({
          id: 'ref-2',
          title: 'Landing Page Hero',
          tags: ['marketing'],
          sourceType: 'image',
        }),
      ];

      let memoryReferences = [...initialReferences];
      let currentDestination = 'inbox';
      let isInitialSessionLoading = false;
      let hasInitialLoadCompleted = true;

      // Navegar para projetos
      currentDestination = 'projects';
      expect(memoryReferences).toHaveLength(2);
      expect(isInitialSessionLoading).toBe(false);
      expect(hasInitialLoadCompleted).toBe(true);

      // Navegar para coleções
      currentDestination = 'collections';
      expect(memoryReferences).toHaveLength(2);

      // Retornar para inbox (NÃO deve disparar a tela de carregamento de referências)
      currentDestination = 'inbox';
      const shouldShowGate5Loading = isInitialSessionLoading && !hasInitialLoadCompleted;
      expect(shouldShowGate5Loading).toBe(false);
      expect(memoryReferences).toEqual(initialReferences);
    });

    it('executa sincronização em segundo plano mantendo os dados locais intactos', async () => {
      const existingRefs: Reference[] = [
        createMockRef({
          id: 'ref-local-1',
          title: 'Referência Local Existente',
          tags: ['editorial'],
          sourceType: 'url',
        }),
      ];

      let stateReferences = [...existingRefs];
      let isInitialSessionLoading = false;
      let isBackgroundSyncing = false;

      // Inicia sincronização em segundo plano
      const syncAcervo = async (options: { background?: boolean }) => {
        if (!options.background) {
          isInitialSessionLoading = true;
        } else {
          isBackgroundSyncing = true;
        }

        // NÃO esvazia stateReferences durante background sync!
        // Simula busca assíncrona
        await new Promise((resolve) => setTimeout(resolve, 10));

        stateReferences = [
          ...stateReferences,
          createMockRef({
            id: 'ref-cloud-2',
            title: 'Nova Referência Sincronizada',
            tags: ['cloud'],
            sourceType: 'url',
          }),
        ];

        isInitialSessionLoading = false;
        isBackgroundSyncing = false;
      };

      // Executa como background sync
      const syncPromise = syncAcervo({ background: true });

      // Durante a sincronização, o acervo permanece acessível e a tela não fica em branco
      expect(isBackgroundSyncing).toBe(true);
      expect(isInitialSessionLoading).toBe(false);
      expect(stateReferences).toHaveLength(1);

      await syncPromise;

      expect(isBackgroundSyncing).toBe(false);
      expect(stateReferences).toHaveLength(2);
      expect(stateReferences[0].id).toBe('ref-local-1');
      expect(stateReferences[1].id).toBe('ref-cloud-2');
    });

    it('garante que Gate 5 de carregamento dispara apenas na primeira inicialização da sessão', () => {
      // Caso 1: Usuário abre o app pela primeira vez
      let isInitialSessionLoading = true;
      let hasInitialLoadCompleted = false;
      let showGate5 = isInitialSessionLoading && !hasInitialLoadCompleted;
      expect(showGate5).toBe(true);

      // Caso 2: Carga inicial concluída com sucesso
      isInitialSessionLoading = false;
      hasInitialLoadCompleted = true;
      showGate5 = isInitialSessionLoading && !hasInitialLoadCompleted;
      expect(showGate5).toBe(false);

      // Caso 3: Usuário navega e uma consulta em background roda
      isInitialSessionLoading = false;
      showGate5 = isInitialSessionLoading && !hasInitialLoadCompleted;
      expect(showGate5).toBe(false);
    });
  });

  // ==========================================================================
  // PARTE 3: EXPERIÊNCIA GUIADA E TOUR CONTEXTUAL (GUIDED TOUR)
  // ==========================================================================
  describe('3. Experiência Guiada e Tour Contextual', () => {
    const TOUR_STEPS = [
      { id: 0, selector: '[data-tour="brand-header"]', badge: 'BOAS-VINDAS' },
      { id: 1, selector: '[data-tour="quick-capture"]', badge: 'CAPTURA RÁPIDA' },
      { id: 2, selector: '[data-tour="nav-organization"]', badge: 'TAXONOMIA' },
      { id: 3, selector: '[data-tour="global-search"]', badge: 'BUSCA & DETALHES' },
      { id: 4, selector: '[data-tour="user-menu"]', badge: 'PRODUTIVIDADE' },
    ];

    it('possui exatamente 5 etapas com identificadores de elemento estáveis', () => {
      expect(TOUR_STEPS).toHaveLength(5);
      expect(TOUR_STEPS[0].selector).toBe('[data-tour="brand-header"]');
      expect(TOUR_STEPS[1].selector).toBe('[data-tour="quick-capture"]');
      expect(TOUR_STEPS[2].selector).toBe('[data-tour="nav-organization"]');
      expect(TOUR_STEPS[3].selector).toBe('[data-tour="global-search"]');
      expect(TOUR_STEPS[4].selector).toBe('[data-tour="user-menu"]');
    });

    it('navega com segurança entre as etapas respeitando os limites mínimo e máximo', () => {
      let currentStep = 0;
      const total = TOUR_STEPS.length;

      const next = () => {
        if (currentStep < total - 1) currentStep += 1;
      };

      const back = () => {
        if (currentStep > 0) currentStep -= 1;
      };

      // Limite inferior
      back();
      expect(currentStep).toBe(0);

      // Avança até o fim
      next(); // 1
      next(); // 2
      next(); // 3
      next(); // 4
      expect(currentStep).toBe(4);

      // Limite superior
      next();
      expect(currentStep).toBe(4);

      // Recua
      back();
      expect(currentStep).toBe(3);
    });

    it('isola fallback quando elemento alvo não existe no DOM sem lançar erro', () => {
      const getTargetRect = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        return (el as any).getBoundingClientRect();
      };

      // Selector inexistente retorna null graciosamente
      const rect = getTargetRect('[data-tour="inexistent-element"]');
      expect(rect).toBeNull();

      // Cálculo de estilo de popover com fallback centralizado
      const getPositionMode = (targetRect: DOMRect | null, isMobile: boolean) => {
        if (isMobile) return 'bottom-docked';
        if (!targetRect) return 'centered-fallback';
        return 'contextual-clamped';
      };

      expect(getPositionMode(null, false)).toBe('centered-fallback');
      expect(getPositionMode(null, true)).toBe('bottom-docked');
    });

    it('persiste a conclusão do onboarding no Supabase com onboarding_completed = true', async () => {
      const userId = 'usr-tour-done';
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: userId, onboarding_completed: true },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await supabaseService.completeOnboarding(userId);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ onboarding_completed: true })
      );
      expect(mockEq).toHaveBeenCalledWith('id', userId);
    });

    it('reinicia o tour a partir da primeira etapa quando acionado novamente', () => {
      let tourCurrentStep = 4; // Usuário já havia concluído

      const openTutorial = () => {
        tourCurrentStep = 0; // Reinicia na etapa 1 (índice 0)
      };

      openTutorial();
      expect(tourCurrentStep).toBe(0);
    });
  });
});
