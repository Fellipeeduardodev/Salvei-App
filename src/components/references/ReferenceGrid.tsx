import React from 'react';
import { Reference } from '../../types/reference';
import { ReferenceCard } from './ReferenceCard';
import { SearchX, Plus, Inbox } from 'lucide-react';
import { Button } from '../ui/Button';

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
  onOpenAddModal?: () => void;
  onAttachImageClick?: (referenceId: string) => void;
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
  isFiltered = false,
}) => {
  // Case 1: Search / Filter returned no results (NO_SEARCH_RESULTS)
  if (isFiltered && references.length === 0) {
    return (
      <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center bg-white border border-[#E7E7E5] rounded-sm">
        <div className="w-12 h-12 rounded-full bg-[#F1F1EF] flex items-center justify-center text-[#737373] mb-4">
          <SearchX size={22} strokeWidth={1.8} />
        </div>
        <h3 className="font-sans font-semibold text-base text-[#171717] mb-1">
          Nenhuma referência encontrada
        </h3>
        <p className="font-sans text-xs text-[#737373] max-w-sm mb-5">
          Não encontramos referências correspondentes aos termos de busca ou filtros aplicados.
        </p>
        {onClearFilters && (
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            Limpar busca e filtros
          </Button>
        )}
      </div>
    );
  }

  // Case 2: Library is completely empty (EMPTY_INBOX)
  if (references.length === 0) {
    return (
      <div className="w-full py-24 px-4 flex flex-col items-center justify-center text-center bg-white border border-[#E7E7E5] rounded-sm">
        <div className="w-12 h-12 rounded-full bg-[#F1F1EF] flex items-center justify-center text-[#737373] mb-4">
          <Inbox size={22} strokeWidth={1.8} />
        </div>
        <h3 className="font-sans font-semibold text-base text-[#171717] mb-1">
          Sua biblioteca está vazia
        </h3>
        <p className="font-sans text-xs text-[#737373] max-w-sm mb-5">
          Capture e preserve referências visuais de layouts, tipografia, micro-interações e produtos digitais.
        </p>
        {onOpenAddModal && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            iconLeft={<Plus size={15} strokeWidth={2.5} />}
          >
            Adicionar primeira referência
          </Button>
        )}
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
        />
      ))}
    </div>
  );
};
