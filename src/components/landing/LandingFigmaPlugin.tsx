import React from 'react';
import { Layers, ArrowRight, Check, Palette, Sparkles, ExternalLink } from 'lucide-react';

export const LandingFigmaPlugin: React.FC<{ onOpenAuth: (mode: 'login' | 'signup') => void }> = ({ onOpenAuth }) => {
  return (
    <section id="figma" className="py-24 sm:py-32 bg-[#F5F2EB] dark:bg-[#0D0F18] border-b border-[#E5DFD5] dark:border-slate-850 px-4 sm:px-8 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
          
          {/* Left Column: Value Proposition (6 cols) */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#4355DB] dark:text-[#8F9BFF] font-semibold bg-[#4355DB]/10 dark:bg-[#4355DB]/20 px-3 py-1 rounded-full border border-[#4355DB]/20 mb-3.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Plugin Oficial Figma</span>
            </div>

            <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl text-[#141414] dark:text-white tracking-[-0.035em] leading-[1.05] mb-5">
              Do navegador direto para o seu arquivo no Figma.
            </h2>

            <p className="font-['Inter'] text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed mb-8">
              Chega de tirar print do print para colar no canvas. Com o plugin oficial do Salvei, seu acervo vive onde você realmente cria.
            </p>

            {/* 3 Pillars */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Paletas importadas como Variáveis / Styles
                  </h4>
                  <p className="font-['Inter'] text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    1 clique para injetar os 4 códigos HEX da referência diretamente como estilos de cor locais do seu arquivo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Arrastar e Soltar no Canvas
                  </h4>
                  <p className="font-['Inter'] text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Arraste a captura em alta resolução direto para a prancheta de desenho para benchmarking visual imediato.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Invocação Rápida com Shift + I
                  </h4>
                  <p className="font-['Inter'] text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Acesse toda a sua biblioteca sem abrir o navegador e sem perder o foco na entrega.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth('signup')}
              className="bg-[#0F172A] hover:bg-slate-800 dark:bg-[#4355DB] dark:hover:bg-[#3644B3] active:scale-[0.98] text-white font-['Outfit'] font-bold text-sm py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Conectar ao Figma gratuitamente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Visual Figma Mockup (6 cols) */}
          <div className="lg:col-span-6 bg-[#1E1E1E] rounded-3xl p-6 sm:p-7 border border-[#383838] shadow-2xl text-white relative overflow-hidden text-left">
            {/* Figma Window Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#333333]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="font-mono text-xs text-slate-400 ml-2 font-medium">Design System 2026.fig</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">
                ● Figma Plugin Conectado
              </span>
            </div>

            {/* Salvei Floating Plugin Window inside Figma */}
            <div className="bg-[#141414] rounded-2xl border border-slate-700/80 p-5 shadow-xl relative">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#4355DB] flex items-center justify-center font-black text-xs">
                    S
                  </div>
                  <span className="font-['Outfit'] font-bold text-sm">Salvei for Figma</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">Shift + I</span>
              </div>

              {/* Sample card ready to inject */}
              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-white">Linear Workspace UI</span>
                  <span className="font-mono text-[10px] text-slate-400">linear.app</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 rounded-full bg-[#0D0E15] border border-white/20" />
                  <span className="w-4 h-4 rounded-full bg-[#5E6AD2]" />
                  <span className="w-4 h-4 rounded-full bg-[#8F9BFF]" />
                  <span className="w-4 h-4 rounded-full bg-[#F7F8F8]" />
                  <span className="font-mono text-[10px] text-[#93C5FD] ml-auto">4 Tokens Detectados</span>
                </div>

                {/* Import Button */}
                <button
                  type="button"
                  className="w-full bg-[#4355DB]/20 hover:bg-[#4355DB]/30 border border-[#4355DB]/40 text-[#93C5FD] font-mono text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Criar Figma Color Styles (1 clique)</span>
                </button>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                <span>Tokens sincronizados:</span>
                <span className="text-emerald-400 font-bold">✓ 32 variáveis ativas</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
