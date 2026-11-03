import React from 'react';
import {
  Reference,
  SortOption,
  Project,
  Collection,
  ContentTypeFilter,
  ColorPaletteItem,
} from '../../types/reference';
import { FilterBar } from '../../components/references/FilterBar';
import { ReferenceGrid } from '../../components/references/ReferenceGrid';
import { MoodboardView } from '../../components/references/MoodboardView';

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
  selectedColorHex?: string;
  onSelectColorHex?: (hex: string | undefined) => void;
  viewMode?: 'grid' | 'list' | 'moodboard';
  onViewModeChange?: (mode: 'grid' | 'list' | 'moodboard') => void;
  onOpenPresentation?: () => void;
  onOpenBookmarklet?: () => void;
  onUpdatePosition?: (referenceId: string, position: { x: number; y: number }) => void;
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
  onOpenAddModal?: (mode?: 'image' | 'url') => void;
  onAttachImageClick?: (referenceId: string) => void;
  onUpdatePalette?: (referenceId: string, palette: ColorPaletteItem[]) => void;
  onRestoreDemoReferences?: () => void;
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
  selectedColorHex,
  onSelectColorHex,
  viewMode = 'grid',
  onViewModeChange,
  onOpenPresentation,
  onOpenBookmarklet,
  onUpdatePosition,
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
  onUpdatePalette,
  onRestoreDemoReferences,
  isFiltered,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full min-w-0 max-w-full box-border">
      {/* Editorial Header with Tight Display and Archival Breadcrumbs */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4355DB] dark:text-[#6375F1]">
            Acervo Pessoal
          </span>
          <span className="text-[#A8A8A6] dark:text-[#6B7280] font-mono text-[10px] select-none">/</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#737373] dark:text-[#9CA3AF]">
            Entrada &amp; Curadoria
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-3 min-w-0">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#171717] dark:text-[#F3F4F6] tracking-[-0.03em] leading-tight">
            Caixa de entrada
          </h1>
          <span className="font-mono text-[11px] text-[#737373] dark:text-[#9CA3AF] tracking-wider tabular-nums px-2.5 py-0.5 rounded-full bg-[#EDEDEA] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139]">
            [ № {String(totalReferencesCount).padStart(2, '0')} {totalReferencesCount === 1 ? 'referência arquivada' : 'referências arquivadas'} ]
          </span>
        </div>
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
        selectedColorHex={selectedColorHex}
        onSelectColorHex={onSelectColorHex}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onOpenPresentation={onOpenPresentation}
        onOpenBookmarklet={onOpenBookmarklet}
        isFiltered={isFiltered}
      />

      {/* View Switcher: Moodboard Freeform Canvas vs Responsive Masonry Grid */}
      {viewMode === 'moodboard' ? (
        <MoodboardView
          references={references}
          selectedReferenceId={selectedReferenceId}
          onSelectReference={onSelectReference}
          onUpdatePosition={onUpdatePosition}
          onTagClick={onTagClick}
        />
      ) : (
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
          onUpdatePalette={onUpdatePalette}
          onRestoreDemoReferences={onRestoreDemoReferences}
          isFiltered={isFiltered}
        />
      )}
    </div>
  );
};
