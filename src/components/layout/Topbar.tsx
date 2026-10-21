import React, { useRef, useState, useEffect } from 'react';
import {
  Search,
  Command,
  Image as ImageIcon,
  Globe,
  X,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: (mode?: 'image' | 'url') => void;
  onToggleMobileSidebar?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcutsModal?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenCommandPalette,
  onOpenShortcutsModal,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [draftQuery, setDraftQuery] = useState(searchQuery);

  // Sync draft query if external searchQuery changed (e.g. via command palette or clearing filters)
  useEffect(() => {
    setDraftQuery(searchQuery);
  }, [searchQuery]);

  // Debounce propagate to parent
  useEffect(() => {
    if (draftQuery === searchQuery) return;

    const timer = setTimeout(() => {
      onSearchChange(draftQuery);
    }, 180);

    return () => clearTimeout(timer);
  }, [draftQuery, searchQuery, onSearchChange]);

  const handleClear = () => {
    setDraftQuery('');
    onSearchChange('');
    searchInputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-30 w-full min-w-0 max-w-full bg-white/95 backdrop-blur-md border-b border-[#E7E7E5] px-3 sm:px-4 md:px-8 transition-colors box-border">
      {/* 1. MOBILE HEADER (< md) — Compact, clean, zero overflow */}
      <div className="flex md:hidden items-center justify-between gap-2 h-13 w-full min-w-0">
        {/* Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[#171717] flex items-center justify-center text-white shadow-2xs">
            <Compass size={15} strokeWidth={2.2} />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-[#171717]">
            Curator
          </span>
        </div>

        {/* Search Input (Expands to fill available width) */}
        <div className="flex-1 min-w-0 max-w-full relative flex items-center" role="search">
          <div className="absolute left-2.5 flex items-center pointer-events-none text-[#737373]" aria-hidden="true">
            <Search size={13} strokeWidth={2} />
          </div>

          <input
            id="global-search-input"
            ref={searchInputRef}
            type="text"
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && draftQuery) {
                e.preventDefault();
                handleClear();
              } else if (e.key === 'Enter') {
                e.preventDefault();
                onSearchChange(draftQuery);
              }
            }}
            aria-label="Buscar por título, domínio ou etiqueta"
            placeholder="Buscar referências..."
            className="w-full h-8 pl-7 pr-7 rounded-md bg-[#F8F8F6] hover:bg-white text-[#171717] placeholder-[#A8A8A6] text-xs border border-[#E7E7E5] focus:bg-white focus:border-[#4355DB] outline-none transition-colors"
          />

          {draftQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-1.5 p-1 rounded text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
              title="Limpar pesquisa (Esc)"
              aria-label="Limpar pesquisa"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Shortcuts / Info button */}
        {onOpenShortcutsModal && (
          <button
            type="button"
            onClick={onOpenShortcutsModal}
            className="p-1.5 min-h-[34px] min-w-[34px] flex items-center justify-center rounded text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
            title="Guia de atalhos de teclado (?)"
            aria-label="Atalhos de teclado"
          >
            <HelpCircle size={15} />
          </button>
        )}
      </div>

      {/* 2. DESKTOP & TABLET HEADER (>= md) — Preserved desktop experience */}
      <div className="hidden md:flex items-center justify-between gap-4 h-14 w-full min-w-0">
        {/* Center: Global Search Bar & Command Menu Trigger */}
        <div className="flex-1 max-w-xl mx-auto min-w-0" role="search">
          <div className="relative flex items-center w-full">
            <div className="absolute left-3 flex items-center pointer-events-none text-[#737373]" aria-hidden="true">
              <Search size={15} strokeWidth={2} />
            </div>

            <input
              type="text"
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && draftQuery) {
                  e.preventDefault();
                  handleClear();
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  onSearchChange(draftQuery);
                }
              }}
              aria-label="Buscar por título, domínio ou etiqueta"
              placeholder="Buscar por título, domínio, etiqueta... (/ ou Ctrl+K)"
              className="w-full h-9 pl-9 pr-14 rounded-md bg-[#F8F8F6] hover:bg-white text-[#171717] placeholder-[#A8A8A6] text-[13px] border border-[#E7E7E5] hover:border-[#D4D4D0] focus:bg-white focus:border-[#4355DB] focus:ring-2 focus:ring-[#4355DB]/15 transition-all duration-150 outline-none"
            />

            <div className="absolute right-2.5 flex items-center gap-1.5">
              {draftQuery ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded text-[#737373] hover:text-[#171717] hover:bg-[#E7E7E5]/60 transition-colors cursor-pointer"
                  title="Limpar pesquisa (Esc)"
                  aria-label="Limpar pesquisa"
                >
                  <X size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  className="flex items-center gap-1 cursor-pointer"
                  title="Abrir menu de comandos e busca rápida (Ctrl+K)"
                  aria-label="Abrir menu de comandos"
                >
                  <kbd className="px-1.5 py-0.5 rounded border border-[#E7E7E5] bg-white hover:bg-[#F1F1EF] text-[10px] font-mono text-[#737373] hover:text-[#171717] tracking-tighter flex items-center gap-0.5 shadow-2xs transition-colors">
                    <Command size={10} />
                    <span>K</span>
                  </kbd>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions e Atalhos */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onOpenShortcutsModal && (
            <button
              type="button"
              onClick={onOpenShortcutsModal}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
              title="Guia de atalhos de teclado (?)"
              aria-label="Atalhos de teclado"
            >
              <HelpCircle size={16} />
            </button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenAddModal('image')}
            iconLeft={<ImageIcon size={14} />}
            className="font-medium text-xs whitespace-nowrap cursor-pointer"
            title="Importar imagens locais (arraste ou cole com Ctrl+V)"
          >
            <span>Adicionar imagem</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpenAddModal('url')}
            iconLeft={<Globe size={14} />}
            className="font-semibold text-xs whitespace-nowrap cursor-pointer min-h-[36px]"
            title="Salvar referência por endereço URL (N)"
          >
            <span>Adicionar por URL</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
