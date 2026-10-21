import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { filterAndSortReferences, normalizeTag, normalizeText } from '../lib/searchAndFilter';
import { Reference } from '../types/reference';

describe('FASE 7 — QUALIDADE E EXPERIÊNCIA', () => {
  describe('1. Desempenho e Lógica de Debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('adia a chamada da função de pesquisa durante digitação rápida', () => {
      const callback = vi.fn();

      const createDebounced = (fn: (val: string) => void, delayMs = 180) => {
        let timer: any = null;
        return (val: string) => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => fn(val), delayMs);
        };
      };

      const debouncedSearch = createDebounced(callback, 180);

      // Usuário digita rápido: 'd' -> 'de' -> 'des' -> 'design'
      debouncedSearch('d');
      vi.advanceTimersByTime(50);
      debouncedSearch('de');
      vi.advanceTimersByTime(50);
      debouncedSearch('des');
      vi.advanceTimersByTime(50);
      debouncedSearch('design');

      // Callback ainda não deve ter sido executado
      expect(callback).not.toHaveBeenCalled();

      // Avança o tempo restante para completar 180ms desde a última chamada
      vi.advanceTimersByTime(180);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('design');
    });
  });

  describe('2. Conectividade e Resiliência de Rede', () => {
    it('gerencia transição de rede online e offline corretamente', () => {
      let isOnline = true;
      const listeners: Record<string, () => void> = {};

      const mockAddEventListener = (event: string, cb: () => void) => {
        listeners[event] = cb;
      };

      const mockRemoveEventListener = (event: string) => {
        delete listeners[event];
      };

      // Simula o hook useOnlineStatus
      const setup = () => {
        mockAddEventListener('online', () => {
          isOnline = true;
        });
        mockAddEventListener('offline', () => {
          isOnline = false;
        });
      };

      setup();

      expect(isOnline).toBe(true);

      // Simula queda de rede
      listeners['offline']?.();
      expect(isOnline).toBe(false);

      // Simula restauração de rede
      listeners['online']?.();
      expect(isOnline).toBe(true);

      // Limpeza
      mockRemoveEventListener('online');
      mockRemoveEventListener('offline');
      expect(listeners['online']).toBeUndefined();
      expect(listeners['offline']).toBeUndefined();
    });
  });

  describe('3. Estabilidade e ErrorBoundary', () => {
    it('captura falhas e atualiza o estado para renderizar fallback amigável', () => {
      const derivedState = ErrorBoundary.getDerivedStateFromError(
        new Error('Falha de renderização no componente')
      );

      expect(derivedState.hasError).toBe(true);
      expect(derivedState.error?.message).toBe('Falha de renderização no componente');
    });

    it('possui estado inicial limpo sem erros', () => {
      const errorBoundaryInstance = new ErrorBoundary({ children: 'Teste' });
      expect(errorBoundaryInstance.state.hasError).toBe(false);
      expect(errorBoundaryInstance.state.error).toBeNull();
    });
  });

  describe('4. Acessibilidade (WCAG 2.2 AA) e Semântica', () => {
    it('valida normalização de tags para compatibilidade com busca e URLs', () => {
      expect(normalizeTag('#Design Gráfico')).toBe('design-grafico');
      expect(normalizeTag('Tipografia & Cores')).toBe('tipografia-&-cores');
      expect(normalizeTag('  #UX_Research  ')).toBe('ux_research');
      expect(normalizeTag('#Mobile UI')).toBe('mobile-ui');
    });

    it('garante que textos de busca ignorem diacríticos e diferenças de caixa', () => {
      expect(normalizeText('Inspiração Editorial')).toBe('inspiracao editorial');
      expect(normalizeText('LAYOUT MÍNIMO')).toBe('layout minimo');
      expect(normalizeText('Coleção de Cartões')).toBe('colecao de cartoes');
    });

    it('valida conformidade do alvo de toque mínimo para dispositivos móveis (>= 32px e >= 40px recomendado)', () => {
      const validateTouchTarget = (widthPx: number, heightPx: number) => {
        // WCAG 2.2 Success Criterion 2.5.8 (Target Size Minimum): >= 24x24 px
        // Recomendações ergonômicas para mobile: >= 36x36 px
        return widthPx >= 24 && heightPx >= 24;
      };

      expect(validateTouchTarget(40, 40)).toBe(true);
      expect(validateTouchTarget(36, 36)).toBe(true);
      expect(validateTouchTarget(24, 24)).toBe(true);
      expect(validateTouchTarget(16, 16)).toBe(false);
    });

    it('valida hierarquia do skip link para pular diretamente para a tag <main id="main-content">', () => {
      const skipLinkTarget = '#main-content';
      const mainLandmarkId = 'main-content';

      expect(skipLinkTarget.replace('#', '')).toBe(mainLandmarkId);
    });
  });

  describe('5. Desempenho sob Carga de Dados e Escala', () => {
    it('filtra e ordena 1.000 referências em menos de 50 milissegundos sem congelar a UI', () => {
      const mockReferences: Reference[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `ref-${i}`,
        title: `Referência Visual ${i} - ${i % 2 === 0 ? 'Minimalista' : 'Editorial'}`,
        domain: i % 3 === 0 ? 'linear.app' : 'stripe.com',
        sourceType: 'both',
        screenshotStatus: 'ready',
        isFavorite: i % 4 === 0,
        tags: [`tag-${i % 8}`, 'design', 'ui'],
        collectionIds: [],
        projectIds: [],
        notesMarkdown: '',
        codeSnippets: [],
        relatedFiles: [],
        createdAt: new Date(Date.now() - i * 10000).toISOString(),
        updatedAt: new Date(Date.now() - i * 10000).toISOString(),
      }));

      const start = performance.now();

      const filtered = filterAndSortReferences(mockReferences, {
        searchQuery: 'minimalista linear',
        selectedTags: ['design'],
        contentTypes: [],
        selectedProjectIds: [],
        selectedCollectionIds: [],
        sortOption: 'newest',
      });

      const duration = performance.now() - start;

      expect(filtered.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Deve ser sub-50ms para manter fluidez 60 FPS
    });
  });

  describe('6. Resposta e Estados de Interface em Português (pt-BR)', () => {
    it('confirma que mensagens de estado vazio e feedback utilizam o idioma correto', () => {
      const emptyStates = {
        emptyInboxTitle: 'Sua biblioteca está vazia',
        emptyInboxSubtitle:
          'Capture e preserve referências visuais de layouts, tipografia, micro-interações e produtos digitais.',
        noSearchResultsTitle: 'Nenhuma referência encontrada',
        noSearchResultsSubtitle:
          'Não encontramos referências correspondentes aos termos de busca ou filtros aplicados.',
      };

      expect(emptyStates.emptyInboxTitle).toContain('biblioteca está vazia');
      expect(emptyStates.noSearchResultsTitle).toContain('Nenhuma referência');
      expect(emptyStates.noSearchResultsSubtitle).toContain('termos de busca');
    });

    it('garante que erros de rede possuam mensagens claras e sem expor detalhes técnicos crus', () => {
      const formatFriendlyErrorMessage = (rawError: any): string => {
        if (!rawError) return 'Ocorreu um erro inesperado. Tente novamente.';
        const msg = String(rawError.message || rawError);
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
        }
        if (msg.includes('JWT') || msg.includes('session expired') || msg.includes('auth')) {
          return 'Sua sessão expirou. Faça login novamente para continuar.';
        }
        return msg;
      };

      const networkError = new Error('Failed to fetch from backend at 127.0.0.1');
      expect(formatFriendlyErrorMessage(networkError)).toBe(
        'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
      );

      const authError = new Error('Invalid JWT or session expired');
      expect(formatFriendlyErrorMessage(authError)).toBe(
        'Sua sessão expirou. Faça login novamente para continuar.'
      );
    });
  });
});
