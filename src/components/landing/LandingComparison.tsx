import React, { useState } from 'react';
import { ArrowRight, Layers, Search, Palette, Zap, Check, AlertTriangle, X, Copy, ExternalLink, Sparkles } from 'lucide-react';

export const LandingComparison: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyColor = (hex: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(hex);
    }
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2200);
  };

  return (
    <section id="comparativo" className="py-16 sm:py-28 bg-[#F5F2EB] border-b border-[#E5DFD5] px-3.5 sm:px-8 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header: Pure Display Authority, No Eyebrows */}
        <div className="max-w-3xl mb-10 sm:mb-18 text-left">
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-5xl md:text-6xl lg:text-[64px] tracking-[-0.04em] text-[#141414] leading-[1.08] sm:leading-[1.01] mb-4 sm:mb-5 break-words">
            Do caos das abas abertas<br className="hidden sm:inline" />
            <span className="text-[#141414]"> ao foco absoluto.</span>
          </h2>
          <p className="font-['Inter'] text-sm sm:text-xl text-slate-600 leading-relaxed font-normal">
            A diferença entre o improviso do dia a dia e um acervo visual estruturado para quem cria.
          </p>
        </div>

        {/* Editorial Split Grid: Visual Before vs. After */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left Column: O IMPROVISO (O Problema) */}
          <div className="lg:col-span-5 bg-white/70 rounded-2xl sm:rounded-3xl border border-[#DFD8CC] p-5 sm:p-9 flex flex-col justify-between text-left gsap-compare-left shadow-2xs relative">
            <div>
              {/* Status Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full font-bold">
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  <span>Antes • O Improviso</span>
                </span>
                <span className="font-mono text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse-warning">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>3.8 GB de RAM</span>
                </span>
              </div>

              <h3 className="font-['Outfit'] font-bold text-2xl text-slate-900 mb-5 tracking-tight">
                Abas acumuladas, prints soltos e perda de referências
              </h3>

              {/* Punchy Problem Bullets with Red X */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600 font-['Inter'] leading-relaxed mb-6">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✕
                  </div>
                  <span>
                    <strong className="text-slate-800 font-semibold">Abas perdidas no navegador:</strong> Dezenas de páginas abertas consumindo memória que acabam fechadas por acidente no fim do dia.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✕
                  </div>
                  <span>
                    <strong className="text-slate-800 font-semibold">Prints anônimos na Mesa:</strong> Screenshots com nomes genéricos acumulados no computador sem link original e sem tags.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✕
                  </div>
                  <span>
                    <strong className="text-slate-800 font-semibold">Inspeção manual cansativa:</strong> Abrir o Inspecionar do Chrome ou editor toda vez só para tentar descobrir o HEX de uma cor.
                  </span>
                </li>
              </ul>

              {/* Visual Simulation of the Chaos */}
              <div className="p-4 rounded-2xl bg-[#EFE9DF] border border-[#DDD5C8] font-mono text-xs space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-[#DDD5C8]">
                  <span>Navegador sobrecarregado</span>
                  <span className="text-rose-600 font-bold">+34 abas</span>
                </div>

                {/* Crowded Browser Tabs */}
                <div className="flex items-center gap-1 overflow-hidden">
                  <div className="px-2 py-1 rounded bg-white/90 border border-[#DDD5C8] text-[11px] text-slate-700 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>linear.app</span>
                    <span className="text-slate-400">×</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-white/70 border border-[#DDD5C8] text-[11px] text-slate-600 flex items-center gap-1 shrink-0">
                    <span>figma.com</span>
                    <span className="text-slate-400">×</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-white/50 border border-[#DDD5C8] text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                    <span>dribbble</span>
                    <span className="text-slate-400">×</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-white/40 border border-[#DDD5C8] text-[11px] text-slate-400 shrink-0">
                    <span>behance</span>
                  </div>
                </div>

                {/* Messy Desktop Files Simulation */}
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between p-2 rounded bg-white/80 border border-[#DDD5C8]/80">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-amber-600 shrink-0">📸</span>
                      <span className="truncate">Captura_de_tela_2026-10-31_14.22.png</span>
                    </div>
                    <span className="text-[10px] text-rose-500 font-bold shrink-0 ml-1">Sem link</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-white/80 border border-[#DDD5C8]/80">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-amber-600 shrink-0">📸</span>
                      <span className="truncate">Sem_titulo_FINAL_v2_agora_vai.png</span>
                    </div>
                    <span className="text-[10px] text-rose-500 font-bold shrink-0 ml-1">Sem tags</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Alert Summary */}
            <div className="mt-6 pt-4 border-t border-[#EAE3D6] font-mono text-xs text-rose-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>Resultado: Horas perdidas procurando o que você já tinha visto.</span>
            </div>
          </div>

          {/* Right Column: COM O SALVEI (A Solução) */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-[#D5CDC0] p-5 sm:p-9 shadow-md flex flex-col justify-between text-left relative overflow-hidden gsap-compare-right">
            {/* Top Cobalt Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#4355DB]" />

            <div>
              {/* Status Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Depois • Com o Salvei</span>
                </span>
                <span className="font-mono text-[11px] sm:text-xs text-slate-500 bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded-full">
                  Atalho ⌘K em qualquer tela
                </span>
              </div>

              <h3 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-slate-950 mb-3 tracking-tight">
                Tudo salvo em 1 segundo, catalogado e pronto para o seu próximo projeto
              </h3>
              <p className="font-['Inter'] text-sm text-slate-600 mb-6 font-normal">
                Cole com <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800">Ctrl+V</kbd>. O Salvei extrai a paleta, gera o preview em alta fidelidade e liberta seu navegador.
              </p>

              {/* Interactive Live Salvei Card Demo */}
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#DFD8CC] shadow-xs relative">
                {/* Floating "Salvo com Ctrl+V" Tag */}
                <div className="absolute -top-3 right-4 bg-[#141414] text-white font-mono text-[11px] px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 animate-float-slow">
                  <Sparkles className="w-3 h-3 text-[#93C5FD]" />
                  <span>Salvo em 0.8s</span>
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white text-xs flex items-center justify-center font-bold font-mono shrink-0 shadow-2xs">
                      L
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-['Outfit'] font-bold text-sm text-slate-900 truncate">
                        Linear Workspace • Design Tokens
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                        <span>linear.app</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>0 abas acumuladas</span>
                  </span>
                </div>

                {/* Interactive Palette & Tags Area */}
                <div className="pt-3 border-t border-[#E8E2D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[11px] text-slate-500">Tags:</span>
                    <span className="font-mono text-[11px] bg-white border border-[#DDD5C8] px-2 py-0.5 rounded-full text-slate-700 select-none">
                      #interface
                    </span>
                    <span className="font-mono text-[11px] bg-white border border-[#DDD5C8] px-2 py-0.5 rounded-full text-slate-700 select-none">
                      #dark-mode
                    </span>
                    <span className="font-mono text-[11px] bg-white border border-[#DDD5C8] px-2 py-0.5 rounded-full text-slate-700 select-none">
                      #tokens
                    </span>
                  </div>

                  {/* Interactive Colors (Click to Copy) */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">Cores HEX:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { hex: '#0F172A', label: 'Dark Navy' },
                        { hex: '#4355DB', label: 'Cobalt' },
                        { hex: '#94A3B8', label: 'Slate' },
                        { hex: '#10B981', label: 'Emerald' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => handleCopyColor(c.hex)}
                          title={`Clique para copiar ${c.hex}`}
                          className="w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-125 active:scale-95 cursor-pointer relative group flex items-center justify-center shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        >
                          <span className="sr-only">Copiar {c.hex}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Copy Feedback Toast */}
                {copiedHex && (
                  <div className="mt-2 text-center text-xs font-mono text-emerald-700 bg-emerald-100/90 border border-emerald-300 py-1 px-2 rounded-lg animate-fadeIn flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Código <strong>{copiedHex}</strong> copiado para a área de transferência!</span>
                  </div>
                )}
              </div>

              {/* 3 Direct Solution Guarantees (Mirrors the 3 pain points on the left) */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 font-['Inter'] leading-relaxed mb-6">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✓
                  </div>
                  <span>
                    <strong className="text-slate-900 font-semibold">Captura imediata:</strong> O título, favicon original e screenshot em alta fidelidade ficam salvos na hora, sem formulários manuais.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✓
                  </div>
                  <span>
                    <strong className="text-slate-900 font-semibold">Cores HEX identificadas:</strong> As 4 cores dominantes extraídas automaticamente para você copiar com um clique para o Figma.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✓
                  </div>
                  <span>
                    <strong className="text-slate-900 font-semibold">Memória 100% liberada:</strong> Feche dezenas de abas pesadas sabendo que seu repertório está seguro e localizável via ⌘K.
                  </span>
                </li>
              </ul>
            </div>

            {/* Bottom Victory Summary */}
            <div className="mt-6 pt-4 border-t border-[#EAE3D6] font-mono text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Resultado: Menos esforço de organização, memória livre e foco total em criar.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
