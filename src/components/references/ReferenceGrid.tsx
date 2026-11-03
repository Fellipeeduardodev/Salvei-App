import React from 'react';
import { Reference, ColorPaletteItem } from '../../types/reference';
import { ReferenceCard } from './ReferenceCard';
import { SearchX, Plus, Globe, Image as ImageIcon, Sparkles, Command } from 'lucide-react';
import { Button } from '../ui/Button';
import { SalveiSymbol } from '../ui/Logo';

interface ReferenceGridProps {
  references: Reference[];
  selectedReferenceId?: string | null;
  selectedBatchIds?: string[];
  isSelectionModeActive?: boolean;
  onSelectReference?: (reference: Reference) => void;
  onToggleBatchSelect?: (referenceId: string, e?: React.MouseEvent) => void;
  onToggleFavorite?: (referenceId: string, nextFavorite: boolean) => void;
  onQuickEdit?: (reference: Reference) => void;
  onQuickDelete?: (reference: Reference) => void;
  onQuickAssociateProject?: (reference: Reference) => void;
  onQuickAssociateCollection?: (reference: Reference) => void;
  onTagClick?: (tag: string) => void;
  onClearFilters?: () => void;
  onOpenAddModal?: (mode?: 'image' | 'url') => void;
  onAttachImageClick?: (referenceId: string) => void;
  onUpdatePalette?: (referenceId: string, palette: ColorPaletteItem[]) => void;
  onRestoreDemoReferences?: () => void;
  isFiltered?: boolean;
}

