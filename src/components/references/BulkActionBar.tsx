import React from 'react';
import {
  CheckSquare,
  Square,
  Star,
  StarOff,
  Layers,
  Briefcase,
  Tag,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  totalVisibleCount: number;
  allVisibleSelected: boolean;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onBulkFavorite: (favorite: boolean) => void;
  onOpenCollectionModal: () => void;
  onOpenProjectModal: () => void;
  onOpenTagModal: () => void;
  onOpenDeleteModal: () => void;
  isProcessing?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalVisibleCount,
  allVisibleSelected,
  onSelectAllVisible,
  onClearSelection,
  onBulkFavorite,
  onOpenCollectionModal,
  onOpenProjectModal,
  onOpenTagModal,
  onOpenDeleteModal,
  isProcessing = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Ações em lote para referências selecionadas"
      className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 z-50 w-full md:w-auto md:max-w-max bg-[#171717] text-white rounded-none md:rounded-md px-2.5 sm:px-4 py-2 sm:py-2.5 shadow-2xl border-t md:border border-[#2E2E2E] flex items-center justify-between md:justify-start gap-1.5 sm:gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Selected Counter & Toggle All */}
      <div className="flex items-center gap-1.5 sm:gap-2 pr-1.5 sm:pr-2 border-r border-[#333333] flex-shrink-0">
        <button
          type="button"
          onClick={allVisibleSelected ? onClearSelection : onSelectAllVisible}
          className="p-1.5 min-h-[34px] min-w-[34px] flex items-center justify-center rounded hover:bg-[#2B2B2B] text-[#A8A8A6] hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
          title={
            allVisibleSelected
              ? 'Desmarcar todas as visíveis'
              : `Selecionar todas as ${totalVisibleCount} referências visíveis (Ctrl+A)`
          }
          aria-label="Alternar seleção de todas as visíveis"
        >
          {allVisibleSelected ? (
            <CheckSquare size={16} className="text-[#4355DB]" />
          ) : (
            <Square size={16} />
          )}
        </button>

        <span className="font-mono text-xs font-semibold tracking-wider text-white whitespace-nowrap">
          [ {selectedCount} ]
        </span>
      </div>

      {/* Primary Actions Group (Smooth horizontal scroll for small screens) */}
      <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
        {/* Favoritar */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onBulkFavorite(true)}
          className="px-2 sm:px-2.5 py-1.5 min-h-[34px] rounded hover:bg-[#2B2B2B] disabled:opacity-40 text-xs font-medium text-[#E7E7E5] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
          title="Marcar selecionadas como favoritas"
          aria-label="Marcar selecionadas como favoritas"
        >
          <Star size={13} className="text-[#F59E0B] fill-[#F59E0B]" />
          <span className="hidden sm:inline">Favoritar</span>
        </button>

        {/* Desfavoritar */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onBulkFavorite(false)}
          className="px-2 py-1.5 min-h-[34px] rounded hover:bg-[#2B2B2B] disabled:opacity-40 text-xs font-medium text-[#A8A8A6] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
          title="Remover dos favoritos"
          aria-label="Remover selecionadas dos favoritos"
        >
          <StarOff size={13} />
          <span className="hidden md:inline">Desfavoritar</span>
        </button>

        <div className="w-px h-4 bg-[#333333] mx-0.5 flex-shrink-0" />

        {/* Coleção */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onOpenCollectionModal}
          className="px-2 sm:px-2.5 py-1.5 min-h-[34px] rounded hover:bg-[#2B2B2B] disabled:opacity-40 text-xs font-medium text-[#E7E7E5] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
          title="Adicionar ou remover de uma coleção"
          aria-label="Gerenciar coleção das selecionadas"
        >
          <Layers size={13} className="text-[#A8A8A6]" />
          <span>Coleção</span>
        </button>

        {/* Projeto */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onOpenProjectModal}
          className="px-2 sm:px-2.5 py-1.5 min-h-[34px] rounded hover:bg-[#2B2B2B] disabled:opacity-40 text-xs font-medium text-[#E7E7E5] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
          title="Associar ou desassociar de um projeto"
          aria-label="Associar selecionadas a um projeto"
        >
          <Briefcase size={13} className="text-[#A8A8A6]" />
          <span>Projeto</span>
        </button>

        {/* Etiquetas */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onOpenTagModal}
          className="px-2 sm:px-2.5 py-1.5 min-h-[34px] rounded hover:bg-[#2B2B2B] disabled:opacity-40 text-xs font-medium text-[#E7E7E5] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
          title="Adicionar ou remover etiquetas em lote"
          aria-label="Gerenciar etiquetas das selecionadas"
        >
          <Tag size={13} className="text-[#A8A8A6]" />
          <span>Etiquetas</span>
        </button>

        <div className="w-px h-4 bg-[#333333] mx-0.5 flex-shrink-0" />

        {/* Excluir (Destructive Action) */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onOpenDeleteModal}
          className="px-2 sm:px-2.5 py-1.5 min-h-[34px] rounded hover:bg-[#EF4444]/20 hover:text-[#EF4444] text-[#EF4444] disabled:opacity-40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
          title="Excluir referências selecionadas (Del / Backspace)"
          aria-label="Excluir referências selecionadas"
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Excluir</span>
        </button>
      </div>

      {/* Clear / Cancel Action */}
      <div className="pl-1 sm:pl-1.5 border-l border-[#333333] flex items-center gap-1 flex-shrink-0">
        {isProcessing ? (
          <div className="px-1.5 sm:px-2 flex items-center gap-1 text-xs text-[#A8A8A6]">
            <Loader2 size={13} className="animate-spin text-[#4355DB]" />
            <span className="hidden sm:inline font-mono text-[11px]">Processando...</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClearSelection}
            className="p-1 min-h-[34px] min-w-[34px] flex items-center justify-center rounded text-[#A8A8A6] hover:text-white hover:bg-[#2B2B2B] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
            title="Limpar seleção (Esc)"
            aria-label="Limpar seleção"
          >
            <X size={15} />
            <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 bg-[#262626] border border-[#333333] rounded text-[9px] font-mono text-[#A8A8A6]">
              Esc
            </kbd>
          </button>
        )}
      </div>
    </div>
  );
};
