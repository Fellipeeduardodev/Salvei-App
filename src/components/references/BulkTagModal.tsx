import React, { useState, useEffect, useRef } from 'react';
import { Tag, Plus, Minus, Loader2, X, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { normalizeTag } from '../../lib/searchAndFilter';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  availableTags: string[];
  onConfirm: (tags: string[], action: 'add' | 'remove') => Promise<void>;
}

export const BulkTagModal: React.FC<BulkTagModalProps> = ({
  isOpen,
  onClose,
  count,
  availableTags,
  onConfirm,
}) => {
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTagInput('');
      setSelectedTags([]);
      setAction('add');
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
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

  if (!isOpen) return null;

  const handleAddPendingTag = (rawName: string) => {
    const normalized = normalizeTag(rawName);
    if (normalized && !selectedTags.includes(normalized)) {
      setSelectedTags((prev) => [...prev, normalized]);
    }
    setTagInput('');
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        handleAddPendingTag(tagInput.trim());
      }
    }
  };

  const handleRemovePendingTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalTags = [...selectedTags];
    if (tagInput.trim()) {
      const norm = normalizeTag(tagInput.trim());
      if (norm && !finalTags.includes(norm)) {
        finalTags.push(norm);
      }
    }

    if (finalTags.length === 0) return;

    setIsLoading(true);
    try {
      await onConfirm(finalTags, action);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-tag-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F0F]/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-sm p-6 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer"
          aria-label="Fechar diálogo de etiquetas"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 text-[#4355DB] dark:text-[#6375F1] font-mono text-[11px] font-bold uppercase tracking-wider">
          <Tag size={15} />
          <span>ETIQUETAS EM LOTE</span>
        </div>

        <h3
          id="bulk-tag-title"
          className="font-sans font-bold text-base text-[#171717] dark:text-[#F3F4F6] -mt-1 leading-snug"
        >
          {action === 'add' ? 'Adicionar etiquetas a' : 'Remover etiquetas de'} {count}{' '}
          {count === 1 ? 'referência' : 'referências'}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Action Toggle */}
          <div className="flex items-center gap-2 p-1 bg-[#F1F1EF] dark:bg-[#15171C] rounded-sm border border-[#E7E7E5] dark:border-[#2D3139]">
            <button
              type="button"
              onClick={() => setAction('add')}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                action === 'add'
                  ? 'bg-white dark:bg-[#20232A] text-[#171717] dark:text-[#F3F4F6] shadow-2xs font-semibold'
                  : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
              }`}
            >
              <Plus size={13} />
              <span>Adicionar etiquetas</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('remove')}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                action === 'remove'
                  ? 'bg-white dark:bg-[#20232A] text-[#171717] dark:text-[#F3F4F6] shadow-2xs font-semibold'
                  : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
              }`}
            >
              <Minus size={13} />
              <span>Remover etiquetas</span>
            </button>
          </div>

          {/* Tags Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tag-input"
              className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#737373] dark:text-[#9CA3AF]"
            >
              {action === 'add'
                ? 'Digite a etiqueta e pressione Enter:'
                : 'Selecione ou digite as etiquetas a remover:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="tag-input"
                ref={inputRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder="Ex: tipografia, dark-mode, landing..."
                className="flex-1 h-9 px-3 rounded-md border border-[#E7E7E5] dark:border-[#2D3139] bg-white dark:bg-[#20232A] text-xs text-[#171717] dark:text-[#F3F4F6] outline-none focus:border-[#4355DB] focus:ring-1 focus:ring-[#4355DB]"
              />
              <button
                type="button"
                onClick={() => {
                  if (tagInput.trim()) handleAddPendingTag(tagInput.trim());
                }}
                disabled={!tagInput.trim()}
                className="h-9 px-3 rounded-md bg-[#F1F1EF] dark:bg-[#20232A] hover:bg-[#EDEDEA] dark:hover:bg-[#2A2E37] disabled:opacity-40 text-xs font-mono font-semibold text-[#171717] dark:text-[#F3F4F6] border border-[#E7E7E5] dark:border-[#2D3139] transition-colors cursor-pointer"
              >
                + Inserir
              </button>
            </div>
          </div>

          {/* Selected tags badges */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#F8F8F6] dark:bg-[#15171C] rounded border border-[#E7E7E5] dark:border-[#2D3139]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#A8A8A6] dark:text-[#6B7280] w-full">
                {action === 'add' ? 'Etiquetas a adicionar:' : 'Etiquetas a remover:'}
              </span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs text-[#171717] dark:text-[#F3F4F6] bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] px-2 py-0.5 rounded inline-flex items-center gap-1 shadow-2xs"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemovePendingTag(tag)}
                    className="hover:text-[#EF4444] cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggested tags */}
          {availableTags.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#A8A8A6] dark:text-[#6B7280]">
                Etiquetas existentes no workspace:
              </span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {availableTags.map((tag) => {
                  const isAlreadySelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isAlreadySelected) {
                          handleRemovePendingTag(tag);
                        } else {
                          handleAddPendingTag(tag);
                        }
                      }}
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        isAlreadySelected
                          ? 'bg-[#4355DB] text-white border-[#4355DB]'
                          : 'bg-[#F8F8F6] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] border-[#E7E7E5] dark:border-[#2D3139] hover:text-[#171717] dark:hover:text-[#F3F4F6]'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E7E5] dark:border-[#2D3139]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar (Esc)
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || (selectedTags.length === 0 && !tagInput.trim())}
              iconLeft={isLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            >
              {isLoading ? 'Salvando...' : 'Aplicar alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
