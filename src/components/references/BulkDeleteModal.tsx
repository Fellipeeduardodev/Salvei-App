import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  isLoading?: boolean;
}

export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  count,
  isLoading = false,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus confirm button when opened for immediate keyboard accessibility
    const timer = setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !isLoading) {
        // Safe Enter execution when modal is active
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onConfirm, isLoading]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F0F]/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-white border border-[#E7E7E5] rounded-sm p-6 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer"
          aria-label="Fechar diálogo de confirmação"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3
              id="bulk-delete-title"
              className="font-sans font-bold text-base text-[#171717] leading-tight"
            >
              Excluir {count} {count === 1 ? 'referência' : 'referências'}?
            </h3>
            <p className="font-sans text-xs text-[#737373] mt-1.5 leading-relaxed">
              Esta ação excluirá permanentemente do Supabase as referências selecionadas, suas associações e anexos. Esta ação não poderá ser desfeita.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E7E5]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar (Esc)
          </Button>
          <button
            ref={confirmButtonRef}
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded-sm bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 text-white font-sans text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>Confirmar exclusão (Enter)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
