import React, { useState } from 'react';
import { Collection, Reference } from '../../types/reference';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Eye,
  Sparkles,
  Layers,
  Palette,
  FileCode,
  Globe,
  FileJson,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  generateCollectionShareUrl,
  downloadStandaloneMoodboard,
} from '../../lib/collectionSharing';
import {
  exportPaletteAsFigmaTokens,
  exportPaletteAsTailwind,
  exportPaletteAsCss,
} from '../../lib/colorExtractor';

interface ShareCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  references: Reference[];
  onOpenPublicView?: () => void;
}

export const ShareCollectionModal: React.FC<ShareCollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
  references,
  onOpenPublicView,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPaletteFormat, setCopiedPaletteFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const collectionReferences = references.filter((r) =>
    r.collectionIds?.includes(collection.id)
  );

  const shareUrl = generateCollectionShareUrl(collection, references);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleDownloadHtml = () => {
    downloadStandaloneMoodboard(collection, references);
  };

  const handleExportAllPalettes = (format: 'figma' | 'tailwind' | 'css') => {
    // Gather all palettes from this collection
    const combinedColors = collectionReferences.flatMap((r) => r.palette || []);
    if (combinedColors.length === 0) return;

    let code = '';
    if (format === 'figma') {
      code = exportPaletteAsFigmaTokens(collection.name, combinedColors);
    } else if (format === 'tailwind') {
      code = exportPaletteAsTailwind(collection.name, combinedColors);
    } else if (format === 'css') {
      code = exportPaletteAsCss(collection.name, combinedColors);
    }

    navigator.clipboard.writeText(code);
    setCopiedPaletteFormat(format);
    setTimeout(() => setCopiedPaletteFormat(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-collection-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#18191E] border border-[#E7E7E5] dark:border-[#262830] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#171717] dark:text-[#F3F4F6] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E7E5] dark:border-[#262830]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4355DB]/10 text-[#4355DB] dark:text-[#6375F1] flex items-center justify-center">
              <Share2 size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h2 id="share-collection-title" className="font-sans font-bold text-base leading-tight">
                Compartilhar Coleção
              </h2>
              <p className="font-mono text-[11px] text-[#737373] dark:text-[#9CA3AF]">
                {collectionReferences.length} {collectionReferences.length === 1 ? 'referência' : 'referências'} • Moodboard público
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#202229] transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {/* Target Collection Info Card */}
          <div className="p-3.5 rounded-lg bg-[#F9F9FB] dark:bg-[#131418] border border-[#E7E7E5] dark:border-[#262830] flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-white dark:bg-[#1D1F26] border border-[#E7E7E5] dark:border-[#262830] flex items-center justify-center text-[#4355DB] dark:text-[#6375F1] shrink-0">
              <Layers size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-sans font-semibold text-sm truncate text-[#171717] dark:text-white">
                {collection.name}
              </h4>
              {collection.description ? (
                <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF] truncate mt-0.5">
                  {collection.description}
                </p>
              ) : (
                <p className="font-mono text-[11px] text-[#A8A8A6] dark:text-[#6B7280]">
                  Sem descrição definida
                </p>
              )}
            </div>
          </div>

          {/* Share Link Row */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold text-[#171717] dark:text-[#E2E8F0] flex items-center gap-1.5">
              <Globe size={13} className="text-[#4355DB] dark:text-[#6375F1]" />
              <span>Link Público de Visualização</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 relative">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-[#F4F4F5] dark:bg-[#121316] border border-[#E7E7E5] dark:border-[#262830] rounded-md px-3 py-2 text-xs font-mono text-[#52525B] dark:text-[#A1A1AA] select-all focus:outline-hidden"
                />
              </div>
              <Button
                variant={copiedLink ? 'primary' : 'secondary'}
                size="sm"
                onClick={handleCopyLink}
                iconLeft={copiedLink ? <Check size={14} /> : <Copy size={14} />}
                className="shrink-0 cursor-pointer"
              >
                {copiedLink ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <p className="font-mono text-[10px] text-[#737373] dark:text-[#9CA3AF] leading-tight mt-0.5">
              Qualquer pessoa com este link pode visualizar o acervo em modo editorial ou canvas. Nenhuma alteração é permitida.
            </p>
          </div>

          {/* Action Cards */}
          <div className="flex flex-col gap-2.5 pt-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#737373] dark:text-[#8E95A3]">
              Opções de Entrega & Apresentação
            </span>

            {/* Preview Action */}
            <div className="p-3 rounded-lg border border-[#E7E7E5] dark:border-[#262830] hover:border-[#4355DB] dark:hover:border-[#6375F1] bg-white dark:bg-[#14161B] transition-colors flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#F4F4F5] dark:bg-[#1E2028] text-[#171717] dark:text-[#E2E8F0] group-hover:text-[#4355DB] dark:group-hover:text-[#6375F1] transition-colors">
                  <Eye size={16} />
                </div>
                <div>
                  <div className="font-sans font-semibold text-xs text-[#171717] dark:text-white">
                    Abrir Moodboard Interativo
                  </div>
                  <div className="font-sans text-[11px] text-[#737373] dark:text-[#9CA3AF]">
                    Visualizar na mesma interface que o cliente ou equipe verá
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (onOpenPublicView) {
                      onOpenPublicView();
                      onClose();
                    } else {
                      window.open(shareUrl, '_blank');
                    }
                  }}
                  iconRight={<ExternalLink size={12} />}
                  className="cursor-pointer text-xs"
                >
                  Abrir
                </Button>
              </div>
            </div>

            {/* Offline HTML Download Action */}
            <div className="p-3 rounded-lg border border-[#E7E7E5] dark:border-[#262830] hover:border-[#4355DB] dark:hover:border-[#6375F1] bg-white dark:bg-[#14161B] transition-colors flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#F4F4F5] dark:bg-[#1E2028] text-[#171717] dark:text-[#E2E8F0] group-hover:text-[#4355DB] dark:group-hover:text-[#6375F1] transition-colors">
                  <Download size={16} />
                </div>
                <div>
                  <div className="font-sans font-semibold text-xs text-[#171717] dark:text-white">
                    Baixar Moodboard HTML Autônomo
                  </div>
                  <div className="font-sans text-[11px] text-[#737373] dark:text-[#9CA3AF]">
                    Arquivo único .html que abre em qualquer navegador offline
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadHtml}
                iconLeft={<Download size={12} />}
                className="cursor-pointer text-xs shrink-0"
              >
                Baixar .html
              </Button>
            </div>

            {/* Palettes Export Quick Row */}
            <div className="p-3 rounded-lg border border-[#E7E7E5] dark:border-[#262830] bg-[#FBFBFC] dark:bg-[#131418] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-[#4355DB] dark:text-[#6375F1]" />
                  <span className="font-sans font-semibold text-xs text-[#171717] dark:text-white">
                    Exportar Paletas da Coleção
                  </span>
                </div>
                {copiedPaletteFormat && (
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {copiedPaletteFormat.toUpperCase()} copiado!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleExportAllPalettes('figma')}
                  className="px-2.5 py-1 rounded bg-white dark:bg-[#1F2128] border border-[#E7E7E5] dark:border-[#2C2F38] text-[11px] font-mono hover:border-[#4355DB] dark:hover:border-[#6375F1] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FileJson size={11} />
                  <span>Tokens Studio / Figma</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAllPalettes('tailwind')}
                  className="px-2.5 py-1 rounded bg-white dark:bg-[#1F2128] border border-[#E7E7E5] dark:border-[#2C2F38] text-[11px] font-mono hover:border-[#4355DB] dark:hover:border-[#6375F1] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FileCode size={11} />
                  <span>Tailwind</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAllPalettes('css')}
                  className="px-2.5 py-1 rounded bg-white dark:bg-[#1F2128] border border-[#E7E7E5] dark:border-[#2C2F38] text-[11px] font-mono hover:border-[#4355DB] dark:hover:border-[#6375F1] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FileCode size={11} />
                  <span>CSS (:root)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F9F9FB] dark:bg-[#131418] border-t border-[#E7E7E5] dark:border-[#262830] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#737373] dark:text-[#9CA3AF]">
            <Sparkles size={12} className="text-[#4355DB] dark:text-[#6375F1]" />
            <span>Salvei Curadoria</span>
          </div>

          <Button variant="secondary" size="sm" onClick={onClose} className="cursor-pointer">
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
};
