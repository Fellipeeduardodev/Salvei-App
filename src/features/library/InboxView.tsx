import React from 'react';
import {
  Reference,
  SortOption,
  Project,
  Collection,
  ContentTypeFilter,
} from '../../types/reference';
import { FilterBar } from '../../components/references/FilterBar';
import { ReferenceGrid } from '../../components/references/ReferenceGrid';

interface InboxViewProps {
  references: Reference[];
  totalReferencesCount: number;
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  availableProjects: Project[];
  selectedProjectIds: string[];
  onToggleProject: (projectId: string) => void;
  availableCollections: Collection[];
  selectedCollectionIds: string[];
  onToggleCollection: (collectionId: string) => void;
  contentTypes: ContentTypeFilter[];
  onToggleContentType: (type: ContentTypeFilter) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  searchQuery?: string;
  onClearSearchQuery?: () => void;
  onClearAllFilters: () => void;
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
  onOpenAddModal?: () => void;
  onAttachImageClick?: (referenceId: string) => void;
  isFiltered: boolean;
}

export const InboxView: React.FC<InboxViewProps> = ({
  references,
  totalReferencesCount,
  availableTags,
  selectedTags,
  onToggleTag,
  availableProjects,
  selectedProjectIds,
  onToggleProject,
  availableCollections,
  selectedCollectionIds,
  onToggleCollection,
  contentTypes,
  onToggleContentType,
  sortOption,
  onSortChange,
  searchQuery,
  onClearSearchQuery,
  onClearAllFilters,
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
  onOpenAddModal,
  onAttachImageClick,
  isFiltered,
}) => {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-6 w-full min-w-0 max-w-full box-border">
      {/* Editorial Header */}
      <div className="flex flex-col gap-1 min-w-0">
        <h1 className="font-sans font-bold text-xl sm:text-2xl md:text-3xl text-[#171717] dark:text-[#F3F4F6] tracking-tight">
          Caixa de entrada
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#737373] dark:text-[#9CA3AF] max-w-xl leading-relaxed">
          Todas as suas referências visuais e URLs reunidas com busca global, seleção em lote e ações rápidas.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <FilterBar
        filteredCount={references.length}
        totalCount={totalReferencesCount}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={onToggleTag}
        availableProjects={availableProjects}
        selectedProjectIds={selectedProjectIds}
        onToggleProject={onToggleProject}
        availableCollections={availableCollections}
        selectedCollectionIds={selectedCollectionIds}
        onToggleCollection={onToggleCollection}
        contentTypes={contentTypes}
        onToggleContentType={onToggleContentType}
        sortOption={sortOption}
        onSortChange={onSortChange}
        searchQuery={searchQuery}
        onClearSearchQuery={onClearSearchQuery}
        onClearAllFilters={onClearAllFilters}
        isFiltered={isFiltered}
      />

      {/* Reference Cards Grid with Multi-select and Quick Actions */}
      <ReferenceGrid
        references={references}
        selectedReferenceId={selectedReferenceId}
        selectedBatchIds={selectedBatchIds}
        isSelectionModeActive={isSelectionModeActive}
        onSelectReference={onSelectReference}
        onToggleBatchSelect={onToggleBatchSelect}
        onToggleFavorite={onToggleFavorite}
        onQuickEdit={onQuickEdit}
        onQuickDelete={onQuickDelete}
        onQuickAssociateProject={onQuickAssociateProject}
        onQuickAssociateCollection={onQuickAssociateCollection}
        onTagClick={onTagClick}
        onClearFilters={onClearAllFilters}
        onOpenAddModal={onOpenAddModal}
        onAttachImageClick={onAttachImageClick}
        isFiltered={isFiltered}
      />
    </div>
  );
};
