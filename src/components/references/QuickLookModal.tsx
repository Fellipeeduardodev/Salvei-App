import React, { useEffect, useCallback } from 'react';
import { Reference, ColorPaletteItem } from '../../types/reference';
import { ExternalLink, X } from 'lucide-react';

interface QuickLookModalProps {
  reference: Reference | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called when user copies a hex swatch */
  onCopyHex?: (hex: string) => void;
}

/**
 * QuickLookModal
 * Apple-style fullscreen image preview overlay.
 * Closes on Escape, backdrop click, or Space.
 */
export const QuickLookModal: React.FC<QuickLookModalProps> = ({
  reference,
  isOpen,
  onClose,
  onCopyHex,
}) => {
  const [copiedHex, setCopiedHex] = React.useState<string | null>(null);

  // Handle keyboard: Escape and Space close the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCopyHex = useCallback(
    (hex: string) => {
      navigator.clipboard.writeText(hex).then(() => {
        setCopiedHex(hex);
        onCopyHex?.(hex);
        setTimeout(() => setCopiedHex(null), 1500);
      });
    },
    [onCopyHex]
  );

  if (!isOpen || !reference) return null;

  const hasImage = Boolean(
    reference.screenshotUrl && reference.screenshotStatus !== 'failed'
  );
  const palette: ColorPaletteItem[] = reference.palette ?? [];
  const domain = reference.domain || (reference.url ? new URL(reference.url).hostname.replace('www.', '') : null);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Visualização rápida: ${reference.title}`}
      className="fixed inset-0 z-[90] flex flex-col bg-[#0B0C0E] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between gap-4 px-5 py-3 border-b border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Domain badge */}
          {domain && (
            <span className="flex-shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-white/[0.07] text-[#9CA3AF] border border-white/[0.08]">
              {domain}
            </span>
          )}
          {/* Title */}
          <h2 className="font-sans font-semibold text-sm text-[#F3F4F6] truncate leading-snug">
            {reference.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* External link */}
          {reference.url && (
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[#9CA3AF] hover:text-white hover:bg-white/[0.08] transition-colors text-xs font-sans"
              title="Abrir link original"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Abrir</span>
            </a>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#6B7280] hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Fechar visualização rápida"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── MAIN IMAGE AREA ─────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden px-6 py-6 min-h-0"
        onClick={onClose}
      >
        {hasImage ? (
          <img
            src={reference.screenshotUrl}
            alt={reference.title}
            className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
            style={{ maxHeight: '70vh' }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-3 text-[#6B7280]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
              <ExternalLink size={28} strokeWidth={1.5} />
            </div>
            <p className="font-sans text-sm text-[#9CA3AF]">Sem imagem disponível</p>
            {reference.url && (
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs text-[#4355DB] hover:text-[#6375F1] underline underline-offset-2"
              >
                {reference.url}
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM BAR ──────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: palette swatches + tags */}
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          {/* Color palette swatches */}
          {palette.length > 0 && (
            <div className="flex items-center gap-1.5">
              {palette.slice(0, 6).map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  title={`Copiar ${color.hex}`}
                  onClick={() => handleCopyHex(color.hex)}
                  className="relative group w-5 h-5 rounded-full border border-white/[0.12] hover:scale-110 transition-transform flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#4355DB] focus:ring-offset-1 focus:ring-offset-[#0B0C0E]"
                  style={{ backgroundColor: color.hex }}
                >
                  {/* Copied indicator */}
                  {copiedHex === color.hex && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-white text-[#0B0C0E] font-mono text-[9px] font-bold whitespace-nowrap shadow-lg">
                      ✓ copiado
                    </span>
                  )}
                  {/* Hex tooltip on hover */}
                  {copiedHex !== color.hex && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#1F2028] text-[#9CA3AF] font-mono text-[9px] whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {color.hex}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Tags */}
          {reference.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 min-w-0">
              {reference.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm bg-white/[0.05] text-[#6B7280] border border-white/[0.07]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: keyboard hint */}
        <span className="font-mono text-[10px] text-[#4B5563] whitespace-nowrap">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px] text-[#6B7280]">
            Space
          </kbd>{' '}
          para fechar
        </span>
      </div>
    </div>
  );
};
