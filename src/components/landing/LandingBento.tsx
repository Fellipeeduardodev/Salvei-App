import React from 'react';
import { ArrowUpRight, Command, Search, FolderTree, Sparkles, Layers } from 'lucide-react';

interface LandingBentoProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const LandingBento: React.FC<LandingBentoProps> = ({ onOpenAuth }) => {
  return (
    <section id="recursos" className="py-16 sm:py-32 bg-[#FAF7F2] border-b border-[#E5DFD5] px-3.5 sm:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header: Pure Display Authority, No Eyebrows */}
        <div className="max-w-3xl mb-10 sm:mb-20 text-left">
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-5xl md:text-6xl lg:text-[64px] tracking-[-0.04em] text-[#141414] leading-[1.08] sm:leading-[1.01] mb-4 sm:mb-5 break-words">
            Recursos reais, pensados<br className="hidden sm:inline" />
            <span className="text-[#141414]"> para quem vive de criar.</span>
          </h2>
          <p className="font-['Inter'] text-sm sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
            Cada detalhe desenhado para acelerar seu fluxo e eliminar o atrito entre ter uma ideia e começar a produzir.
          </p>
        </div>

        {/* Asymmetric Product Grid - 100% Faithful to Salvei UX */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Row 1: 8/4 Asymmetric Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            
            {/* Primary Hero Showcase: Immersive Library Grid (8 Cols) */}
            <div className="gsap-bento-card lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-[#DFD8CC] overflow-hidden shadow-xs flex flex-col justify-between text-left">
              <div className="p-5 sm:p-10 pb-5 sm:pb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#4355DB] font-bold">
                    Grade da Biblioteca
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs text-slate-500">
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E5DFD5]">
                      Visualização em grade
                    </span>
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E5DFD5]">
                      Filtro por etiquetas
                    </span>
                  </div>
                </div>

                <h3 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-slate-950 mb-3 tracking-tight">
                  Reconhecimento visual imediato, sem o caos das pastas
                </h3>
                <p className="font-['Inter'] text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                  Navegue pela sua coleção completa com thumbnails nítidos em alta definição. Filtre por etiquetas ou coleções temáticas sem perder tempo procurando arquivos perdidos.
                </p>
              </div>

              <div className="relative overflow-hidden bg-[#F1EFE9] border-t border-[#DFD8CC] h-72 sm:h-96">
                <img
                  src="/brand/hero-variations/hero-04-immersive-library.png"
                  alt="Biblioteca Geral com visualização em grade e filtros por tags"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Companion Card: Global Keyboard Shortcuts & Pro-Speed (4 Cols) */}
            <div className="gsap-bento-card lg:col-span-4 bg-[#141414] text-white rounded-3xl border border-slate-800 p-8 sm:p-10 flex flex-col justify-between text-left shadow-md relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/15">
                    <Command className="w-5 h-5 text-[#8E9AFF]" />
                  </div>
                  <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    PRO SPEED
                  </span>
                </div>

                <h3 className="font-['Outfit'] font-bold text-2xl text-white mb-3 tracking-tight">
                  Atalhos de teclado para quem não quer perder o fluxo
                </h3>
                <p className="font-['Inter'] text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                  Opere a biblioteca inteira sem tirar as mãos do teclado. Da busca rápida à cópia de código HEX de cor.
                </p>

                {/* Visual Keyboard Shortcuts Grid */}
                <div className="bg-black/50 rounded-2xl border border-white/10 p-3.5 space-y-2 mb-6 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-300">Busca Universal</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/15 text-white font-bold border border-white/20">⌘K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-300">Captura Rápida</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/15 text-white font-bold border border-white/20">⌘V</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-300">Copiar Cor HEX</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/15 text-white font-bold border border-white/20">C</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-300">Quick Look</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/15 text-white font-bold border border-white/20">Espaço</kbd>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs text-slate-400">
                <span>Tempo de resposta &lt; 20ms</span>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="text-white font-semibold flex items-center gap-1 hover:text-[#8E9AFF] transition-colors cursor-pointer"
                >
                  <span>Experimentar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Row 2: Balanced 6/6 Split (Real SidePanel & Real Workspace) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Specimen A: Real Side Panel with Notes and Colors */}
            <div className="gsap-bento-card bg-white rounded-3xl border border-[#DFD8CC] overflow-hidden shadow-xs flex flex-col justify-between text-left">
              <div className="h-64 sm:h-72 overflow-hidden relative bg-[#F1EFE9]">
                <img
                  src="/brand/hero-variations/hero-03-layered-interface.png"
                  alt="Painel lateral com notas do designer, URL e tags"
                  className="w-full h-full object-cover object-right-top"
                  loading="lazy"
                />
              </div>

              <div className="p-8 sm:p-9 flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#4355DB] font-bold block mb-2">
                    Painel Lateral
                  </span>
                  <h3 className="font-['Outfit'] font-bold text-xl sm:text-2xl text-slate-950 mb-2.5 tracking-tight">
                    Anotações e detalhes de cada referência
                  </h3>
                  <p className="font-['Inter'] text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                    Clique em qualquer imagem para abrir o painel com o link original, as cores extraídas e espaço para registrar suas anotações pessoais.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAE3D6] flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Contexto sempre preservado</span>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="text-[#4355DB] hover:text-[#3646B8] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Criar acervo</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Specimen B: Projects & Collections Workspace */}
            <div className="gsap-bento-card bg-white rounded-3xl border border-[#DFD8CC] overflow-hidden shadow-xs flex flex-col justify-between text-left">
              <div className="h-64 sm:h-72 overflow-hidden relative bg-[#F1EFE9]">
                <img
                  src="/brand/hero-variations/hero-01-floating-product.png"
                  alt="Espaço de trabalho organizado por projetos e coleções"
                  className="w-full h-full object-cover object-left-top"
                  loading="lazy"
                />
              </div>

              <div className="p-8 sm:p-9 flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#4355DB] font-bold block mb-2">
                    Organização Visual
                  </span>
                  <h3 className="font-['Outfit'] font-bold text-xl sm:text-2xl text-slate-950 mb-2.5 tracking-tight">
                    Projetos para clientes, coleções para você
                  </h3>
                  <p className="font-['Inter'] text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                    Separe referências de trabalho de referências pessoais. Crie coleções temáticas e acesse tudo na barra lateral sem bagunça de abas.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAE3D6] flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Projetos e pastas temáticas</span>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="text-[#4355DB] hover:text-[#3646B8] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Criar acervo</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};