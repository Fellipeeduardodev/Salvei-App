import React, { useState } from 'react';
import { X, Bookmark, Copy, Check, ExternalLink, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface BookmarkletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookmarkletModal: React.FC<BookmarkletModalProps> = ({ isOpen, onClose }) => {
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  // Código javascript do bookmarklet que abre o Salvei com a página atual pré-carregada
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const bookmarkletCode = `javascript:(function(){var t=encodeURIComponent(document.title);var u=encodeURIComponent(window.location.href);var og=document.querySelector('meta[property="og:image"]');var img=og?encodeURIComponent(og.content):'';var target='${origin}/?quick_save=1&url='+u+'&title='+t+(img?'&image='+img:'');window.open(target,'salvei_clipper','width=860,height=880,toolbar=no,menubar=no,status=no,resizable=yes');})();`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] rounded-xl shadow-2xl p-6 flex flex-col gap-5 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7E7E5] dark:border-[#2D3139] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#4355DB]/10 dark:bg-[#4355DB]/20 text-[#4355DB] flex items-center justify-center">
              <Bookmark size={20} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-[#171717] dark:text-[#F3F4F6]">
                Web Clipper • Salvar em 1 Clique
              </h3>
              <p className="text-xs text-[#737373] dark:text-[#9CA3AF]">
                Capture referências de qualquer aba sem precisar instalar extensão pesada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#171717] dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] p-1 rounded-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Drag & Drop Button */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-[#F8F8F6] dark:bg-[#121316] border border-dashed border-[#D4D4D0] dark:border-[#2D3139] rounded-lg text-center gap-3">
          <span className="text-xs font-mono font-semibold text-[#737373] dark:text-[#9CA3AF] uppercase tracking-wider">
            1. Arraste este botão para sua barra de favoritos:
          </span>

          <a
            href={bookmarkletCode}
            onClick={(e) => {
              // Se o usuário clicar ao invés de arrastar, damos uma dica amigável
              e.preventDefault();
              alert('Arraste este botão para a sua barra de favoritos do navegador (Ctrl+Shift+B ou Cmd+Shift+B)!');
            }}
            draggable={true}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#171717] dark:bg-[#4355DB] text-white font-sans text-sm font-semibold shadow-md hover:scale-105 active:scale-95 transition-transform cursor-grab active:cursor-grabbing border border-transparent select-none"
            title="Arraste para a barra de favoritos do navegador"
          >
            <Sparkles size={16} className="text-[#F59E0B]" />
            <span>+ Salvar no Salvei</span>
          </a>

          <p className="text-[11px] text-[#A8A8A6] dark:text-[#6B7280]">
            (Dica: Pressione <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] font-mono">Ctrl + Shift + B</kbd> no Windows ou <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] font-mono">Cmd + Shift + B</kbd> no Mac para exibir a barra de favoritos)
          </p>
        </div>

        {/* Step 2: How it works */}
        <div className="flex flex-col gap-2.5 text-xs text-[#737373] dark:text-[#9CA3AF]">
          <span className="font-semibold text-[#171717] dark:text-[#F3F4F6] flex items-center gap-1.5">
            <HelpCircle size={14} className="text-[#4355DB]" /> Como funciona:
          </span>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Navegue em qualquer site (Behance, Dribbble, Pinterest, Twitter, etc.).</li>
            <li>Clique no botão <strong>+ Salvar no Salvei</strong> na barra de favoritos.</li>
            <li>O modal abre instantaneamente com o link, título, favicon e imagem da página prontos para salvar.</li>
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E7E7E5] dark:border-[#2D3139]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            iconLeft={hasCopied ? <Check size={14} className="text-[#22c55e]" /> : <Copy size={14} />}
          >
            {hasCopied ? 'Código Copiado!' : 'Copiar Código'}
          </Button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
};
