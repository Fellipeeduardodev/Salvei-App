import React, { useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal, Check, LayoutGrid, Layers, Command, ExternalLink } from 'lucide-react';

interface LandingProductShowcaseProps {
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onDemoClick?: () => void;
}

export const LandingProductShowcase: React.FC<LandingProductShowcaseProps> = ({
  onOpenAuth,
  onDemoClick,
}) => {
  const [activeTab, setActiveTab] = useState<'interface' | 'harmonics' | 'grid'>('interface');

  const handleLaunchDemo = () => {
    if (onDemoClick) {
      onDemoClick();
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('preview', 'workspace');
      window.location.search = params.toString();
    }
  };

  const tabs = [
    {
      id: 'interface' as const,
      name: 'Busca ⌘K & Detalhes',
      img: '/brand/hero-variations/hero-03-layered-interface.png',
      caption: 'Busca rápida pelo teclado ⌘K e painel lateral com suas notas e cores',
    },
    {
      id: 'harmonics' as const,
      name: 'Tela Principal',
      img: '/brand/hero-variations/hero-06-full-width-experience.png',
      caption: 'Sua tela de trabalho com sidebar de projetos, coleções e filtros por etiquetas',
    },
    {
      id: 'grid' as const,
      name: 'Grade de Referências',
      img: '/brand/hero-variations/hero-04-immersive-library.png',
      caption: 'Navegação visual nítida por todas as suas referências salvas',
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section id="experiencia" className="py-24 sm:py-36 bg-[#F5F2EB] border-b border-[#E5DFD5] scroll-mt-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Bold Editorial Narrative & Interactive Controls (No Eyebrow) */}
          <div className="lg:col-span-5 space-y-7 text-left gsap-showcase-left">
            <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl lg:text-6xl text-[#141414] tracking-[-0.035em] leading-[1.03]">
              A serenidade de uma mesa limpa de trabalho.
            </h2>

            <p className="font-['Inter'] text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Redes sociais competem pela sua atenção com feeds infinitos, algoritmos agressivos e notificações. O Salvei é o oposto: uma ferramenta de precisão, silenciosa e rápida, desenhada para quem precisa de clareza visual para criar.
            </p>

            {/* Interactive View Mode Switcher */}
            <div className="pt-2 space-y-3">
              <span className="font-mono text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Alternar visualização da interface:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`font-mono text-xs px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-[#141414] text-white border-[#141414] shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-[#DDD5C8]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${activeTab === tab.id ? 'bg-[#4355DB]' : 'bg-slate-400'}`} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy & Sovereignty Signals */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DDD5C8] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Zero rastreadores
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DDD5C8] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Armazenamento local
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DDD5C8] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Exportação JSON
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={handleLaunchDemo}
                className="bg-[#171717] hover:bg-slate-800 text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Ver o Salvei em Ação</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuth?.('signup')}
                className="text-sm font-semibold text-[#141414] hover:text-[#4355DB] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Criar Conta Grátis</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>

          {/* Right Column: REAL PRODUCT INTERFACE PREVIEW WITH DYNAMIC TRANSITION */}
          <div className="lg:col-span-7 gsap-showcase-right">
            <div
              onClick={handleLaunchDemo}
              className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(25,20,15,0.14)] border border-[#DDD5C8] group cursor-pointer bg-white"
              title="Clique para testar a aplicação no navegador"
            >
              <div className="relative min-h-[420px] sm:min-h-[500px] bg-[#F1EFE9] flex items-center justify-center overflow-hidden">
                <img
                  key={currentTab.img}
                  src={currentTab.img}
                  alt={currentTab.caption}
                  className="w-full h-auto object-contain block transition-all duration-500 group-hover:scale-[1.01] animate-fadeIn"
                  loading="lazy"
                />
              </div>

              {/* Overlay with active tab indicator */}
              <div className="p-4 sm:p-5 bg-white border-t border-[#EAE3D6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4355DB]" />
                  <span className="font-['Inter'] text-xs sm:text-sm font-semibold text-slate-800">
                    {currentTab.caption}
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider shrink-0 ml-2">
                  Clique p/ Testar App →
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};