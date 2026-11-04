import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';

interface CuratedItem {
  id: string;
  title: string;
  source: string;
  category: string;
  tags: string[];
  image: string;
  aspect: string;
}

const CURATED_REFERENCES: CuratedItem[] = [
  {
    id: 'arch-01',
    title: 'Estudo Espacial, Concreto & Luz Suíça',
    source: 'kinfolk.com',
    category: 'Arquitetura & Espaço',
    tags: ['#arquitetura', '#luz-natural', '#concreto'],
    image: '/brand/editorial-architecture-01.webp',
    aspect: 'aspect-4/3',
  },
  {
    id: 'digi-01',
    title: 'Workspace Grid & Linear UI Architecture',
    source: 'linear.app',
    category: 'Produto Digital & Dark Mode',
    tags: ['#interface', '#dark-mode', '#grid-16-10'],
    image: '/brand/digital-interface-grid-01.webp',
    aspect: 'aspect-3/4',
  },
  {
    id: 'typo-02',
    title: 'Tipografia Impressa em Baixo Relevo',
    source: 'letterpress.ch',
    category: 'Tipografia & Tradição Gráfica',
    tags: ['#tipografia', '#letterpress', '#swiss'],
    image: '/brand/editorial-typography-print-02.webp',
    aspect: 'aspect-4/3',
  },
  {
    id: 'spec-02',
    title: 'Design Tokens & Modular Specs',
    source: 'tokens.studio',
    category: 'Frontend & Tokens',
    tags: ['#tokens', '#tailwind', '#design-system'],
    image: '/brand/digital-design-system-spec-02.webp',
    aspect: 'aspect-4/3',
  },
  {
    id: 'hybrid-01',
    title: 'Ateliê Criativo Híbrido (Analógico + Digital)',
    source: 'are.na/fellipe',
    category: 'Direção de Arte & Setup',
    tags: ['#studio', '#analog-digital', '#editorial'],
    image: '/brand/hybrid-studio-still-01.webp',
    aspect: 'aspect-4/3',
  },
];

