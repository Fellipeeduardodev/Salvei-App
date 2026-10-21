import React, { useEffect } from 'react';
import { Keyboard, X, Command } from 'lucide-react';
import { Button } from './Button';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  context: string;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
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

  const isMac =
    typeof window !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const cmdKey = isMac ? 'Cmd' : 'Ctrl';

  const shortcuts: ShortcutItem[] = [
    {
      keys: ['/'],
      description: 'Focar campo de busca global',
      context: 'Navegação geral',
    },
    {
      keys: [cmdKey, 'K'],
      description: 'Abrir menu de comandos e pesquisa rápida',
      context: 'Global',
    },
    {
      keys: ['Esc'],
      description: 'Fechar modais, fechar painéis ou limpar seleção',
      context: 'Global',
    },
    {
      keys: [cmdKey, 'A'],
      description: 'Selecionar todas as referências visíveis no grid',
      context: 'Seleção em lote',
    },
    {
      keys: ['Delete'],
      description: 'Excluir referências selecionadas (com confirmação)',
      context: 'Seleção em lote',
    },
    {
      keys: ['N'],
      description: 'Adicionar nova referência',
      context: 'Navegação geral',
    },
    {
      keys: ['Enter'],
      description: 'Confirmar ação primária ou abrir referência em foco',
      context: 'Diálogos e cards',
    },
    {
      keys: ['?'],
      description: 'Exibir este guia de atalhos de teclado',
      context: 'Ajuda',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F0F]/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-sm p-6 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer"
          aria-label="Fechar atalhos de teclado"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 text-[#4355DB] dark:text-[#6375F1] font-mono text-[11px] font-bold uppercase tracking-wider">
          <Keyboard size={15} />
          <span>PRODUTIVIDADE & ATALHOS</span>
        </div>

        <h3
          id="shortcuts-modal-title"
          className="font-sans font-bold text-lg text-[#171717] dark:text-[#F3F4F6] -mt-1 leading-snug"
        >
          Atalhos de Teclado do Salvei
        </h3>

        <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF] leading-relaxed">
          Navegue e organize sua biblioteca visual com menos cliques e velocidade de ateliê digital.
        </p>

        <div className="border border-[#E7E7E5] dark:border-[#2D3139] rounded-sm divide-y divide-[#E7E7E5] dark:divide-[#2D3139] overflow-hidden max-h-80 overflow-y-auto">
          {shortcuts.map((s, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-3 py-2.5 text-xs hover:bg-[#F8F8F6] dark:hover:bg-[#20232A] transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-sans font-medium text-[#171717] dark:text-[#F3F4F6]">{s.description}</span>
                <span className="font-mono text-[10px] text-[#A8A8A6] dark:text-[#6B7280]">{s.context}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                {s.keys.map((k, i) => (
                  <kbd
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#F1F1EF] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] font-mono text-[11px] font-semibold text-[#171717] dark:text-[#F3F4F6] shadow-2xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Entendido (Esc)
          </Button>
        </div>
      </div>
    </div>
  );
};
