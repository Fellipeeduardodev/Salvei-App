import React from 'react';
import {
  Inbox,
  Search,
  Plus,
  Layers,
  Menu,
} from 'lucide-react';
import { NavigationDestination } from '../../types/reference';

interface MobileNavBarProps {
  currentDestination: NavigationDestination;
  onNavigate: (destination: NavigationDestination) => void;
  onOpenSearch: () => void;
  onOpenAddModal: (mode?: 'image' | 'url') => void;
  onOpenMenuSheet: () => void;
  isMenuSheetOpen: boolean;
  isSelectionModeActive?: boolean;
  isFavoritesFilterActive?: boolean;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  currentDestination,
  onNavigate,
  onOpenSearch,
  onOpenAddModal,
  onOpenMenuSheet,
  isMenuSheetOpen,
  isSelectionModeActive = false,
  isFavoritesFilterActive = false,
}) => {
  return (
    <nav
      role="navigation"
      aria-label="Navegação móvel principal"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E7E5] transition-transform duration-200 ease-out md:hidden ${
        isSelectionModeActive ? 'translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="h-14 sm:h-16 flex items-center justify-around px-1 max-w-md mx-auto">
        {/* 1. Início (Inbox / Referências) */}
        <button
          type="button"
          onClick={() => onNavigate('inbox')}
          className={`flex-1 min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            currentDestination === 'inbox' && !isFavoritesFilterActive
              ? 'text-[#4355DB]'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
          aria-label="Ir para a Caixa de entrada de referências"
          aria-current={currentDestination === 'inbox' && !isFavoritesFilterActive ? 'page' : undefined}
        >
          <div className="relative">
            <Inbox
              size={18}
              strokeWidth={currentDestination === 'inbox' && !isFavoritesFilterActive ? 2.3 : 1.8}
            />
            {currentDestination === 'inbox' && !isFavoritesFilterActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4355DB]" />
            )}
          </div>
          <span
            className={`text-[10px] font-sans tracking-tight ${
              currentDestination === 'inbox' && !isFavoritesFilterActive
                ? 'font-bold text-[#171717]'
                : 'font-medium'
            }`}
          >
            Início
          </span>
        </button>

        {/* 2. Buscar (Pesquisa rápida & Command Palette) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex-1 min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors text-[#737373] hover:text-[#171717] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
          aria-label="Buscar referências ou acionar comandos rápidos"
        >
          <Search size={18} strokeWidth={1.8} />
          <span className="text-[10px] font-sans font-medium tracking-tight">Buscar</span>
        </button>

        {/* 3. Adicionar (+) - Botão central em destaque */}
        <div className="flex-1 flex items-center justify-center">
          <button
            type="button"
            onClick={() => onOpenAddModal('image')}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#171717] hover:bg-[#2B2B2B] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] border border-[#2E2E2E]"
            title="Adicionar nova referência visual ou link"
            aria-label="Adicionar nova referência"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* 4. Coleções */}
        <button
          type="button"
          onClick={() => onNavigate('collections')}
          className={`flex-1 min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            currentDestination === 'collections'
              ? 'text-[#4355DB]'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
          aria-label="Ver Coleções temáticas"
          aria-current={currentDestination === 'collections' ? 'page' : undefined}
        >
          <div className="relative">
            <Layers
              size={18}
              strokeWidth={currentDestination === 'collections' ? 2.3 : 1.8}
            />
            {currentDestination === 'collections' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4355DB]" />
            )}
          </div>
          <span
            className={`text-[10px] font-sans tracking-tight ${
              currentDestination === 'collections' ? 'font-bold text-[#171717]' : 'font-medium'
            }`}
          >
            Coleções
          </span>
        </button>

        {/* 5. Mais (Menu da aplicação, Projetos, Tags, Configurações e Conta) */}
        <button
          type="button"
          onClick={onOpenMenuSheet}
          className={`flex-1 min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
            isMenuSheetOpen ||
            currentDestination === 'projects' ||
            currentDestination === 'tags' ||
            currentDestination === 'settings' ||
            isFavoritesFilterActive
              ? 'text-[#4355DB]'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
          aria-label="Mais opções, projetos e configurações"
          aria-expanded={isMenuSheetOpen}
        >
          <div className="relative">
            <Menu
              size={18}
              strokeWidth={
                isMenuSheetOpen ||
                currentDestination === 'projects' ||
                currentDestination === 'tags' ||
                currentDestination === 'settings' ||
                isFavoritesFilterActive
                  ? 2.3
                  : 1.8
              }
            />
            {(currentDestination === 'projects' ||
              currentDestination === 'tags' ||
              currentDestination === 'settings' ||
              isFavoritesFilterActive) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4355DB]" />
            )}
          </div>
          <span
            className={`text-[10px] font-sans tracking-tight ${
              isMenuSheetOpen ||
              currentDestination === 'projects' ||
              currentDestination === 'tags' ||
              currentDestination === 'settings' ||
              isFavoritesFilterActive
                ? 'font-bold text-[#171717]'
                : 'font-medium'
            }`}
          >
            Mais
          </span>
        </button>
      </div>
    </nav>
  );
};