export const ReferenceGrid: React.FC<ReferenceGridProps> = ({
  references,
  selectedReferenceId,
  selectedBatchIds = [],
  isSelectionModeActive = false,
  onSelectReference,
  onToggleBatchSelect,
  onToggleFavorite,
  onQuickEdit,
  onQuickDelete,
  onQuickAssociateProject,
  onQuickAssociateCollection,
  onTagClick,
  onClearFilters,
  onOpenAddModal,
  onAttachImageClick,
  onUpdatePalette,
  onRestoreDemoReferences,
  isFiltered = false,
}) => {
  // Case 1: Search / Filter returned no results (NO_SEARCH_RESULTS)
  if (isFiltered && references.length === 0) {
    return (
      <div className="relative w-full py-20 px-6 flex flex-col items-center justify-center text-center bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-sm bg-atelier-grid transition-colors shadow-2xs">
        {/* Crop corners for architectural registration */}
        <span className="crop-corner-tl" />
        <span className="crop-corner-tr" />
        <span className="crop-corner-bl" />
        <span className="crop-corner-br" />

        <div className="w-12 h-12 rounded-md bg-[#F1F1EF] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-center text-[#737373] dark:text-[#9CA3AF] mb-4 shadow-2xs">
          <SearchX size={20} strokeWidth={1.8} />
        </div>
        <span className="font-mono text-[10px] uppercase font-semibold tracking-[0.16em] text-[#737373] dark:text-[#9CA3AF] mb-1">
          [ NENHUM REGISTRO LOCALIZADO ]
        </span>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-[#171717] dark:text-[#F3F4F6] tracking-tight mb-2">
          Nenhuma referência encontrada
        </h3>
        <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF] max-w-sm mb-6 leading-relaxed">
          Os filtros ou termos de pesquisa aplicados não retornaram resultados no seu acervo atual.
        </p>
        {onClearFilters && (
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            Limpar busca e filtros
          </Button>
        )}
      </div>
    );
  }

  // Case 2: Library is completely empty (EMPTY_INBOX - Autoral Digital Atelier)
  if (references.length === 0) {
    return (
      <div className="relative w-full py-20 sm:py-28 px-6 sm:px-12 flex flex-col items-center justify-center text-center bg-white/80 dark:bg-[#191B20]/80 backdrop-blur-xs border border-[#E7E7E5] dark:border-[#2D3139] rounded-sm bg-atelier-grid transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Crop corners for architectural registration */}
        <span className="crop-corner-tl" />
        <span className="crop-corner-tr" />
        <span className="crop-corner-bl" />
        <span className="crop-corner-br" />

        {/* Studio Emblem with subtle ambient glow */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-lg bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-center shadow-xs">
            <SalveiSymbol size={32} />
          </div>
        </div>

        {/* Archival Catalog Code */}
        <span className="font-mono text-[10px] uppercase font-semibold tracking-[0.18em] text-[#4355DB] dark:text-[#6375F1] px-2.5 py-0.5 rounded-full bg-[#4355DB]/8 dark:bg-[#6375F1]/10 border border-[#4355DB]/20 dark:border-[#6375F1]/30 mb-3 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4355DB] dark:bg-[#6375F1]" />
          № 000 — ACERVO PRONTO PARA RECEBER REFERÊNCIAS
        </span>

        {/* Display Headline */}
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171717] dark:text-[#F3F4F6] tracking-[-0.03em] leading-tight mb-3 max-w-lg">
          Mesa de Curadoria em Branco
        </h2>

        {/* Poetic & Functional Copy */}
        <p className="font-sans text-xs sm:text-sm text-[#737373] dark:text-[#9CA3AF] max-w-md mb-8 leading-relaxed">
          Capture e preserve referências visuais de layouts, tipografia, micro-interações e produtos digitais com fricção zero.
        </p>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {onOpenAddModal && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAddModal('url')}
                iconLeft={<Globe size={14} />}
                className="font-semibold text-xs whitespace-nowrap min-h-[38px] shadow-xs cursor-pointer"
              >
                Adicionar por URL (N)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpenAddModal('image')}
                iconLeft={<ImageIcon size={14} />}
                className="font-medium text-xs whitespace-nowrap min-h-[38px] cursor-pointer"
              >
                Importar Imagem
              </Button>
            </>
          )}

          {/* Quick Demo Restore Seed */}
          {onRestoreDemoReferences && (
            <button
              type="button"
              onClick={onRestoreDemoReferences}
              className="px-3 py-2 rounded-md bg-[#F1F1EF] dark:bg-[#20232A] hover:bg-[#E7E7E5] dark:hover:bg-[#282C35] border border-[#E7E7E5] dark:border-[#2D3139] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] font-mono text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs min-h-[38px]"
              title="Carregar 3 referências de arquitetura e design para testar a galeria"
            >
              <Sparkles size={13} className="text-[#4355DB] dark:text-[#6375F1]" />
              <span>Carregar referências de exemplo</span>
            </button>
          )}
        </div>

        {/* Keyboard Shortcuts Micro-Bar */}
        <div className="mt-8 pt-5 border-t border-[#E7E7E5]/70 dark:border-[#2D3139]/70 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-[#A8A8A6] dark:text-[#6B7280]">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] text-[#171717] dark:text-[#F3F4F6] font-semibold shadow-2xs">Ctrl + V</kbd>
            <span>Colar link ou imagem</span>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] text-[#171717] dark:text-[#F3F4F6] font-semibold shadow-2xs">N</kbd>
            <span>Nova URL</span>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] text-[#171717] dark:text-[#F3F4F6] font-semibold shadow-2xs">Ctrl + K</kbd>
            <span>Buscar</span>
          </span>
        </div>
      </div>
    );
  }

  // Case 3: Display references in responsive grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 md:gap-6 w-full min-w-0 max-w-full box-border">
      {references.map((reference) => (
        <ReferenceCard
          key={reference.id}
          reference={reference}
          isSelected={selectedReferenceId === reference.id}
          isChecked={selectedBatchIds.includes(reference.id)}
          isSelectionModeActive={isSelectionModeActive}
          onToggleSelect={onToggleBatchSelect}
          onToggleFavorite={onToggleFavorite}
          onQuickEdit={onQuickEdit}
          onQuickDelete={onQuickDelete}
          onQuickAssociateProject={onQuickAssociateProject}
          onQuickAssociateCollection={onQuickAssociateCollection}
          onClick={() => onSelectReference?.(reference)}
          onTagClick={onTagClick}
          onAttachImageClick={onAttachImageClick}
          onUpdatePalette={onUpdatePalette}
        />
      ))}
    </div>
  );
};
