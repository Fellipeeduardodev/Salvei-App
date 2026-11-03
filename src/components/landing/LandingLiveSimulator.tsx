import React, { useState } from 'react';
import { Sparkles, ArrowRight, ExternalLink, Check, Copy, Link as LinkIcon, RefreshCw } from 'lucide-react';

interface SimulatorSample {
  id: string;
  url: string;
  domain: string;
  title: string;
  badge: string;
  image: string;
  palette: { hex: string; name: string }[];
  tags: string[];
}

const SAMPLES: SimulatorSample[] = [
  {
    id: 'linear',
    url: 'https://linear.app/method',
    domain: 'linear.app',
    title: 'Linear Method — Principles for Product Management',
    badge: 'Design System & UI',
    image: '/brand/digital-design-system-spec-02.jpg',
    palette: [
      { hex: '#0F172A', name: 'Dark Navy' },
      { hex: '#4355DB', name: 'Cobalt' },
      { hex: '#64748B', name: 'Slate' },
      { hex: '#10B981', name: 'Emerald' },
    ],
    tags: ['#interface', '#dark-mode', '#tokens'],
  },
  {
    id: 'stripe',
    url: 'https://stripe.com/sessions',
    domain: 'stripe.com',
    title: 'Stripe Sessions — The Future of Global Economic Infrastructure',
    badge: 'Fintech & Design',
    image: '/brand/digital-interface-grid-01.jpg',
    palette: [
      { hex: '#0A2540', name: 'Stripe Dark' },
      { hex: '#635BFF', name: 'Stripe Indigo' },
      { hex: '#00D4FF', name: 'Cyan' },
      { hex: '#F6F9FC', name: 'Mist' },
    ],
    tags: ['#fintech', '#grid', '#typography'],
  },
  {
    id: 'kinfolk',
    url: 'https://kinfolk.com/architecture',
    domain: 'kinfolk.com',
    title: 'Kinfolk Ateliê — Concrete, Light and Minimal Living Spaces',
    badge: 'Editorial & Arquitetura',
    image: '/brand/editorial-architecture-01.jpg',
    palette: [
      { hex: '#292524', name: 'Stone' },
      { hex: '#A8A29E', name: 'Warm Gray' },
      { hex: '#D6D3D1', name: 'Sand' },
      { hex: '#F5F5F4', name: 'Canvas' },
    ],
    tags: ['#editorial', '#fotografia', '#minimal'],
  },
];

export const LandingLiveSimulator: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<SimulatorSample>(SAMPLES[0]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleSelectSample = (sample: SimulatorSample) => {
    if (sample.id === selectedSample.id && !isExtracting) return;
    setIsExtracting(true);
    setSelectedSample(sample);
    setTimeout(() => {
      setIsExtracting(false);
    }, 600);
  };

  const handleCopyColor = (hex: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(hex);
    }
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <section id="simulador" className="py-24 sm:py-32 bg-[#FAF7F2] border-b border-[#E5DFD5] px-4 sm:px-8 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <span className="font-mono text-xs uppercase tracking-wider text-[#4355DB] font-semibold block mb-3">
            Demonstração ao Vivo
          </span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl lg:text-6xl text-[#141414] tracking-[-0.035em] leading-[1.03] mb-4">
            Experimente a captura em tempo real.
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-slate-600 font-normal max-w-xl mx-auto">
            Clique em um dos sites abaixo para ver como o Salvei arquiva o layout em alta fidelidade e extrai a paleta HEX instantaneamente.
          </p>

          {/* Sample Pills Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            <span className="font-mono text-xs text-slate-500 mr-2">Exemplos reais:</span>
            {SAMPLES.map((sample) => {
              const isCurrent = sample.id === selectedSample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`font-mono text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#141414] text-white border-[#141414] shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-[#DDD5C8]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-[#4355DB]' : 'bg-slate-400'}`} />
                  <span>{sample.domain}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulator Box */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#DFD8CC] shadow-md overflow-hidden">
          
          {/* Top Simulated Browser Bar */}
          <div className="bg-[#FAF7F2] border-b border-[#E5DFD5] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/80" />
            </div>

            {/* Input Display Bar */}
            <div className="flex-1 max-w-lg bg-white border border-[#DDD5C8] rounded-full px-3.5 py-1.5 flex items-center justify-between gap-2 text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate text-slate-900 font-medium">{selectedSample.url}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Ctrl+V</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
              <span className={`w-2 h-2 rounded-full ${isExtracting ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="hidden sm:inline font-semibold">
                {isExtracting ? 'CAPTURANDO...' : 'PRONTO • 0.6s'}
              </span>
            </div>
          </div>

          {/* Simulator Content Stage */}
          <div className="p-6 sm:p-9 bg-white">
            {isExtracting ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-[#4355DB] animate-spin" />
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  Gerando screenshot e analisando paleta cromática...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fadeIn">
                
                {/* Left: High-Def Screenshot Frame */}
                <div className="md:col-span-7 rounded-2xl overflow-hidden border border-[#E5DFD5] shadow-xs bg-[#FAF7F2]">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={selectedSample.image}
                      alt={selectedSample.title}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Right: Extracted Reference Data */}
                <div className="md:col-span-5 text-left space-y-5">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#4355DB] font-bold block mb-1">
                      {selectedSample.badge}
                    </span>
                    <h3 className="font-['Outfit'] font-bold text-xl sm:text-2xl text-slate-900 leading-snug">
                      {selectedSample.title}
                    </h3>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 mt-1">
                      <span>{selectedSample.domain}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </div>
                  </div>

                  {/* Extracted Color Palette */}
                  <div className="pt-2 border-t border-[#F0ECE4]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-slate-600 font-semibold">
                        Paleta HEX extraída:
                      </span>
                      {copiedHex && (
                        <span className="font-mono text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fadeIn">
                          <Check className="w-3 h-3" />
                          <span>Copiado!</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {selectedSample.palette.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => handleCopyColor(c.hex)}
                          title={`Clique para copiar ${c.hex}`}
                          className="p-2 rounded-xl bg-[#FAF7F2] border border-[#DDD5C8] hover:border-slate-800 transition-all text-center cursor-pointer group"
                        >
                          <div
                            className="w-full h-7 rounded-md mb-1 shadow-2xs border border-black/10 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="font-mono text-[11px] font-bold text-slate-800 block truncate">
                            {c.hex}
                          </span>
                        </button>
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 block mt-1.5">
                      Clique em qualquer amostra para copiar o código HEX
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="pt-2 border-t border-[#F0ECE4] flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[11px] text-slate-500">Etiquetas:</span>
                    {selectedSample.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[11px] bg-[#FAF7F2] border border-[#DDD5C8] px-2.5 py-0.5 rounded-full text-slate-700 select-none"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>

              </div>
            )}
          </div>

          {/* Bottom Bar: Quick Reassurance */}
          <div className="bg-[#FAF7F2] border-t border-[#E5DFD5] px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#4355DB]" />
              <span>Sem formulários: apenas a URL é necessária para salvar.</span>
            </div>
            <span className="text-[#4355DB] font-semibold">100% Gratuito no navegador</span>
          </div>

        </div>

      </div>
    </section>
  );
};
