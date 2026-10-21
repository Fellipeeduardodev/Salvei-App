import React, { useState } from 'react';
import {
  SortOption,
  Project,
  Collection,
  ContentTypeFilter,
} from '../../types/reference';
import {
  ArrowDownUp,
  Filter,
  X,
  Tag,
  Briefcase,
  Layers,
  Code2,
  FileText,
  Paperclip,
  Image as ImageIcon,
  ChevronDown,
  Star,
} from 'lucide-react';

interface FilterBarProps {
  filteredCount: number;
  totalCount: number;
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
  isFiltered?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filteredCount,
  totalCount,
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
  isFiltered = false,
}) => {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  const CONTENT_TYPE_LABELS: Record<
    ContentTypeFilter,
    { label: string; icon: React.ReactNode }
  > = {
    is_favorite: { label: 'Favoritas', icon: <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" /> },
    has_image: { label: 'Com imagem', icon: <ImageIcon size={12} /> },
    has_code: { label: 'Com código', icon: <Code2 size={12} /> },
    has_notes: { label: 'Com anotações', icon: <FileText size={12} /> },
    has_files: { label: 'Com arquivos', icon: <Paperclip size={12} /> },
  };

  const hasActiveFilters =
    Boolean(searchQuery && searchQuery.trim().length > 0) ||
    selectedTags.length > 0 ||
    selectedProjectIds.length > 0 ||
    selectedCollectionIds.length > 0 ||
    contentTypes.length > 0;

  return (
    <div className="w-full min-w-0 max-w-full flex flex-col gap-2.5 sm:gap-3 pb-3 sm:pb-5 pt-0.5 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70 select-none box-border">
      {/* 1. Quick Tags Chips Row (Bounded horizontal scroll, zero page expansion) */}
      <div className="w-full min-w-0 max-w-full overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 w-max">
          <button
            onClick={() => {
              if (selectedTags.length > 0) {
                selectedTags.forEach((t) => onToggleTag(t));
              }
            }}
            className={`h-7 px-3 rounded-full text-xs font-mono font-medium tracking-wider transition-colors whitespace-nowrap cursor-pointer border ${
              selectedTags.length === 0
                ? 'bg-[#4355DB] dark:bg-[#6375F1] text-white font-semibold border-[#4355DB] dark:border-[#6375F1]'
                : 'bg-white dark:bg-[#191B20] border-[#E7E7E5] dark:border-[#2D3139] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:border-[#D4D4D0] dark:hover:border-[#3E434D]'
            }`}
          >
            TODAS AS TAGS
          </button>

          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`h-7 px-3 rounded-full text-xs font-mono font-medium tracking-wider transition-colors whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-[#4355DB] dark:bg-[#6375F1] text-white font-semibold border-[#4355DB] dark:border-[#6375F1]'
                    : 'bg-white dark:bg-[#191B20] border-[#E7E7E5] dark:border-[#2D3139] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:border-[#D4D4D0] dark:hover:border-[#3E434D]'
                }`}
                title={`Alternar filtro #${tag} (combinação OR com outras tags)`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Controls Toolbar (Filtros, Contador & Ordenação) — Fits smoothly without overflow */}
      <div className="w-full min-w-0 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Advanced Filter Toggle Button & Counter Badge */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <button
            onClick={() => setIsAdvancedFiltersOpen((prev) => !prev)}
            className={`h-7 sm:h-7 px-2.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer min-h-[34px] sm:min-h-auto ${
              isAdvancedFiltersOpen || hasActiveFilters
                ? 'bg-[#171717] dark:bg-[#4355DB] text-white border-[#171717] dark:border-[#4355DB]'
                : 'bg-white dark:bg-[#191B20] border-[#E7E7E5] dark:border-[#2D3139] text-[#737373] dark:text-[#9CA3AF] hover:border-[#D4D4D0] dark:hover:border-[#3E434D] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
            }`}
            title="Expandir filtros facetados de projeto, coleção e tipo de mídia"
          >
            <Filter size={12} strokeWidth={2} />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            )}
            <ChevronDown
              size={12}
              className={`transition-transform duration-150 ${
                isAdvancedFiltersOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dynamic Counter Badge (Compact on mobile, descriptive on tablet/desktop) */}
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-[#737373] dark:text-[#9CA3AF] uppercase tracking-wider tabular-nums shrink-0">
            {isFiltered || hasActiveFilters ? (
              <>
                <span className="sm:hidden">[ {filteredCount}/{totalCount} ]</span>
                <span className="hidden sm:inline">[ {filteredCount} DE {totalCount} {totalCount === 1 ? 'ITEM' : 'ITENS'} ]</span>
              </>
            ) : (
              <>
                <span className="sm:hidden">[ {totalCount} ]</span>
                <span className="hidden sm:inline">[ {totalCount} {totalCount === 1 ? 'REFERÊNCIA' : 'REFERÊNCIAS'} ]</span>
              </>
            )}
          </span>
        </div>

        {/* Right: Sort Select Dropdown */}
        <div className="flex items-center min-w-0 shrink-0">
          <div className="flex items-center gap-1.5 h-7 px-2 sm:px-2.5 rounded-md bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] text-xs font-medium text-[#737373] dark:text-[#9CA3AF] hover:border-[#D4D4D0] dark:hover:border-[#3E434D] transition-colors cursor-pointer min-h-[34px] sm:min-h-auto">
            <ArrowDownUp size={12} className="text-[#A8A8A6] dark:text-[#6B7280] shrink-0" />
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-[#171717] dark:text-[#F3F4F6] text-xs font-medium outline-none cursor-pointer pr-0.5 sm:pr-1"
            >
              <option value="newest" className="dark:bg-[#191B20] dark:text-[#F3F4F6]">Mais recentes</option>
              <option value="oldest" className="dark:bg-[#191B20] dark:text-[#F3F4F6]">Mais antigas</option>
              <option value="alphabetical" className="dark:bg-[#191B20] dark:text-[#F3F4F6]">Título A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Faceted Filter Panel */}
      {isAdvancedFiltersOpen && (
        <div className="p-4 bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-sm flex flex-col gap-4 animate-in fade-in duration-100 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category 1: Projects Filter */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-bold text-[#A8A8A6] dark:text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={12} /> Projetos
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableProjects.length === 0 ? (
                  <span className="text-xs text-[#A8A8A6] dark:text-[#6B7280] italic">Nenhum projeto cadastrado</span>
                ) : (
                  availableProjects.map((p) => {
                    const isSelected = selectedProjectIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onToggleProject(p.id)}
                        className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-[#171717] dark:bg-[#4355DB] text-white border-[#171717] dark:border-[#4355DB] font-semibold'
                            : 'bg-[#F8F8F6] dark:bg-[#20232A] border-[#E7E7E5] dark:border-[#2D3139] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Category 2: Collections Filter */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-bold text-[#A8A8A6] dark:text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={12} /> Coleções
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableCollections.length === 0 ? (
                  <span className="text-xs text-[#A8A8A6] dark:text-[#6B7280] italic">Nenhuma coleção cadastrada</span>
                ) : (
                  availableCollections.map((c) => {
                    const isSelected = selectedCollectionIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onToggleCollection(c.id)}
                        className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-[#171717] dark:bg-[#4355DB] text-white border-[#171717] dark:border-[#4355DB] font-semibold'
                            : 'bg-[#F8F8F6] dark:bg-[#20232A] border-[#E7E7E5] dark:border-[#2D3139] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Category 3: Content Types Filter */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-bold text-[#A8A8A6] dark:text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                Tipo de Conteúdo
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(CONTENT_TYPE_LABELS) as ContentTypeFilter[]).map((type) => {
                  const isSelected = contentTypes.includes(type);
                  const { label, icon } = CONTENT_TYPE_LABELS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onToggleContentType(type)}
                      className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-[#4355DB] dark:bg-[#6375F1] text-white border-[#4355DB] dark:border-[#6375F1] font-semibold'
                          : 'bg-[#F8F8F6] dark:bg-[#20232A] border-[#E7E7E5] dark:border-[#2D3139] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
                      }`}
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips Bar (Visually Identifiable & Individually Removable) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-mono text-[10px] text-[#A8A8A6] dark:text-[#6B7280] uppercase tracking-wider mr-1">
            Filtros ativos:
          </span>

          {/* Search Query Chip */}
          {searchQuery && searchQuery.trim().length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#171717] dark:bg-[#4355DB] text-white text-[11px] font-sans">
              <span>Busca: "{searchQuery}"</span>
              {onClearSearchQuery && (
                <button
                  type="button"
                  onClick={onClearSearchQuery}
                  className="p-0.5 hover:opacity-80 cursor-pointer"
                  title="Limpar termo de busca"
                >
                  <X size={11} />
                </button>
              )}
            </span>
          )}

          {/* Tags Chips */}
          {selectedTags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4355DB]/10 dark:bg-[#4355DB]/20 text-[#4355DB] dark:text-[#818CF8] border border-[#4355DB]/20 dark:border-[#4355DB]/40 text-[11px] font-mono"
            >
              <Tag size={10} />
              <span>#{t}</span>
              <button
                type="button"
                onClick={() => onToggleTag(t)}
                className="p-0.5 hover:opacity-80 cursor-pointer"
                title={`Remover filtro #${t}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}

          {/* Projects Chips */}
          {selectedProjectIds.map((pId) => {
            const project = availableProjects.find((p) => p.id === pId);
            return (
              <span
                key={pId}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1F1EF] dark:bg-[#20232A] text-[#171717] dark:text-[#F3F4F6] border border-[#E7E7E5] dark:border-[#2D3139] text-[11px] font-sans font-medium"
              >
                <Briefcase size={10} className="text-[#737373] dark:text-[#9CA3AF]" />
                <span>Projeto: {project ? project.name : pId}</span>
                <button
                  type="button"
                  onClick={() => onToggleProject(pId)}
                  className="p-0.5 hover:text-[#EF4444] cursor-pointer"
                  title="Remover filtro de projeto"
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}

          {/* Collections Chips */}
          {selectedCollectionIds.map((cId) => {
            const col = availableCollections.find((c) => c.id === cId);
            return (
              <span
                key={cId}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1F1EF] dark:bg-[#20232A] text-[#171717] dark:text-[#F3F4F6] border border-[#E7E7E5] dark:border-[#2D3139] text-[11px] font-sans font-medium"
              >
                <Layers size={10} className="text-[#737373] dark:text-[#9CA3AF]" />
                <span>Coleção: {col ? col.name : cId}</span>
                <button
                  type="button"
                  onClick={() => onToggleCollection(cId)}
                  className="p-0.5 hover:text-[#EF4444] cursor-pointer"
                  title="Remover filtro de coleção"
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}

          {/* Content Types Chips */}
          {contentTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1F1EF] dark:bg-[#20232A] text-[#171717] dark:text-[#F3F4F6] border border-[#E7E7E5] dark:border-[#2D3139] text-[11px] font-sans"
            >
              {CONTENT_TYPE_LABELS[type].icon}
              <span>{CONTENT_TYPE_LABELS[type].label}</span>
              <button
                type="button"
                onClick={() => onToggleContentType(type)}
                className="p-0.5 hover:text-[#EF4444] cursor-pointer"
                title="Remover filtro de tipo"
              >
                <X size={11} />
              </button>
            </span>
          ))}

          {/* Clear All Filters Button */}
          <button
            type="button"
            onClick={onClearAllFilters}
            className="text-[11px] font-semibold text-[#EF4444] dark:text-[#F87171] hover:underline ml-1 cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
};
