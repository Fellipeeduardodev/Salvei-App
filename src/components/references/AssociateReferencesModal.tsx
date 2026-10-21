import React, { useState, useMemo } from 'react';
import { Reference } from '../../types/reference';
import { X, Search, Check, Layers, Briefcase, Globe, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { matchesSearchQuery } from '../../lib/searchAndFilter';

interface AssociateReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'project' | 'collection';
  entityId: string;
  entityName: string;
  allReferences: Reference[];
  onSaveAssociations: (referenceIds: string[]) => void;
}

export const AssociateReferencesModal: React.FC<AssociateReferencesModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  allReferences,
  onSaveAssociations,
}) => {
  // Current associated IDs
  const initialSelected = useMemo(() => {
    return allReferences
      .filter((r) =>
        entityType === 'project'
          ? r.projectIds?.includes(entityId)
          : r.collectionIds?.includes(entityId)
      )
      .map((r) => r.id);
  }, [allReferences, entityId, entityType]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset when opened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelected);
      setSearchTerm('');
    }
  }, [isOpen, initialSelected]);

  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter references by search
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return allReferences;
    return allReferences.filter((ref) => matchesSearchQuery(ref, searchTerm));
  }, [allReferences, searchTerm]);

  if (!isOpen) return null;

  const handleToggle = (refId: string) => {
    setSelectedIds((prev) =>
      prev.includes(refId) ? prev.filter((id) => id !== refId) : [...prev, refId]
    );
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredList.map((r) => r.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleDeselectAllFiltered = () => {
    const idsToRemove = new Set(filteredList.map((r) => r.id));
    setSelectedIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  const handleSave = () => {
    onSaveAssociations(selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F0F0F]/55 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-assoc-title"
        className="relative w-full max-w-[620px] max-h-[85vh] bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-sm shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70 flex-shrink-0">
          <div>
            <h2 id="modal-assoc-title" className="font-sans font-bold text-base text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2">
              {entityType === 'project' ? <Briefcase size={16} /> : <Layers size={16} />}
              <span>Gerenciar referências associadas</span>
            </h2>
            <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF] mt-0.5">
              Selecione as referências da sua biblioteca vinculadas a <strong>{entityName}</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={17} />
          </button>
        </div>

        {/* Search & Bulk Select Toolbar */}
        <div className="p-4 bg-[#F8F8F6] dark:bg-[#15171C] border-b border-[#E7E7E5] dark:border-[#2D3139] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="relative w-full sm:w-72 flex items-center">
            <Search size={14} className="absolute left-2.5 text-[#A8A8A6] dark:text-[#6B7280] pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por título, domínio ou tag..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] rounded focus:border-[#4355DB] outline-none text-[#171717] dark:text-[#F3F4F6]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="text-[#4355DB] dark:text-[#6375F1] hover:underline cursor-pointer font-medium"
            >
              Marcar todos visíveis
            </button>
            <span className="text-[#D4D4D0] dark:text-[#3E434D]">|</span>
            <button
              type="button"
              onClick={handleDeselectAllFiltered}
              className="text-[#737373] dark:text-[#9CA3AF] hover:text-[#EF4444] cursor-pointer"
            >
              Desmarcar
            </button>
          </div>
        </div>

        {/* References Selection List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 scrollbar-thin">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#737373] dark:text-[#9CA3AF]">
              Nenhuma referência encontrada para o termo informado.
            </div>
          ) : (
            filteredList.map((ref) => {
              const isChecked = selectedIds.includes(ref.id);
              return (
                <div
                  key={ref.id}
                  onClick={() => handleToggle(ref.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-sm border cursor-pointer select-none transition-colors ${
                    isChecked
                      ? 'bg-[#4355DB]/10 dark:bg-[#4355DB]/20 border-[#4355DB]/40 ring-1 ring-[#4355DB]/20'
                      : 'bg-white dark:bg-[#191B20] border-[#E7E7E5] dark:border-[#2D3139] hover:bg-[#F8F8F6] dark:hover:bg-[#20232A]'
                  }`}
                >
                  {/* Checkbox indicator */}
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                      isChecked
                        ? 'bg-[#4355DB] border-[#4355DB] text-white'
                        : 'border-[#D4D4D0] dark:border-[#4B5563] bg-white dark:bg-[#20232A]'
                    }`}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>

                  {/* Thumbnail / Icon */}
                  <div className="w-10 h-7 rounded bg-[#F1F1EF] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {ref.screenshotUrl && ref.screenshotStatus === 'ready' ? (
                      <img
                        src={ref.screenshotUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : ref.url ? (
                      <Globe size={13} className="text-[#A8A8A6] dark:text-[#6B7280]" />
                    ) : (
                      <ImageIcon size={13} className="text-[#A8A8A6] dark:text-[#6B7280]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-xs text-[#171717] dark:text-[#F3F4F6] block truncate">
                      {ref.title}
                    </span>
                    <span className="font-mono text-[10px] text-[#737373] dark:text-[#9CA3AF] block truncate">
                      {ref.domain || ref.originalFileName || 'Referência de imagem'}
                    </span>
                  </div>

                  {/* Tags */}
                  {ref.tags && ref.tags.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                      {ref.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#F1F1EF] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E7E7E5] dark:border-[#2D3139] bg-[#F8F8F6] dark:bg-[#15171C] flex items-center justify-between gap-3 flex-shrink-0">
          <span className="font-mono text-xs text-[#737373] dark:text-[#9CA3AF]">
            {selectedIds.length} {selectedIds.length === 1 ? 'referência selecionada' : 'referências selecionadas'}
          </span>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Salvar associações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
