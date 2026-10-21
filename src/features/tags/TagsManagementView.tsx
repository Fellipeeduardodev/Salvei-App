import React, { useState, useMemo } from 'react';
import { Reference } from '../../types/reference';
import { Tag, Plus, Edit3, Trash2, Search, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ReferenceCard } from '../../components/references/ReferenceCard';
import { normalizeTag } from '../../lib/searchAndFilter';

interface TagsManagementViewProps {
  allReferences: Reference[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onCreateTag: (newTag: string) => void;
  onRenameTag: (oldTag: string, newTag: string) => void;
  onDeleteTag: (tagToDelete: string) => void;
  onSelectReference: (ref: Reference) => void;
  selectedReferenceId?: string | null;
}

export const TagsManagementView: React.FC<TagsManagementViewProps> = ({
  allReferences,
  activeTag,
  onSelectTag,
  onCreateTag,
  onRenameTag,
  onDeleteTag,
  onSelectReference,
  selectedReferenceId,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Rename modal state
  const [renamingTag, setRenamingTag] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Delete modal state
  const [deletingTag, setDeletingTag] = useState<string | null>(null);

  // Compute tag counts across all references
  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    allReferences.forEach((ref) => {
      ref.tags?.forEach((t) => {
        const norm = normalizeTag(t);
        if (norm) {
          map.set(norm, (map.get(norm) || 0) + 1);
        }
      });
    });
    return map;
  }, [allReferences]);

  // Sorted unique tags
  const allUniqueTags = useMemo(() => {
    return Array.from(tagCounts.keys()).sort();
  }, [tagCounts]);

  // Filtered tags for search
  const visibleTags = useMemo(() => {
    if (!tagSearch.trim()) return allUniqueTags;
    const normSearch = normalizeTag(tagSearch);
    return allUniqueTags.filter((t) => t.includes(normSearch));
  }, [allUniqueTags, tagSearch]);

  // References matching the currently selected active tag
  const matchingReferences = useMemo(() => {
    if (!activeTag) return [];
    const normActive = normalizeTag(activeTag);
    return allReferences.filter((r) =>
      r.tags?.map(normalizeTag).includes(normActive)
    );
  }, [allReferences, activeTag]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeTag(newTagInput);
    if (!clean) return;
    onCreateTag(clean);
    setNewTagInput('');
    onSelectTag(clean);
  };

