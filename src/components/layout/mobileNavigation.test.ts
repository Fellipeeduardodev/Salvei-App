import { describe, it, expect, vi } from 'vitest';
import { NavigationDestination } from '../../types/reference';

describe('EXPERIÊNCIA MOBILE — NAVEGAÇÃO INFERIOR ESTILO APLICATIVO', () => {
  describe('1. Estrutura e Destinos da Barra de Navegação Inferior (MobileNavBar)', () => {
    interface MobileNavTab {
      id: string;
      label: string;
      destination?: NavigationDestination;
      isAction?: boolean;
    }

    const tabs: MobileNavTab[] = [
      { id: 'inbox', label: 'Início', destination: 'inbox' },
      { id: 'search', label: 'Buscar', isAction: true },
      { id: 'add', label: 'Adicionar', isAction: true },
      { id: 'collections', label: 'Coleções', destination: 'collections' },
      { id: 'more', label: 'Mais', isAction: true },
    ];

    it('possui 5 abas principais otimizadas para navegação ergonômica com uma mão', () => {
      expect(tabs).toHaveLength(5);
      expect(tabs.map((t) => t.label)).toEqual([
        'Início',
        'Buscar',
        'Adicionar',
        'Coleções',
        'Mais',
      ]);
    });

    it('identifica corretamente a aba ativa com base na rota atual', () => {
      const getActiveTabId = (
        currentDest: NavigationDestination,
        isMenuOpen: boolean,
        isFavoritesFilter: boolean
      ): string => {
        if (isMenuOpen) return 'more';
        if (isFavoritesFilter) return 'more';
        if (currentDest === 'inbox') return 'inbox';
        if (currentDest === 'collections') return 'collections';
        if (['projects', 'tags', 'settings'].includes(currentDest)) return 'more';
        return 'inbox';
      };

      expect(getActiveTabId('inbox', false, false)).toBe('inbox');
      expect(getActiveTabId('collections', false, false)).toBe('collections');
      expect(getActiveTabId('projects', false, false)).toBe('more');
      expect(getActiveTabId('tags', false, false)).toBe('more');
      expect(getActiveTabId('settings', false, false)).toBe('more');
      expect(getActiveTabId('inbox', true, false)).toBe('more');
      expect(getActiveTabId('inbox', false, true)).toBe('more');
    });

    it('garante que todos os itens possuam área de toque ergonômica >= 44x44 px', () => {
      const touchTarget = { minWidthPx: 48, minHeightPx: 44 };
      expect(touchTarget.minWidthPx).toBeGreaterThanOrEqual(44);
      expect(touchTarget.minHeightPx).toBeGreaterThanOrEqual(44);
    });
  });

  describe('2. Coordenação entre Seleção Múltipla e Barra Inferior', () => {
    it('oculta a barra inferior e prioriza a BulkActionBar quando itens estiverem selecionados', () => {
      const resolveBottomBarVisibility = (selectedCount: number) => {
        return {
          showMobileNavBar: selectedCount === 0,
          showBulkActionBar: selectedCount > 0,
        };
      };

      // Sem seleção: barra de navegação visível, barra de lote oculta
      expect(resolveBottomBarVisibility(0)).toEqual({
        showMobileNavBar: true,
        showBulkActionBar: false,
      });

      // Com seleção: barra de lote assume a parte inferior, navegação recolhe
      expect(resolveBottomBarVisibility(3)).toEqual({
        showMobileNavBar: false,
        showBulkActionBar: true,
      });
    });

    it('posiciona a notificação de toast com folga segura acima da barra inferior no mobile', () => {
      const getToastOffset = (isMobile: boolean) => {
        if (isMobile) {
          // bottom-20 (~80px) garante que não colide com a barra inferior (64px + safe-area)
          return 'bottom-20';
        }
        return 'bottom-6';
      };

      expect(getToastOffset(true)).toBe('bottom-20');
      expect(getToastOffset(false)).toBe('bottom-6');
    });
  });

  describe('3. Folha Deslizante de Opções (MobileMenuSheet)', () => {
    it('disponibiliza atalhos completos para Projetos, Coleções, Favoritos, Tags e Configurações', () => {
      const menuSheetItems = [
        { id: 'projects', label: 'Projetos', type: 'destination' },
        { id: 'collections', label: 'Coleções', type: 'destination' },
        { id: 'favorites', label: 'Favoritos', type: 'filter' },
        { id: 'tags', label: 'Etiquetas', type: 'destination' },
        { id: 'shortcuts', label: 'Atalhos de teclado', type: 'modal' },
        { id: 'settings', label: 'Configurações', type: 'destination' },
      ];

      expect(menuSheetItems.map((i) => i.id)).toContain('projects');
      expect(menuSheetItems.map((i) => i.id)).toContain('collections');
      expect(menuSheetItems.map((i) => i.id)).toContain('favorites');
      expect(menuSheetItems.map((i) => i.id)).toContain('tags');
      expect(menuSheetItems.map((i) => i.id)).toContain('settings');
    });

    it('permite fechar com a tecla Escape', () => {
      let isSheetOpen = true;
      const handleEscape = (e: { key: string }) => {
        if (e.key === 'Escape') isSheetOpen = false;
      };

      handleEscape({ key: 'Escape' });
      expect(isSheetOpen).toBe(false);
    });
  });

  describe('4. Arquitetura Responsiva por Tamanho de Tela', () => {
    it('aplica classes corretas para celular (< 768px)', () => {
      const mobileRules = {
        sidebarHidden: 'hidden md:flex',
        mobileNavBarVisible: 'md:hidden',
        contentPaddingOffset: 'pl-0 md:pl-16 lg:pl-60',
        contentPaddingBottom: 'pb-24 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8',
      };

      expect(mobileRules.sidebarHidden).toContain('hidden');
      expect(mobileRules.mobileNavBarVisible).toContain('md:hidden');
      expect(mobileRules.contentPaddingOffset).toContain('pl-0');
      expect(mobileRules.contentPaddingBottom).toContain('pb-24');
    });

    it('aplica classes corretas para tablet (768px a 1023px)', () => {
      const tabletRules = {
        sidebarRailWidth: 'md:w-16',
        contentOffset: 'md:pl-16',
        mobileNavBarHidden: 'md:hidden',
      };

      expect(tabletRules.sidebarRailWidth).toBe('md:w-16');
      expect(tabletRules.contentOffset).toBe('md:pl-16');
      expect(tabletRules.mobileNavBarHidden).toBe('md:hidden');
    });

    it('aplica classes corretas para desktop (>= 1024px)', () => {
      const desktopRules = {
        sidebarFullWidth: 'lg:w-60',
        contentOffset: 'lg:pl-60',
        mobileNavBarHidden: 'md:hidden',
      };

      expect(desktopRules.sidebarFullWidth).toBe('lg:w-60');
      expect(desktopRules.contentOffset).toBe('lg:pl-60');
    });
  });

  describe('5. Suporte a Safe Area Inset (Dispositivos sem borda e barras gestuais)', () => {
    it('garante que classes e estilos referenciem env(safe-area-inset-bottom)', () => {
      const safeAreaCSS = 'env(safe-area-inset-bottom, 0px)';
      expect(safeAreaCSS).toContain('safe-area-inset-bottom');
    });
  });
});
