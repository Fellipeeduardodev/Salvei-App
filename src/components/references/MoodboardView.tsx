import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Reference } from '../../types/reference';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Move,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface MoodboardViewProps {
  references: Reference[];
  selectedReferenceId?: string | null;
  onSelectReference?: (reference: Reference) => void;
  onUpdatePosition?: (referenceId: string, position: { x: number; y: number }) => void;
  onTagClick?: (tag: string) => void;
}

export const MoodboardView: React.FC<MoodboardViewProps> = ({
  references,
  selectedReferenceId,
  onSelectReference,
  onUpdatePosition,
  onTagClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Posições dos cards em tela
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Inicializa posições padrão dos cards em um layout editorial distribuído
  useEffect(() => {
    setPositions((prev) => {
      const next = { ...prev };
      references.forEach((ref, idx) => {
        if (!next[ref.id]) {
          if (ref.canvasPosition) {
            next[ref.id] = { x: ref.canvasPosition.x, y: ref.canvasPosition.y };
          } else {
            const cols = 4;
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            // Variação leve e orgânica na posição (efeito moodboard artístico)
            const jitterY = (idx % 3) * 20;
            next[ref.id] = {
              x: 80 + col * 320,
              y: 80 + row * 380 + jitterY,
            };
          }
        }
      });
      return next;
    });
  }, [references]);

  // Controle de Pan do Canvas (Arrastar o fundo)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Apenas se o clique foi diretamente no fundo ou com espaço/botão do meio
    if ((e.target as HTMLElement).closest('.moodboard-card')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (draggingCardId) {
        const nextX = Math.round((e.clientX - dragOffset.x - pan.x) / zoom);
        const nextY = Math.round((e.clientY - dragOffset.y - pan.y) / zoom);

        setPositions((prev) => ({
          ...prev,
          [draggingCardId]: { x: nextX, y: nextY },
        }));
      }
    },
    [isPanning, panStart, draggingCardId, dragOffset, pan, zoom]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (draggingCardId) {
      const finalPos = positions[draggingCardId];
      if (finalPos && onUpdatePosition) {
        onUpdatePosition(draggingCardId, finalPos);
      }
      setDraggingCardId(null);
    }
  }, [isPanning, draggingCardId, positions, onUpdatePosition]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Início de arraste do card
  const handleCardMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentPos = positions[id] || { x: 0, y: 0 };
    setDraggingCardId(id);
    setDragOffset({
      x: e.clientX - (currentPos.x * zoom + pan.x),
      y: e.clientY - (currentPos.y * zoom + pan.y),
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 40, y: 40 });
  };

  const handleArrangeGrid = () => {
    const next: Record<string, { x: number; y: number }> = {};
    const cols = 4;
    references.forEach((ref, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      next[ref.id] = {
        x: 80 + col * 320,
        y: 80 + row * 380,
      };
      if (onUpdatePosition) {
        onUpdatePosition(ref.id, next[ref.id]);
      }
    });
    setPositions(next);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      className={`relative w-full h-[calc(100vh-210px)] min-h-[550px] overflow-hidden rounded-xl border border-[#E7E7E5] dark:border-[#2D3139] bg-[#F9F9F8] dark:bg-[#111215] select-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        backgroundImage: `radial-gradient(var(--dot-color, rgba(0,0,0,0.12)) 1.5px, transparent 1.5px)`,
        backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Floating Toolbar Controls */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1.5 rounded-lg bg-white/90 dark:bg-[#191B20]/90 backdrop-blur-md border border-[#E7E7E5] dark:border-[#2D3139] shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
          className="p-1.5 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] cursor-pointer transition-colors"
          title="Diminuir Zoom"
        >
          <ZoomOut size={15} />
        </button>

        <span className="font-mono text-xs font-semibold px-2 text-[#171717] dark:text-[#F3F4F6] min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
          className="p-1.5 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] cursor-pointer transition-colors"
          title="Aumentar Zoom"
        >
          <ZoomIn size={15} />
        </button>

        <div className="w-[1px] h-4 bg-[#E7E7E5] dark:border-[#2D3139] mx-1" />

        <button
          onClick={handleResetView}
          className="p-1.5 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] cursor-pointer transition-colors"
          title="Resetar Visualização"
        >
          <RotateCcw size={15} />
        </button>

        <button
          onClick={handleArrangeGrid}
          className="px-2 py-1 rounded text-xs font-medium hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] text-[#737373] dark:text-[#9CA3AF] cursor-pointer transition-colors"
          title="Reorganizar referências em grade automática"
        >
          Alinhar
        </button>
      </div>

      {/* Canvas Elements Layer */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {references.map((ref) => {
          const pos = positions[ref.id] || { x: 80, y: 80 };
          const isSelected = selectedReferenceId === ref.id;
          const isDragging = draggingCardId === ref.id;

          return (
            <div
              key={ref.id}
              onMouseDown={(e) => handleCardMouseDown(ref.id, e)}
              onClick={() => onSelectReference?.(ref)}
              className={`moodboard-card pointer-events-auto absolute w-[280px] rounded-xl bg-white dark:bg-[#191B20] border transition-shadow cursor-grab active:cursor-grabbing overflow-hidden group ${
                isSelected
                  ? 'border-[#4355DB] shadow-2xl ring-2 ring-[#4355DB]/30 z-20'
                  : 'border-[#E7E7E5] dark:border-[#2D3139] shadow-md hover:shadow-xl'
              } ${isDragging ? 'z-30 scale-102 opacity-95 shadow-2xl' : ''}`}
              style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
              }}
            >
              {/* Image Preview */}
              {ref.screenshotUrl ? (
                <div className="w-full h-[180px] bg-[#0F1012] overflow-hidden relative">
                  <img
                    src={ref.screenshotUrl}
                    alt={ref.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                  />
                  {ref.domain && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white/90">
                      {ref.domain}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-full h-[90px] bg-[#F1F1EF] dark:bg-[#20232A] p-3 flex flex-col justify-center">
                  <span className="font-mono text-[10px] text-[#737373] dark:text-[#9CA3AF] uppercase">
                    {ref.domain || 'Nota / Link'}
                  </span>
                </div>
              )}

              {/* Card Meta Content */}
              <div className="p-3.5 flex flex-col gap-2">
                <h4 className="font-sans font-bold text-xs text-[#171717] dark:text-[#F3F4F6] line-clamp-2 leading-snug">
                  {ref.title}
                </h4>

                {/* Color Swatches if present */}
                {ref.palette && ref.palette.length > 0 && (
                  <div className="flex items-center gap-1 pt-1">
                    {ref.palette.slice(0, 5).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: color.hex }}
                        title={color.name || color.hex}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
