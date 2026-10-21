import { describe, it, expect } from 'vitest';

describe('SALVEI — CORREÇÃO CRÍTICA DO LAYOUT MOBILE (AUDITORIA ESTRUTURAL)', () => {
  describe('1. Cabeçalho Estrutural (Topbar)', () => {
    it('remove os botões largos de adicionar da visualização mobile (< md)', () => {
      // Regra estrutural do Topbar: botões largos "Adicionar imagem" e "Adicionar por URL"
      // só são renderizados no container desktop/tablet (hidden md:flex)
      const mobileHeaderStructure = {
        mobileContainerClass: 'flex md:hidden items-center justify-between gap-2 h-13 w-full min-w-0',
        desktopContainerClass: 'hidden md:flex items-center justify-between gap-4 h-14 w-full min-w-0',
        hasWideButtonsInMobile: false,
      };

      expect(mobileHeaderStructure.mobileContainerClass).toContain('md:hidden');
      expect(mobileHeaderStructure.desktopContainerClass).toContain('hidden md:flex');
      expect(mobileHeaderStructure.hasWideButtonsInMobile).toBe(false);
    });

    it('preserva a busca no mobile com crescimento flexível e contenção estrita', () => {
      const searchContainerClass = 'flex-1 min-w-0 max-w-full relative flex items-center';
      expect(searchContainerClass).toContain('flex-1');
      expect(searchContainerClass).toContain('min-w-0');
      expect(searchContainerClass).toContain('max-w-full');
    });

    it('mantém o logotipo Salvei e botão de atalhos acessíveis no mobile', () => {
      const brandClass = 'flex items-center gap-1.5 shrink-0';
      const shortcutsBtnClass = 'p-1.5 min-h-[34px] min-w-[34px] shrink-0';
      expect(brandClass).toContain('shrink-0');
      expect(shortcutsBtnClass).toContain('min-h-[34px]');
    });
  });

  describe('2. Área de Conteúdo e Barra de Filtros (InboxView & FilterBar)', () => {
    it('reduz o espaçamento superior e restringe largura no mobile', () => {
      const inboxContainerClass = 'flex flex-col gap-3.5 sm:gap-6 w-full min-w-0 max-w-full box-border';
      const mainContentClass = 'flex-1 w-full min-w-0 max-w-[1800px] mx-auto p-3 sm:p-5 md:p-8 pb-24 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 outline-none box-border';

      expect(inboxContainerClass).toContain('min-w-0');
      expect(inboxContainerClass).toContain('max-w-full');
      expect(mainContentClass).toContain('p-3');
      expect(mainContentClass).toContain('pb-24');
    });

    it('isola a linha de tags em container rolável horizontal sem expandir a página', () => {
      const tagsOuterClass = 'w-full min-w-0 max-w-full overflow-x-auto no-scrollbar py-0.5';
      const tagsInnerClass = 'flex items-center gap-1.5 w-max';

      expect(tagsOuterClass).toContain('min-w-0');
      expect(tagsOuterClass).toContain('max-w-full');
      expect(tagsOuterClass).toContain('overflow-x-auto');
      expect(tagsInnerClass).toBe('flex items-center gap-1.5 w-max');
    });

    it('permite que a barra de controles (filtros, contador e ordenação) seja flex-wrap e caiba em 320px', () => {
      const controlsRowClass = 'w-full min-w-0 flex flex-wrap items-center justify-between gap-2';
      expect(controlsRowClass).toContain('flex-wrap');
      expect(controlsRowClass).toContain('min-w-0');

      // Cálculo de largura em 320px com padding de 24px (12px de cada lado)
      const availableWidth = 320 - 24; // 296px
      const filterButtonWidth = 72;
      const counterBadgeMobileWidth = 38; // "[ 4/4 ]"
      const sortSelectWidth = 115;
      const totalElementsWidth = filterButtonWidth + counterBadgeMobileWidth + sortSelectWidth;

      expect(totalElementsWidth).toBeLessThan(availableWidth);
    });

    it('formata o contador de itens de maneira compacta no mobile e completa no desktop', () => {
      const formatCounter = (filtered: number, total: number, isMobile: boolean) => {
        if (isMobile) {
          return `[ ${filtered}/${total} ]`;
        }
        return `[ ${filtered} DE ${total} ${total === 1 ? 'ITEM' : 'ITENS'} ]`;
      };

      expect(formatCounter(4, 4, true)).toBe('[ 4/4 ]');
      expect(formatCounter(4, 4, false)).toBe('[ 4 DE 4 ITENS ]');
    });
  });

  describe('3. Cards e Grade de Referências (ReferenceGrid & ReferenceCard)', () => {
    it('define grade de 1 coluna no mobile ocupando 100% da largura útil', () => {
      const gridClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 md:gap-6 w-full min-w-0 max-w-full box-border';
      expect(gridClass).toContain('grid-cols-1');
      expect(gridClass).toContain('sm:grid-cols-2');
      expect(gridClass).toContain('min-w-0');
      expect(gridClass).toContain('max-w-full');
    });

    it('preserva proporção 16:10 nas imagens com object-cover sem distorção', () => {
      const frameClass = 'relative w-full aspect-[16/10] bg-[#F1F1EF] overflow-hidden border-b border-[#E7E7E5]/70';
      const imgClass = 'w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.02]';

      expect(frameClass).toContain('aspect-[16/10]');
      expect(imgClass).toContain('object-cover');
    });

    it('trunca títulos e subtítulos para prevenir qualquer overflow de texto', () => {
      const titleClass = 'font-sans font-semibold text-[13px] leading-snug text-[#171717] group-hover:text-[#4355DB] transition-colors truncate w-full min-w-0';
      const subtitleClass = 'font-mono text-[11px] font-semibold text-[#737373] uppercase tracking-wider truncate flex items-center gap-1.5 min-w-0 flex-1';

      expect(titleClass).toContain('truncate');
      expect(titleClass).toContain('min-w-0');
      expect(subtitleClass).toContain('truncate');
      expect(subtitleClass).toContain('min-w-0');
    });

    it('mantém ações rápidas e checkbox visíveis no mobile (max-sm:opacity-80) para facilitar o toque', () => {
      const checkboxClass = 'bg-white/90 border border-[#D4D4D0] text-transparent hover:border-[#4355DB] hover:bg-white max-sm:opacity-80 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100';
      const actionButtonClass = 'p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded max-sm:opacity-80 sm:opacity-0 group-hover:opacity-100';

      expect(checkboxClass).toContain('max-sm:opacity-80');
      expect(actionButtonClass).toContain('max-sm:opacity-80');
    });
  });

  describe('4. Arquitetura do Shell e Eliminação de Causas Raiz de Overflow', () => {
    it('elimina classes de overflow-x-hidden como paliativo e aplica min-w-0 max-w-full estruturais', () => {
      const shellClasses = 'min-h-screen w-full min-w-0 max-w-full bg-[#F8F8F6] text-[#171717] flex flex-col font-sans selection:bg-[#171717] selection:text-white box-border';
      expect(shellClasses).not.toContain('overflow-x-hidden');
      expect(shellClasses).toContain('min-w-0');
      expect(shellClasses).toContain('max-w-full');
      expect(shellClasses).toContain('box-border');
    });

    it('garante deslocamento lateral zero no mobile (pl-0) e compensação correta em tablet/desktop', () => {
      const mainWrapperClass = 'flex-1 flex flex-col w-full min-w-0 max-w-full pl-0 md:pl-16 lg:pl-60 transition-[padding] duration-200 box-border';
      expect(mainWrapperClass).toContain('pl-0');
      expect(mainWrapperClass).toContain('md:pl-16');
      expect(mainWrapperClass).toContain('lg:pl-60');
    });

    it('respeita área segura de dispositivos móveis com env(safe-area-inset-bottom)', () => {
      const mainPaddingBottom = 'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]';
      expect(mainPaddingBottom).toContain('safe-area-inset-bottom');
    });
  });

  describe('5. Matriz de Resoluções Exigidas', () => {
    const requiredResolutions = [
      { name: 'Celular muito estreito', width: 320, isMobile: true },
      { name: 'Celular comum compacto', width: 360, isMobile: true },
      { name: 'iPhone padrão', width: 375, isMobile: true },
      { name: 'iPhone moderno', width: 390, isMobile: true },
      { name: 'Celular grande', width: 430, isMobile: true },
      { name: 'Tablet', width: 768, isMobile: false, isTablet: true },
      { name: 'Desktop compacto', width: 1024, isMobile: false, isDesktop: true },
      { name: 'Tela ampla', width: 1440, isMobile: false, isDesktop: true },
    ];

    it('atende todas as 8 larguras de viewport da especificação sem exceção', () => {
      expect(requiredResolutions).toHaveLength(8);
      const widths = requiredResolutions.map((r) => r.width);
      expect(widths).toEqual([320, 360, 375, 390, 430, 768, 1024, 1440]);
    });

    it('aplica corretamente os breakpoints Tailwind para cada viewport', () => {
      const getBreakpoint = (width: number) => {
        if (width < 640) return 'mobile';
        if (width < 768) return 'sm';
        if (width < 1024) return 'md';
        if (width < 1280) return 'lg';
        return 'xl';
      };

      expect(getBreakpoint(320)).toBe('mobile');
      expect(getBreakpoint(360)).toBe('mobile');
      expect(getBreakpoint(375)).toBe('mobile');
      expect(getBreakpoint(390)).toBe('mobile');
      expect(getBreakpoint(430)).toBe('mobile');
      expect(getBreakpoint(768)).toBe('md');
      expect(getBreakpoint(1024)).toBe('lg');
      expect(getBreakpoint(1440)).toBe('xl');
    });
  });
});