export const LandingCuration: React.FC = () => {
  return (
    <section id="curadoria" className="py-24 bg-[#F8F8F6] dark:bg-[#111214] border-b border-[#E7E7E5] dark:border-[#2D3139]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16">
          <span className="font-['JetBrains_Mono'] text-xs font-semibold tracking-wider text-[#4355DB] uppercase block mb-3">
            Curadoria Multidisciplinar
          </span>
          <h2 className="font-['Outfit'] font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#171717] dark:text-white leading-tight mb-5">
            Do código à arquitetura: referências que elevam seu repertório.
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-[#737373] dark:text-[#9CA3AF] leading-relaxed">
            O Salvei não foi desenhado apenas para páginas web. É o lar para tipografias impressas, paletas suíças, grids de microinterações, cartazes e composições de luz.
          </p>
        </div>

        {/* Asymmetric Curation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1: Architecture + Token Spec */}
          <div className="flex flex-col gap-6">
            <div className="group rounded-xl border border-[#E7E7E5] dark:border-[#2D3139] bg-white dark:bg-[#191B20] overflow-hidden shadow-xs hover:border-[#4355DB] transition-all">
              <div className="relative aspect-4/3 overflow-hidden bg-black">
                <img
                  src={CURATED_REFERENCES[0].image}
                  alt={CURATED_REFERENCES[0].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" decoding="async" />
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-black/75 text-white backdrop-blur-xs">
                  {CURATED_REFERENCES[0].source}
                </span>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-['JetBrains_Mono'] font-semibold text-[#4355DB] uppercase tracking-wider block mb-1">
                  {CURATED_REFERENCES[0].category}
                </span>
                <h4 className="font-['Outfit'] font-bold text-base text-[#171717] dark:text-white">
                  {CURATED_REFERENCES[0].title}
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {CURATED_REFERENCES[0].tags.map((t) => (
                    <span key={t} className="text-[10px] font-['JetBrains_Mono'] text-[#737373] dark:text-[#9CA3AF]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="group rounded-xl border border-[#E7E7E5] dark:border-[#2D3139] bg-white dark:bg-[#191B20] overflow-hidden shadow-xs hover:border-[#4355DB] transition-all">
              <div className="relative aspect-16/10 overflow-hidden bg-black">
                <img
                  src={CURATED_REFERENCES[3].image}
                  alt={CURATED_REFERENCES[3].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" decoding="async" />
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-black/75 text-white backdrop-blur-xs">
                  {CURATED_REFERENCES[3].source}
                </span>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-['JetBrains_Mono'] font-semibold text-[#4355DB] uppercase tracking-wider block mb-1">
                  {CURATED_REFERENCES[3].category}
                </span>
                <h4 className="font-['Outfit'] font-bold text-base text-[#171717] dark:text-white">
                  {CURATED_REFERENCES[3].title}
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {CURATED_REFERENCES[3].tags.map((t) => (
                    <span key={t} className="text-[10px] font-['JetBrains_Mono'] text-[#737373] dark:text-[#9CA3AF]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Digital Interface (Tall Hero) */}
          <div className="flex flex-col">
            <div className="group h-full rounded-xl border border-[#E7E7E5] dark:border-[#2D3139] bg-white dark:bg-[#191B20] overflow-hidden shadow-xs hover:border-[#4355DB] transition-all flex flex-col justify-between">
              <div className="relative aspect-3/4 sm:aspect-auto sm:flex-1 overflow-hidden bg-black">
                <img
                  src={CURATED_REFERENCES[1].image}
                  alt={CURATED_REFERENCES[1].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" decoding="async" />
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-black/75 text-white backdrop-blur-xs">
                  {CURATED_REFERENCES[1].source}
                </span>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-['JetBrains_Mono'] font-semibold text-[#4355DB] uppercase tracking-wider block mb-1">
                  {CURATED_REFERENCES[1].category}
                </span>
                <h4 className="font-['Outfit'] font-bold text-lg text-[#171717] dark:text-white">
                  {CURATED_REFERENCES[1].title}
                </h4>
                <div className="flex flex-wrap gap-2 mt-3">
                  {CURATED_REFERENCES[1].tags.map((t) => (
                    <span key={t} className="text-xs font-['JetBrains_Mono'] text-[#4355DB] bg-[#4355DB]/8 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Letterpress Typography + Studio Still Life */}
          <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-1">
            <div className="group rounded-xl border border-[#E7E7E5] dark:border-[#2D3139] bg-white dark:bg-[#191B20] overflow-hidden shadow-xs hover:border-[#4355DB] transition-all">
              <div className="relative aspect-16/10 overflow-hidden bg-black">
                <img
                  src={CURATED_REFERENCES[2].image}
                  alt={CURATED_REFERENCES[2].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" decoding="async" />
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-black/75 text-white backdrop-blur-xs">
                  {CURATED_REFERENCES[2].source}
                </span>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-['JetBrains_Mono'] font-semibold text-[#4355DB] uppercase tracking-wider block mb-1">
                  {CURATED_REFERENCES[2].category}
                </span>
                <h4 className="font-['Outfit'] font-bold text-base text-[#171717] dark:text-white">
                  {CURATED_REFERENCES[2].title}
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {CURATED_REFERENCES[2].tags.map((t) => (
                    <span key={t} className="text-[10px] font-['JetBrains_Mono'] text-[#737373] dark:text-[#9CA3AF]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="group rounded-xl border border-[#E7E7E5] dark:border-[#2D3139] bg-white dark:bg-[#191B20] overflow-hidden shadow-xs hover:border-[#4355DB] transition-all">
              <div className="relative aspect-4/3 overflow-hidden bg-black">
                <img
                  src={CURATED_REFERENCES[4].image}
                  alt={CURATED_REFERENCES[4].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy" decoding="async" />
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-black/75 text-white backdrop-blur-xs">
                  {CURATED_REFERENCES[4].source}
                </span>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-['JetBrains_Mono'] font-semibold text-[#4355DB] uppercase tracking-wider block mb-1">
                  {CURATED_REFERENCES[4].category}
                </span>
                <h4 className="font-['Outfit'] font-bold text-base text-[#171717] dark:text-white">
                  {CURATED_REFERENCES[4].title}
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {CURATED_REFERENCES[4].tags.map((t) => (
                    <span key={t} className="text-[10px] font-['JetBrains_Mono'] text-[#737373] dark:text-[#9CA3AF]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-12 text-center">
          <p className="font-['JetBrains_Mono'] text-xs text-[#737373] dark:text-[#9CA3AF]">
            * As imagens acima são demonstrações estéticas de referências catalogadas por criadores em seus ateliês privados. O Salvei preserva a privacidade integral do seu acervo.
          </p>
        </div>
      </div>
    </section>
  );
};