  const handleStartRename = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingTag(tag);
    setRenameInput(tag);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingTag) return;
    const cleanNew = normalizeTag(renameInput);
    if (cleanNew && cleanNew !== renamingTag) {
      onRenameTag(renamingTag, cleanNew);
      if (activeTag === renamingTag) {
        onSelectTag(cleanNew);
      }
    }
    setRenamingTag(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-[#171717] dark:text-[#F3F4F6] tracking-tight">
            Etiquetas
          </h1>
          <p className="font-sans text-xs md:text-sm text-[#737373] dark:text-[#9CA3AF] mt-0.5">
            Índice taxonômico transversal. Gerencie, renomeie e filtre referências por marcadores livres.
          </p>
        </div>

        {/* Quick Tag Creation Form */}
        <form onSubmit={handleCreateSubmit} className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#A8A8A6] dark:text-[#6B7280]">#</span>
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="nova-etiqueta"
              className="h-8 pl-6 pr-3 rounded bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] text-xs font-mono focus:border-[#4355DB] outline-none text-[#171717] dark:text-[#F3F4F6] w-40"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!newTagInput.trim()}
            iconLeft={<Plus size={13} strokeWidth={2.5} />}
          >
            Adicionar
          </Button>
        </form>
      </div>

      {/* Tags Directory Box */}
      <div className="p-5 bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-sm flex flex-col gap-4">
        {/* Search filter for tags */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
          <div className="flex items-center gap-2 text-xs font-mono text-[#737373] dark:text-[#9CA3AF]">
            <Tag size={13} className="text-[#4355DB] dark:text-[#6375F1]" />
            <span>
              TOTAL: <strong className="text-[#171717] dark:text-[#F3F4F6]">{allUniqueTags.length}</strong> ETIQUETAS ATIVAS
            </span>
          </div>

          <div className="relative w-48 sm:w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A8A8A6] dark:text-[#6B7280]" />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Filtrar etiquetas..."
              className="w-full h-7 pl-7 pr-3 text-xs bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] rounded text-[#171717] dark:text-[#F3F4F6] focus:bg-white dark:focus:bg-[#15171C] focus:border-[#4355DB] outline-none"
            />
          </div>
        </div>

        {/* Tags Chips Cloud */}
        {visibleTags.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#737373]">
            Nenhuma etiqueta encontrada para "{tagSearch}".
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {visibleTags.map((tag) => {
              const count = tagCounts.get(tag) || 0;
              const isSelected = activeTag === tag;

              return (
                <div
                  key={tag}
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`group inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-mono transition-colors border select-none cursor-pointer ${
                    isSelected
                      ? 'bg-[#4355DB] text-white border-[#4355DB] font-semibold shadow-xs'
                      : 'bg-[#F8F8F6] hover:bg-[#EDEDEA] border-[#E7E7E5] text-[#171717]'
                  }`}
                  title={`Clique para ver referências com #${tag}`}
                >
                  <span>#{tag}</span>
                  <span
                    className={`text-[10px] tabular-nums ${
                      isSelected ? 'text-white/80' : 'text-[#737373]'
                    }`}
                  >
                    ({count})
                  </span>

                  {/* Rename and Delete Actions */}
                  <div
                    className="flex items-center gap-0.5 ml-1 pl-1 border-l border-black/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(tag, e)}
                      className={`p-0.5 rounded hover:bg-black/15 transition-colors cursor-pointer ${
                        isSelected ? 'text-white' : 'text-[#A8A8A6] hover:text-[#171717]'
                      }`}
                      title={`Renomear #${tag}`}
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingTag(tag);
                      }}
                      className={`p-0.5 rounded hover:bg-[#EF4444] hover:text-white transition-colors cursor-pointer ${
                        isSelected ? 'text-white' : 'text-[#A8A8A6] hover:text-[#EF4444]'
                      }`}
                      title={`Excluir #${tag}`}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filtered References Results Section */}
      {activeTag && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-100">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E5]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#4355DB] uppercase tracking-wider">
                FILTRANDO POR:
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#4355DB] text-white text-xs font-mono font-bold">
                #{activeTag}
              </span>
              <span className="text-xs text-[#737373] font-mono">
                ({matchingReferences.length} {matchingReferences.length === 1 ? 'referência' : 'referências'})
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="text-xs text-[#737373] hover:text-[#EF4444] flex items-center gap-1 cursor-pointer font-medium"
            >
              <X size={13} />
              <span>Limpar filtro de etiqueta</span>
            </button>
          </div>

          {matchingReferences.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#737373] bg-white border border-[#E7E7E5] rounded-sm">
              Nenhuma referência associada a esta etiqueta no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
              {matchingReferences.map((ref) => (
                <ReferenceCard
                  key={ref.id}
                  reference={ref}
                  isSelected={selectedReferenceId === ref.id}
                  onClick={() => onSelectReference(ref)}
                  onTagClick={onSelectTag}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rename Tag Dialog */}
      {renamingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setRenamingTag(null)}
            className="fixed inset-0 bg-[#0F0F0F]/50 backdrop-blur-xs"
          />
          <form
            onSubmit={handleSaveRename}
            className="relative w-full max-w-sm bg-white border border-[#E7E7E5] rounded-sm p-6 shadow-2xl z-10 flex flex-col gap-4 animate-in fade-in zoom-in-95"
          >
            <div>
              <h3 className="font-sans font-bold text-base text-[#171717]">
                Renomear etiqueta #{renamingTag}
              </h3>
              <p className="font-sans text-xs text-[#737373] mt-1">
                A alteração atualizará automaticamente todas as referências vinculadas a esta etiqueta.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#171717]">Novo nome</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#A8A8A6]">#</span>
                <input
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  autoFocus
                  required
                  className="w-full pl-6 pr-3 py-2 text-xs font-mono rounded bg-[#F8F8F6] border border-[#E7E7E5] focus:bg-white focus:border-[#4355DB] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRenamingTag(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Salvar novo nome
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Tag Confirmation Dialog */}
      {deletingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeletingTag(null)}
            className="fixed inset-0 bg-[#0F0F0F]/50 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-sm bg-white border border-[#E7E7E5] rounded-sm p-6 shadow-2xl z-10 flex flex-col gap-3 animate-in fade-in zoom-in-95">
            <h3 className="font-sans font-bold text-base text-[#171717]">
              Excluir etiqueta #{deletingTag}?
            </h3>
            <p className="font-sans text-xs text-[#737373] leading-relaxed">
              A etiqueta será removida das referências associadas. <strong>Nenhuma referência da sua biblioteca será excluída.</strong>
            </p>
            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingTag(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onDeleteTag(deletingTag);
                  setDeletingTag(null);
                  if (activeTag === deletingTag) onSelectTag(null);
                }}
                className="bg-[#EF4444] hover:bg-[#DC2626] border-[#EF4444]"
              >
                Confirmar exclusão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
