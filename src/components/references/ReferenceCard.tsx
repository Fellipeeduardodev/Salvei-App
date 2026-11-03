import React, { useState, useRef, useEffect } from 'react';
import { Reference, ColorPaletteItem } from '../../types/reference';
import {
  extractPaletteFromImage,
  exportPaletteAsTailwind,
  exportPaletteAsCss,
  exportPaletteAsJson,
  exportPaletteAsFigmaTokens,
  downloadPaletteCardPng,
} from '../../lib/colorExtractor';
import {
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Plus,
  Star,
  Check,
  MoreHorizontal,
  Eye,
  Layers,
  Briefcase,
  Edit3,
  Trash2,
  Copy,
  Palette,
  FileCode,
  FileJson,
  Sparkles,
  Download,
} from 'lucide-react';

interface ReferenceCardProps {
  reference: Reference;
  isSelected?: boolean; // Card opened in SidePanel / active inspector
  isChecked?: boolean; // Card checked in multi-selection mode
  isSelectionModeActive?: boolean;
  onToggleSelect?: (referenceId: string, e?: React.MouseEvent) => void;
  onToggleFavorite?: (referenceId: string, nextFavorite: boolean) => void;
  onQuickEdit?: (reference: Reference) => void;
  onQuickDelete?: (reference: Reference) => void;
  onQuickAssociateProject?: (reference: Reference) => void;
  onQuickAssociateCollection?: (reference: Reference) => void;
  onClick?: () => void;
  onTagClick?: (tag: string) => void;
  onAttachImageClick?: (referenceId: string) => void;
  onUpdatePalette?: (referenceId: string, palette: ColorPaletteItem[]) => void;
}

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
  reference,
  isSelected = false,
  isChecked = false,
  isSelectionModeActive = false,
  onToggleSelect,
  onToggleFavorite,
  onQuickEdit,
  onQuickDelete,
  onQuickAssociateProject,
  onQuickAssociateCollection,
  onClick,
  onTagClick,
  onAttachImageClick,
  onUpdatePalette,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Quick palette export state
  const [isPaletteMenuOpen, setIsPaletteMenuOpen] = useState(false);
  const [paletteExportFeedback, setPaletteExportFeedback] = useState<string | null>(null);
  const paletteMenuRef = useRef<HTMLDivElement>(null);

  const hasImage = Boolean(reference.screenshotUrl && !imageError && reference.screenshotStatus !== 'failed');
  const hasUrl = Boolean(reference.url);
  const isFavorite = Boolean(reference.isFavorite);

  // Close context menu on outside click or Esc
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Close palette export menu on outside click or Esc
  useEffect(() => {
    if (!isPaletteMenuOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (paletteMenuRef.current && !paletteMenuRef.current.contains(e.target as Node)) {
        setIsPaletteMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPaletteMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaletteMenuOpen]);

  const handleExportCardPalette = (format: 'tailwind' | 'css' | 'json' | 'figma' | 'hex' | 'png', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!reference.palette || reference.palette.length === 0) return;

    if (format === 'tailwind') {
      const code = exportPaletteAsTailwind(reference.title, reference.palette);
      navigator.clipboard.writeText(code);
      setPaletteExportFeedback('Tailwind copiado!');
    } else if (format === 'css') {
      const code = exportPaletteAsCss(reference.title, reference.palette);
      navigator.clipboard.writeText(code);
      setPaletteExportFeedback('CSS copiado!');
    } else if (format === 'json') {
      const code = exportPaletteAsJson(reference.title, reference.palette);
      navigator.clipboard.writeText(code);
      setPaletteExportFeedback('Tokens JSON!');
    } else if (format === 'figma') {
      const code = exportPaletteAsFigmaTokens(reference.title, reference.palette);
      navigator.clipboard.writeText(code);
      setPaletteExportFeedback('Figma Tokens!');
    } else if (format === 'hex') {
      const code = reference.palette.map((p) => p.hex).join(', ');
      navigator.clipboard.writeText(code);
      setPaletteExportFeedback('HEXs copiados!');
    } else if (format === 'png') {
      downloadPaletteCardPng(reference.title, reference.palette);
      setPaletteExportFeedback('PNG baixado!');
    }

    setTimeout(() => {
      setPaletteExportFeedback(null);
      setIsPaletteMenuOpen(false);
    }, 1600);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const linkToCopy = reference.url || window.location.href;
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setIsMenuOpen(false);
    }, 1200);
  };

  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1600);
  };

  // Auto-extract palette if card has image and no palette yet
  useEffect(() => {
    if (
      hasImage &&
      reference.screenshotUrl &&
      (!reference.palette || reference.palette.length === 0) &&
      onUpdatePalette
    ) {
      let isMounted = true;
      extractPaletteFromImage(reference.screenshotUrl, 5).then((palette) => {
        if (isMounted && palette && palette.length > 0) {
          onUpdatePalette(reference.id, palette);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [hasImage, reference.screenshotUrl, reference.palette, reference.id, onUpdatePalette]);

  const renderStatusBadge = () => {
    if (!hasImage && reference.screenshotStatus === 'none') {
      return (
        <span
          className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F1F1EF] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] border border-[#E7E7E5] dark:border-[#2D3139]"
          title="Salvo apenas por URL. Nenhuma imagem anexada."
        >
          Apenas URL
        </span>
      );
    }

    if (reference.sourceType === 'image' && !hasUrl) {
      return (
        <span
          className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F1F1EF] dark:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] border border-[#E7E7E5] dark:border-[#2D3139]"
          title="Imagem importada diretamente"
        >
          Imagem
        </span>
      );
    }

    switch (reference.screenshotStatus) {
      case 'ready':
        return (
          <span className="flex items-center gap-1.5" title="Captura pronta">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="sr-only">Captura pronta</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1.5" title="Capturando imagem do site...">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8A8A6] animate-pulse" />
            <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider hidden sm:inline">
              Capturando
            </span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5" title="Falha na captura">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            <span className="text-[10px] font-mono text-[#EF4444] uppercase tracking-wider hidden sm:inline">
              Falha
            </span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If Shift key is pressed or in multi-select mode, toggle selection
    if (e.shiftKey && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(reference.id, e);
      return;
    }
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const displaySubtitle = reference.domain || reference.originalFileName || 'Referência visual';
  const metaCategory = (reference.notesMarkdown ? reference.notesMarkdown.split('\n')[0].replace(/^#+\s*/, '') : '') || (reference.tags && reference.tags.length > 0 ? reference.tags.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' • ') : 'Benchmark');

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Referência: ${reference.title}, origem: ${displaySubtitle}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`group relative flex flex-col w-full min-w-0 max-w-full box-border bg-white dark:bg-[#191B20] border rounded-sm overflow-hidden cursor-pointer select-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] focus-visible:ring-offset-2 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 ${
        isChecked
          ? 'border-[#4355DB] dark:border-[#6375F1] ring-2 ring-[#4355DB]/25 dark:ring-[#6375F1]/25 bg-[#F9FAFF] dark:bg-[#1C2030] shadow-xs'
          : isSelected
          ? 'border-[#171717] dark:border-[#F3F4F6] ring-2 ring-[#171717]/15 dark:ring-[#F3F4F6]/15 shadow-xs'
          : 'border-[#E7E7E5] dark:border-[#2D3139] hover:border-[#D4D4D0] dark:hover:border-[#3E434D] shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
      }`}
    >
      {/* Frame Visual: Imagem ou Estado Editorial Tipográfico para URL-only */}
      <div className="relative w-full aspect-[16/10] bg-[#F1F1EF] dark:bg-[#15171C] overflow-hidden border-b border-[#E7E7E5]/70 dark:border-[#2D3139]/70">
        {hasImage ? (
          <img
            src={reference.screenshotUrl}
            alt={reference.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          /* Estado Visual Elegante para Referência Apenas com URL (sem captura prévia) */
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-[#FAFAF8] dark:bg-[#15171C] relative transition-colors group-hover:bg-[#F5F5F2] dark:group-hover:bg-[#1A1D24]">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] bg-[radial-gradient(#171717_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

            <div className="w-10 h-10 rounded-md bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-center text-[#4355DB] dark:text-[#6375F1] shadow-2xs z-10 mb-2">
              <Globe size={18} strokeWidth={1.75} />
            </div>

            <div className="flex flex-col items-center gap-0.5 z-10 max-w-[85%]">
              <span className="font-mono text-[11px] font-bold text-[#171717] dark:text-[#F3F4F6] uppercase tracking-wider truncate w-full">
                {reference.domain || 'URL Sem Imagem'}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#A8A8A6] dark:text-[#6B7280]">
                [ SEM CAPTURA VISUAL ]
              </span>
            </div>

            {/* Quick affordance to attach image if none present */}
            {onAttachImageClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAttachImageClick(reference.id);
                }}
                className="mt-2.5 z-10 px-2 py-1 rounded bg-white dark:bg-[#20232A] hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] border border-[#E7E7E5] dark:border-[#2D3139] font-mono text-[10px] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Adicionar imagem a esta referência"
              >
                <Plus size={11} strokeWidth={2.5} />
                <span>Anexar imagem</span>
              </button>
            )}
          </div>
        )}

        {/* TOP-LEFT: Multi-selection Checkbox Handle */}
        {onToggleSelect && (
          <button
            type="button"
            role="checkbox"
            aria-checked={isChecked}
            aria-label={
              isChecked
                ? `Desmarcar referência: ${reference.title}`
                : `Selecionar referência: ${reference.title}`
            }
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(reference.id, e);
            }}
            className={`absolute top-2.5 left-2.5 z-20 w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
              isChecked
                ? 'bg-[#4355DB] dark:bg-[#6375F1] text-white shadow-xs opacity-100 scale-100'
                : isSelectionModeActive
                ? 'bg-white/90 dark:bg-[#191B20]/90 border border-[#D4D4D0] dark:border-[#3E434D] text-transparent hover:border-[#4355DB] hover:bg-white opacity-100'
                : 'bg-white/90 dark:bg-[#191B20]/90 border border-[#D4D4D0] dark:border-[#3E434D] text-transparent hover:border-[#4355DB] hover:bg-white max-sm:opacity-80 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            }`}
            title={isChecked ? 'Desmarcar seleção' : 'Selecionar (Shift+Clique)'}
          >
            <Check size={13} strokeWidth={3} className={isChecked ? 'opacity-100' : 'opacity-0'} />
          </button>
        )}

        {/* TOP-RIGHT: Quick Action Buttons (Favorite, External Link, More Menu) */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 flex items-center gap-1">
          {/* Favorite Toggle Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(reference.id, !isFavorite);
              }}
              className={`p-1.5 min-h-[32px] min-w-[32px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center rounded transition-all duration-150 cursor-pointer border shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
                isFavorite
                  ? 'bg-white dark:bg-[#20232A] text-[#F59E0B] border-[#F59E0B]/30 opacity-100'
                  : 'bg-white/95 dark:bg-[#191B20]/95 hover:bg-white dark:hover:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] border-[#E7E7E5] dark:border-[#2D3139] max-sm:opacity-90 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Favoritar referência'}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar referência'}
            >
              <Star
                size={13}
                strokeWidth={2}
                className={isFavorite ? 'fill-[#F59E0B] text-[#F59E0B]' : ''}
              />
            </button>
          )}

          {/* External Link */}
          {hasUrl && reference.url && (
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 min-h-[32px] min-w-[32px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center rounded bg-white/95 dark:bg-[#191B20]/95 hover:bg-white dark:hover:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] max-sm:opacity-90 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 shadow-2xs border border-[#E7E7E5] dark:border-[#2D3139]"
              title={`Visitar ${displaySubtitle} (abre em nova aba)`}
              aria-label={`Visitar ${displaySubtitle} externamente`}
            >
              <ExternalLink size={13} strokeWidth={2} />
            </a>
          )}

          {/* Quick Actions More Menu Trigger */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              className={`p-1.5 min-h-[32px] min-w-[32px] sm:min-h-[28px] sm:min-w-[28px] flex items-center justify-center rounded transition-all duration-150 cursor-pointer border shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] ${
                isMenuOpen
                  ? 'bg-white dark:bg-[#20232A] text-[#171717] dark:text-[#F3F4F6] border-[#171717] dark:border-[#F3F4F6] opacity-100'
                  : 'bg-white/95 dark:bg-[#191B20]/95 hover:bg-white dark:hover:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] border-[#E7E7E5] dark:border-[#2D3139] max-sm:opacity-90 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
              }`}
              title="Ações rápidas da referência"
              aria-label="Ações rápidas"
              aria-expanded={isMenuOpen}
            >
              <MoreHorizontal size={13} strokeWidth={2} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] rounded-md shadow-xl py-1 z-30 flex flex-col text-xs text-[#171717] dark:text-[#F3F4F6] animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Abrir detalhes */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onClick?.();
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] transition-colors cursor-pointer"
                >
                  <Eye size={13} className="text-[#737373] dark:text-[#9CA3AF]" />
                  <span>Abrir detalhes</span>
                </button>

                {/* Favoritar / Desfavoritar */}
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onToggleFavorite(reference.id, !isFavorite);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] transition-colors cursor-pointer"
                  >
                    <Star
                      size={13}
                      className={isFavorite ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#737373] dark:text-[#9CA3AF]'}
                    />
                    <span>{isFavorite ? 'Desfavoritar' : 'Favoritar'}</span>
                  </button>
                )}

                {/* Adicionar a Coleção */}
                {onQuickAssociateCollection && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onQuickAssociateCollection(reference);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] transition-colors cursor-pointer"
                  >
                    <Layers size={13} className="text-[#737373] dark:text-[#9CA3AF]" />
                    <span>Gerenciar coleções...</span>
                  </button>
                )}

                {/* Associar a Projeto */}
                {onQuickAssociateProject && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onQuickAssociateProject(reference);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] transition-colors cursor-pointer"
                  >
                    <Briefcase size={13} className="text-[#737373] dark:text-[#9CA3AF]" />
                    <span>Associar a projeto...</span>
                  </button>
                )}

                {/* Editar informações */}
                {onQuickEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onQuickEdit(reference);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} className="text-[#737373] dark:text-[#9CA3AF]" />
                    <span>Editar metadados</span>
                  </button>
                )}

                {/* Copiar Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#F1F1EF] dark:hover:bg-[#282C35] transition-colors cursor-pointer"
                >
                  <Copy size={13} className="text-[#737373] dark:text-[#9CA3AF]" />
                  <span>{copiedLink ? 'Link copiado!' : 'Copiar URL / link'}</span>
                </button>

                {/* Excluir (Destructive) */}
                {onQuickDelete && (
                  <div className="pt-1 mt-1 border-t border-[#E7E7E5] dark:border-[#2D3139]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(false);
                        onQuickDelete(reference);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#EF4444]/10 text-[#EF4444] transition-colors cursor-pointer font-medium"
                    >
                      <Trash2 size={13} />
                      <span>Excluir referência</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="p-4 sm:p-5 flex flex-col gap-2 w-full min-w-0 max-w-full box-border">
        {/* Title */}
        <div className="flex items-start justify-between gap-2 w-full min-w-0">
          <h3 className="font-sans font-bold text-[15px] sm:text-base leading-snug text-[#171717] dark:text-[#F3F4F6] group-hover:text-[#4355DB] dark:group-hover:text-[#6375F1] transition-colors truncate flex-1 min-w-0">
            {reference.title}
          </h3>
          <div className="flex-shrink-0 flex items-center gap-1.5 pt-0.5">
            {isFavorite && (
              <span title="Favorito">
                <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
              </span>
            )}
            {renderStatusBadge()}
          </div>
        </div>

        {/* Domain / Subtitle & Category benchmark */}
        <div className="flex items-center gap-1.5 min-w-0 text-xs">
          <span className="font-mono text-xs font-semibold text-[#4355DB] dark:text-[#6375F1] shrink-0">
            {displaySubtitle}
          </span>
          {metaCategory && (
            <>
              <span className="text-[#A8A8A6] dark:text-[#6B7280]">•</span>
              <span className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF] truncate">
                {metaCategory}
              </span>
            </>
          )}
        </div>

        {/* Color Palette Swatches & Quick Export */}
        {reference.palette && reference.palette.length > 0 && (
          <div
            className="flex items-center justify-between gap-1.5 pt-0.5 relative"
            onClick={(e) => e.stopPropagation()}
            aria-label="Paleta de cores extraída"
          >
            <div className="flex items-center gap-1 min-w-0">
              {reference.palette.slice(0, 5).map((color, idx) => (
                <button
                  key={`${color.hex}-${idx}`}
                  type="button"
                  onClick={(e) => handleCopyHex(color.hex, e)}
                  title={`${color.name || color.hex} (${color.hex}) — Clique para copiar HEX`}
                  className="p-1 -m-0.5 inline-flex items-center justify-center cursor-pointer group/swatch"
                  aria-label={`Copiar cor ${color.name || color.hex}`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full ring-1 ring-black/15 dark:ring-white/20 transition-transform group-hover/swatch:scale-125 shadow-2xs shrink-0 inline-block"
                    style={{ backgroundColor: color.hex }}
                  />
                </button>
              ))}
              {copiedHex && (
                <span className="text-[10px] font-mono text-[#4355DB] dark:text-[#6375F1] font-bold animate-in fade-in ml-1 truncate">
                  ✓ {copiedHex}
                </span>
              )}
              {paletteExportFeedback && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in ml-1 truncate">
                  ✓ {paletteExportFeedback}
                </span>
              )}
            </div>

            {/* Quick Export Trigger */}
            <div className="relative shrink-0" ref={paletteMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaletteMenuOpen(!isPaletteMenuOpen);
                }}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white transition-all cursor-pointer"
                title="Exportar paleta (CSS, Tailwind, Figma)"
              >
                <Palette size={12} />
              </button>

              {isPaletteMenuOpen && (
                <div
                  className="absolute right-0 bottom-full mb-1 z-30 w-44 rounded-md bg-white dark:bg-[#191B20] border border-[#E7E7E5] dark:border-[#2D3139] shadow-xl p-1 flex flex-col gap-0.5 animate-in fade-in duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleExportCardPalette('tailwind', e)}
                    className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                  >
                    <FileCode size={12} className="text-[#38BDF8]" />
                    <span>Copiar Tailwind</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExportCardPalette('css', e)}
                    className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                  >
                    <FileCode size={12} className="text-[#818CF8]" />
                    <span>Copiar CSS (:root)</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExportCardPalette('figma', e)}
                    className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={12} className="text-[#A855F7]" />
                    <span>Copiar Figma Tokens</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExportCardPalette('json', e)}
                    className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                  >
                    <FileJson size={12} className="text-[#F59E0B]" />
                    <span>Tokens JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExportCardPalette('hex', e)}
                    className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                  >
                    <Copy size={12} className="text-[#64748B]" />
                    <span>Copiar todos os HEX</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExportCardPalette('png', e)}
                    className="px-2 py-1.5 text-[11px] text-left hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] rounded text-[#171717] dark:text-[#F3F4F6] flex items-center gap-2 cursor-pointer"
                  >
                    <Download size={12} className="text-[#10B981]" />
                    <span>Baixar Cartela PNG</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags with Quick Filter Trigger */}
        {reference.tags && reference.tags.length > 0 && (
          <div className="pt-1 flex flex-wrap items-center gap-1.5 overflow-hidden w-full min-w-0">
            {reference.tags.slice(0, 3).map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="font-mono text-[11px] font-medium text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] bg-[#F1F1EF] dark:bg-[#20232A] hover:bg-[#EDEDEA] dark:hover:bg-[#282C35] px-2.5 py-1 min-h-[26px] inline-flex items-center rounded-md border border-[#E7E7E5]/70 dark:border-[#2D3139]/70 tracking-normal transition-colors cursor-pointer shrink-0"
                title={`Filtrar por #${tag}`}
              >
                #{tag}
              </button>
            ))}
            {reference.tags.length > 3 && (
              <span className="font-mono text-[11px] text-[#A8A8A6] dark:text-[#6B7280] shrink-0">
                +{reference.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
