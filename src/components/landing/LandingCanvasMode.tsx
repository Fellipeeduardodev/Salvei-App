import React, { useState } from 'react';
import { LayoutGrid, Move, Palette, Sparkles } from 'lucide-react';

export const LandingCanvasMode: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'canvas' | 'palette'>('canvas');

  return (
    <section id="canvas" className="py-24 sm:py-32 bg-[#FAF7F2] dark:bg-[#090A0F] border-b border-[#E5DFD5] dark:border-slate-850 px-4 sm:px-8 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#4355DB] dark:text-[#8F9BFF] font-semibold bg-[#4355DB]/10 dark:bg-[#4355DB]/20 px-3 py-1 rounded-full border border-[#4355DB]/20 mb-3.5">
              <Move className="w-3.5 h-3.5" />
              <span>Direção de Arte & Espacial</span>
            </div>
            <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl text-[#141414] dark:text-white tracking-[-0.035em] leading-[1.05]">
              Além da grade rígida: a sua mesa de luz infinita.
            </h2>
            <p className="mt-4 font-['Inter'] text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              Algumas ideias precisam de espaço livre para respirar. Arraste referências, agrupe por intenção visual e descubra conexões conceituais.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#141824] rounded-2xl border border-[#DFD8CC] dark:border-slate-800 shadow-2xs shrink-0">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-2 font-mono text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'canvas'
                  ? 'bg-[#141414] text-white dark:bg-[#4355DB] font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Mesa de Luz</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 font-mono text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#141414] text-white dark:bg-[#4355DB] font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grade Estúdio</span>
            </button>

            <button
              onClick={() => setViewMode('palette')}
              className={`flex items-center gap-2 font-mono text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'palette'
                  ? 'bg-[#141414] text-white dark:bg-[#4355DB] font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Cores & Tokens</span>
            </button>
          </div>
        </div>

        {/* Dynamic Canvas Simulation Stage */}
        <div className="bg-[#EFEAE2] dark:bg-[#07080E] rounded-3xl p-6 sm:p-10 border border-[#DFD8CC] dark:border-slate-800 relative min-h-[420px] overflow-hidden flex items-center justify-center transition-all duration-500">
          
          {/* Subtle Canvas Dot Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #71717A 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Mode 1: Canvas (Spatial clusters) */}
          {viewMode === 'canvas' && (
            <div className="relative w-full h-[360px] animate-fadeIn">
              {/* Card 1 */}
              <div className="absolute top-4 left-4 sm:left-12 w-64 bg-white dark:bg-[#181B26] rounded-2xl p-4 shadow-xl border border-black/10 dark:border-white/10 -rotate-2 hover:rotate-0 transition-transform">
                <div className="h-24 rounded-lg bg-gradient-to-tr from-[#0D0E15] to-[#5E6AD2] mb-3 flex items-center justify-center text-white font-mono text-xs">
                  linear.app
                </div>
                <h4 className="font-['Outfit'] font-bold text-xs text-slate-900 dark:text-white truncate">Microinterações de Teclado</h4>
                <span className="font-mono text-[10px] text-slate-400">#interface #dark-mode</span>
              </div>

              {/* Card 2 */}
              <div className="absolute top-12 right-4 sm:right-16 w-64 bg-white dark:bg-[#181B26] rounded-2xl p-4 shadow-xl border border-black/10 dark:border-white/10 rotate-3 hover:rotate-0 transition-transform">
                <div className="h-24 rounded-lg bg-gradient-to-tr from-[#1A1918] to-[#DFD8CE] mb-3 flex items-center justify-center text-slate-900 font-mono text-xs">
                  press.stripe.com
                </div>
                <h4 className="font-['Outfit'] font-bold text-xs text-slate-900 dark:text-white truncate">Tipografia Editorial Suave</h4>
                <span className="font-mono text-[10px] text-slate-400">#branding #serif</span>
              </div>

              {/* Card 3 (Center Connected) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 bg-[#141414] text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-emerald-400">Cluster: Identidade 2026</span>
                  <span className="font-mono text-[10px] text-slate-400">3 marcas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5E6AD2]" />
                  <span className="w-5 h-5 rounded-full bg-[#FF4400]" />
                  <span className="w-5 h-5 rounded-full bg-[#00DFD8]" />
                  <span className="w-5 h-5 rounded-full bg-[#F8FAFC]" />
                  <span className="font-mono text-[11px] text-slate-300 ml-2">Paleta Sintética</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full animate-fadeIn">
              {['Linear Workspace', 'Stripe Press', 'Teenage Engineering'].map((name, i) => (
                <div key={name} className="bg-white dark:bg-[#181B26] rounded-2xl p-4 border border-[#DFD8CC] dark:border-slate-800 shadow-sm text-left">
                  <div className={`h-24 rounded-lg mb-3 ${
                    i === 0 ? 'bg-indigo-950' : i === 1 ? 'bg-amber-100' : 'bg-neutral-800'
                  }`} />
                  <h4 className="font-['Outfit'] font-bold text-sm text-slate-900 dark:text-white">{name}</h4>
                  <p className="font-mono text-[11px] text-slate-400 mt-1">Organização em grid limpo</p>
                </div>
              ))}
            </div>
          )}

          {/* Mode 3: Palette View */}
          {viewMode === 'palette' && (
            <div className="w-full max-w-2xl bg-white dark:bg-[#181B26] rounded-2xl p-6 sm:p-8 border border-[#DFD8CC] dark:border-slate-800 shadow-md animate-fadeIn text-left">
              <h4 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-white mb-2">
                Paleta Cromática Unificada do Acervo
              </h4>
              <p className="font-['Inter'] text-xs text-slate-500 dark:text-slate-400 mb-6">
                Todas as cores das referências mapeadas em um espectro harmonioso.
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {['#0D0E15', '#1A1918', '#5E6AD2', '#635BFF', '#00DFD8', '#FF4400', '#22C55E', '#F8FAFC'].map((hex) => (
                  <div key={hex} className="flex flex-col items-center gap-1.5">
                    <span className="w-10 h-10 rounded-xl shadow-xs border border-black/10" style={{ backgroundColor: hex }} />
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
