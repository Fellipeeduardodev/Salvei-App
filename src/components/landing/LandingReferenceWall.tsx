import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Sparkles, Filter } from 'lucide-react';

interface ReferenceItem {
  id: string;
  title: string;
  domain: string;
  url: string;
  category: 'interface' | 'branding' | 'dark-mode' | 'saas' | 'minimalismo';
  tags: string[];
  palette: string[];
  accentColor: string;
  previewGradient: string;
  previewLabel: string;
}

export const LandingReferenceWall: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const references: ReferenceItem[] = [
    {
      id: 'linear',
      title: 'Linear — Issue Tracking & Sprint Cycles',
      domain: 'linear.app',
      url: 'https://linear.app',
      category: 'dark-mode',
      tags: ['#interface', '#dark-mode', '#saas'],
      palette: ['#0D0E15', '#5E6AD2', '#8F9BFF', '#F7F8F8'],
      accentColor: '#5E6AD2',
      previewGradient: 'from-[#0D0E15] via-[#1A1C29] to-[#0D0E15]',
      previewLabel: 'Issue Board & Keyboard-first Workflow',
    },
    {
      id: 'stripe-press',
      title: 'Stripe Press — Ideas for Progress',
      domain: 'press.stripe.com',
      url: 'https://press.stripe.com',
      category: 'branding',
      tags: ['#branding', '#minimalismo'],
      palette: ['#1A1918', '#635BFF', '#DFD8CE', '#F8F5F0'],
      accentColor: '#635BFF',
      previewGradient: 'from-[#F8F5F0] via-[#EFEAE2] to-[#DFD8CE]',
      previewLabel: 'Editorial Design & Physical Book Arts',
    },
    {
      id: 'vercel',
      title: 'Vercel — Deployment Frameworks & Ship',
      domain: 'vercel.com',
      url: 'https://vercel.com',
      category: 'saas',
      tags: ['#interface', '#dark-mode', '#saas'],
      palette: ['#000000', '#0070F3', '#00DFD8', '#FFFFFF'],
      accentColor: '#0070F3',
      previewGradient: 'from-[#000000] via-[#0A0A0A] to-[#171717]',
      previewLabel: 'Zero Configuration Cloud Architecture',
    },
    {
      id: 'teenage-eng',
      title: 'Teenage Engineering — Industrial Hardware',
      domain: 'teenage.engineering',
      url: 'https://teenage.engineering',
      category: 'minimalismo',
      tags: ['#branding', '#minimalismo'],
      palette: ['#212121', '#FF4400', '#D3D3D3', '#F2F2F2'],
      accentColor: '#FF4400',
      previewGradient: 'from-[#ECECEC] via-[#DEDCD7] to-[#C9C7C0]',
      previewLabel: 'Precision Audio Synthesizers & Dial UI',
    },
    {
      id: 'raycast',
      title: 'Raycast — Extendable Mac Launcher',
      domain: 'raycast.com',
      url: 'https://raycast.com',
      category: 'interface',
      tags: ['#interface', '#saas'],
      palette: ['#0F0F12', '#FF6363', '#4E5365', '#FFFFFF'],
      accentColor: '#FF6363',
      previewGradient: 'from-[#0F0F12] via-[#1C1820] to-[#0F0F12]',
      previewLabel: 'Command Palette & Developer Store',
    },
    {
      id: 'cosmos',
      title: 'Cosmos — Visual Archive & Curators',
      domain: 'cosmos.so',
      url: 'https://cosmos.so',
      category: 'minimalismo',
      tags: ['#branding', '#minimalismo'],
      palette: ['#1C1B1A', '#A39F99', '#EAE6DF', '#FAF8F5'],
      accentColor: '#A39F99',
      previewGradient: 'from-[#FAF8F5] via-[#EDE9E1] to-[#E2DDD3]',
      previewLabel: 'Quiet Aesthetic Archive without Algorithms',
    },
  ];

  const filterTabs = [
    { id: 'todos', label: 'Todas as referências' },
    { id: 'interface', label: '#interface' },
    { id: 'branding', label: '#branding' },
    { id: 'dark-mode', label: '#dark-mode' },
    { id: 'saas', label: '#saas' },
    { id: 'minimalismo', label: '#minimalismo' },
  ];

  const filteredReferences = activeFilter === 'todos'
    ? references
    : references.filter((ref) => ref.tags.includes(`#${activeFilter}`));

  const handleCopyHex = (e: React.MouseEvent, hex: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => {
      setCopiedHex(null);
    }, 1500);
  };

  return (
    <section id="acervo" className="py-24 sm:py-32 bg-[#FAF7F2] border-b border-[#E5DFD5] px-4 sm:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#4355DB] font-semibold bg-[#4355DB]/10 px-3 py-1 rounded-full border border-[#4355DB]/20 mb-3.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mural de Acervo Real</span>
            </div>
            <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl lg:text-6xl text-[#141414] tracking-[-0.035em] leading-[1.03]">
              Como o seu repertório ganha vida no Salvei.
            </h2>
            <p className="mt-4 font-['Inter'] text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Exemplos reais de produtos, identidades e interfaces catalogadas com metadados automáticos e paletas HEX prontas para o Figma.
            </p>
          </div>

          {/* Filter Pills - Clickable with clean hover */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 shrink-0">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`font-mono text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#141414] text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 border border-[#DFD8CC] hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6-Card Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredReferences.map((ref) => {
            const isDarkGradient = ref.tags.includes('#dark-mode') || ref.id === 'linear' || ref.id === 'vercel' || ref.id === 'raycast';

            return (
              <div
                key={ref.id}
                className="bg-white rounded-2xl border border-[#DFD8CC] overflow-hidden flex flex-col justify-between shadow-2xs text-left"
              >
                {/* Visual Preview Stage (Fixed representation) */}
                <div className={`relative h-48 sm:h-52 w-full bg-gradient-to-br ${ref.previewGradient} p-5 flex flex-col justify-between overflow-hidden border-b border-[#EAE3D6]`}>
                  {/* Subtle Grid Pattern Overlay */}
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkGradient ? '#ffffff' : '#000000'} 1px, transparent 0)`,
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Top Bar inside thumbnail */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className={`font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md backdrop-blur-md ${
                      isDarkGradient ? 'bg-white/10 text-white border border-white/10' : 'bg-black/5 text-slate-900 border border-black/10'
                    }`}>
                      {ref.domain}
                    </span>

                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                        isDarkGradient ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-black/10 text-slate-900 hover:bg-black/20'
                      }`}
                      aria-label={`Visitar site de ${ref.title}`}
                      title={`Visitar ${ref.domain}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Center Thumbnail Representation */}
                  <div className="relative z-10">
                    <div className={`p-3 rounded-xl backdrop-blur-md border ${
                      isDarkGradient
                        ? 'bg-[#181B26]/80 border-white/10 text-white'
                        : 'bg-white/85 border-slate-200 text-slate-900'
                    } shadow-md`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: ref.accentColor }}
                        />
                        <span className="font-mono text-[11px] font-semibold truncate">
                          {ref.domain}
                        </span>
                      </div>
                      <p className="font-['Outfit'] font-bold text-xs sm:text-sm line-clamp-1">
                        {ref.previewLabel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Content & Metadata */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                  <div>
                    {/* Title */}
                    <h3 className="font-['Outfit'] font-bold text-base sm:text-lg text-[#141414] mb-2 leading-snug">
                      {ref.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-5">
                      {ref.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[11px] text-slate-600 bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E5DFD5]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Extracted HEX Palette (Interactive color swatches with copy) */}
                  <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mr-1">
                        Paleta HEX:
                      </span>
                      {ref.palette.map((hex) => {
                        const isCopied = copiedHex === hex;
                        return (
                          <button
                            key={hex}
                            onClick={(e) => handleCopyHex(e, hex)}
                            className="relative group w-5 h-5 rounded-full border border-black/15 shadow-2xs hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                            style={{ backgroundColor: hex }}
                            title={`Copiar ${hex}`}
                            aria-label={`Copiar cor ${hex}`}
                          >
                            {isCopied && (
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#141414] text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap shadow-md z-20">
                                Copiado!
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <span className="font-mono text-[10px] text-slate-400">
                      1 toque p/ copiar
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantee */}
        <div className="mt-12 text-center">
          <p className="font-mono text-xs text-slate-500">
            • Todas as referências preservam os links originais, favicons em alta definição e paletas sincronizadas.
          </p>
        </div>

      </div>
    </section>
  );
};
