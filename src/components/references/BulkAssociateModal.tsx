import React, { useState, useEffect, useRef } from 'react';
import { Layers, Briefcase, Plus, Minus, Loader2, X, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Project, Collection } from '../../types/reference';

interface BulkAssociateModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'collection' | 'project';
  availableItems: (Project | Collection)[];
  count: number;
  onConfirm: (targetId: string, action: 'add' | 'remove') => Promise<void>;
}

export const BulkAssociateModal: React.FC<BulkAssociateModalProps> = ({
  isOpen,
  onClose,
  type,
  availableItems,
  count,
  onConfirm,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [isLoading, setIsLoading] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (availableItems.length > 0) {
        setSelectedItemId(availableItems[0].id);
      } else {
        setSelectedItemId('');
      }
      setAction('add');
      setIsLoading(false);
      setTimeout(() => selectRef.current?.focus(), 50);
    }
  }, [isOpen, availableItems]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;
    setIsLoading(true);
    try {
      await onConfirm(selectedItemId, action);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const isCollection = type === 'collection';
  const typeLabel = isCollection ? 'Coleção' : 'Projeto';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-associate-title"
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
          aria-label="Fechar diálogo de associação"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2.5 text-[#4355DB] dark:text-[#6375F1] font-mono text-[11px] font-bold uppercase tracking-wider">
          {isCollection ? <Layers size={15} /> : <Briefcase size={15} />}
          <span>{typeLabel.toUpperCase()} EM LOTE</span>
        </div>

        <h3
          id="bulk-associate-title"
          className="font-sans font-bold text-base text-[#171717] dark:text-[#F3F4F6] -mt-1 leading-snug"
        >
          {action === 'add' ? 'Adicionar' : 'Remover'} {count}{' '}
          {count === 1 ? 'referência selecionada' : 'referências selecionadas'}
        </h3>

        {availableItems.length === 0 ? (
          <div className="p-4 bg-[#F8F8F6] dark:bg-[#20232A] rounded border border-[#E7E7E5] dark:border-[#2D3139] text-xs text-[#737373] dark:text-[#9CA3AF] text-center">
            Nenhum {typeLabel.toLowerCase()} cadastrado ainda no workspace. Crie um {typeLabel.toLowerCase()} antes de associar referências.
          </div>
        ) : (
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
                <span>Adicionar ao {typeLabel}</span>
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
                <span>Remover do {typeLabel}</span>
              </button>
            </div>

            {/* Target Select */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="target-select"
                className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#737373] dark:text-[#9CA3AF]"
              >
                Selecione o {typeLabel} de destino:
              </label>
              <select
                id="target-select"
                ref={selectRef}
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-[#E7E7E5] dark:border-[#2D3139] bg-white dark:bg-[#20232A] text-xs text-[#171717] dark:text-[#F3F4F6] outline-none focus:border-[#4355DB] focus:ring-1 focus:ring-[#4355DB]"
              >
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

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
                disabled={isLoading || !selectedItemId}
                iconLeft={isLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              >
                {isLoading ? 'Salvando...' : 'Aplicar alterações'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
