import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ExternalLink,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
import { Reference } from '../../types/reference';

interface PresentationModeProps {
  references: Reference[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  references,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Sincroniza index inicial
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, references.length - 1)));
      setIsPlaying(false);
    }
  }, [isOpen, initialIndex, references.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % references.length);
  }, [references.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + references.length) % references.length);
  }, [references.length]);

  // Teclado: setas, espaço e ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Slideshow automático
  useEffect(() => {
    if (!isPlaying || !isOpen || references.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPlaying, isOpen, handleNext, references.length]);

  const handleCopyColor = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  if (!isOpen || references.length === 0) return null;

  const currentRef = references[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0C0E] text-white flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between px-6 py-4 z-20 bg-gradient-to-b from-[#0B0C0E]/90 to-transparent">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#9CA3AF] tracking-wider uppercase">
            Modo Apresentação
          </span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
            {String(currentIndex + 1).padStart(2, '0')} / {String(references.length).padStart(2, '0')}
          </span>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40'
                : 'bg-white/10 text-[#9CA3AF] hover:text-white hover:bg-white/15'
            }`}
            title="Alternar apresentação automática (Tecla P)"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Reproduzindo' : 'Slideshow'}</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-[#9CA3AF] hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Sair da apresentação (ESC)"
          >
            <span>Sair</span>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div className="relative flex-1 flex items-center justify-center p-6 sm:p-12 min-h-0">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 border border-white/10 hover:scale-105"
          title="Anterior (←)"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 border border-white/10 hover:scale-105"
          title="Próxima (→ ou Espaço)"
        >
          <ChevronRight size={24} />
        </button>

        {/* Central Visual Content */}
        <div className="max-w-6xl max-h-full w-full h-full flex flex-col items-center justify-center">
          {currentRef.screenshotUrl ? (
            <img
              src={currentRef.screenshotUrl}
              alt={currentRef.title}
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10 transition-all duration-300"
            />
          ) : (
            <div className="w-full max-w-xl p-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-sm text-[#9CA3AF] uppercase mb-2">
                {currentRef.domain || 'Referência Web'}
              </span>
              <h2 className="text-2xl font-bold text-white mb-4">{currentRef.title}</h2>
              {currentRef.url && (
                <a
                  href={currentRef.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-[#6366F1] underline flex items-center gap-1"
                >
                  {currentRef.url} <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Editorial Caption Bar */}
      <div className="w-full px-8 py-5 z-20 bg-gradient-to-t from-[#0B0C0E]/95 via-[#0B0C0E]/80 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
        <div className="flex flex-col gap-1 min-w-0 max-w-2xl">
          <div className="flex items-center gap-2">
            {currentRef.domain && (
              <span className="font-mono text-[11px] font-semibold text-[#818CF8] uppercase tracking-wider">
                {currentRef.domain}
              </span>
            )}
            {currentRef.tags && currentRef.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {currentRef.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#9CA3AF]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <h2 className="font-sans font-bold text-lg sm:text-xl text-white truncate">
            {currentRef.title}
          </h2>
        </div>

        {/* Palette Strip */}
        {currentRef.palette && currentRef.palette.length > 0 && (
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="font-mono text-[10px] text-[#9CA3AF] uppercase">Paleta</span>
            <div className="flex items-center gap-1.5">
              {currentRef.palette.map((item, idx) => (
                <button
                  key={`${item.hex}-${idx}`}
                  onClick={(e) => handleCopyColor(item.hex, e)}
                  className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125 cursor-pointer relative group flex items-center justify-center"
                  style={{ backgroundColor: item.hex }}
                  title={`${item.name || item.hex} (Clique para copiar)`}
                >
                  {copiedHex === item.hex && (
                    <span className="absolute -top-7 px-1.5 py-0.5 bg-black/90 text-[10px] font-mono text-[#22c55e] rounded shadow-md border border-white/10 whitespace-nowrap">
                      ✓ {item.hex}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
