import React from 'react';
import { Check, X, Shield, Zap, Sparkles, FolderX, Compass, FileText, ArrowRight } from 'lucide-react';

interface LandingAlternativeMatrixProps {
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const LandingAlternativeMatrix: React.FC<LandingAlternativeMatrixProps> = ({ onOpenAuth }) => {
  const alternatives = [
    {
      name: 'Pastas do Computador',
      subtitle: 'Finder ou Windows Explorer',
      icon: <FolderX className="w-5 h-5 text-slate-500" />,
      badge: 'O Improviso',
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
      points: [
        { text: 'Prints com nomes genéricos acumulados na Mesa', ok: false },
        { text: 'O link original da web se perde para sempre', ok: false },
        { text: 'Sem extração automática de paleta HEX', ok: false },
        { text: 'Sem busca por tags ou domínio do site', ok: false },
      ],
      verdict: 'Caos visual e arquivos esquecidos na Área de Trabalho.',
    },
    {
      name: 'Pinterest',
      subtitle: 'Rede social de inspiração',
      icon: <Compass className="w-5 h-5 text-rose-500" />,
      badge: 'Social & Feed',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      points: [
        { text: 'Feeds infinitos com anúncios e foco em compras', ok: false },
        { text: 'Algoritmos projetados para reter sua atenção', ok: false },
        { text: 'Sem atalhos de teclado ágeis para estúdio', ok: false },
        { text: 'Sem conexão com ferramentas de design (Figma)', ok: false },
      ],
      verdict: 'Distração constante onde o algoritmo decide o que você vê.',
    },
    {
      name: 'Notion & Docs',
      subtitle: 'Anotações em bloco de notas',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      badge: 'Texto & Tabelas',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      points: [
        { text: 'Lento e pesado para carregar dezenas de imagens', ok: false },
        { text: 'Sem proporção nativa para screenshots de sites', ok: false },
        { text: 'Sem análise automática de cores e tipografia', ok: false },
        { text: 'Exige manutenção manual de tabelas e bancos', ok: false },
      ],
      verdict: 'Excelente para texto, mas lento e engessado para referências visuais.',
    },
    {
      name: 'Salvei',
      subtitle: 'Ateliê visual privado',
      icon: <Sparkles className="w-5 h-5 text-[#93C5FD]" />,
      badge: 'Precisão & Foco',
      badgeColor: 'bg-[#4355DB] text-white border-[#4355DB]',
      isFeatured: true,
      points: [
        { text: 'Captura em 1 clique com Ctrl+V e link original preservado', ok: true },
        { text: 'Extração automática de 4 cores HEX para copiar no Figma', ok: true },
        { text: '100% privado, silencioso, sem feeds e sem anúncios', ok: true },
        { text: 'Busca instantânea ⌘K em menos de 100ms pelo teclado', ok: true },
      ],
      verdict: 'O santuário limpo construído exclusivamente para o seu repertório.',
    },
  ];

  return (
    <section id="comparativo-ferramentas" className="py-16 sm:py-32 bg-[#F5F2EB] border-b border-[#E5DFD5] px-3.5 sm:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header: Pure Display Authority, No Eyebrows */}
        <div className="max-w-3xl mb-10 sm:mb-20 text-left">
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-5xl md:text-6xl lg:text-[64px] text-[#141414] tracking-[-0.04em] leading-[1.08] sm:leading-[1.01] mb-4 sm:mb-5 break-words">
            Por que não o Pinterest, Notion ou pastas do computador?
          </h2>
          <p className="font-['Inter'] text-sm sm:text-xl text-slate-600 font-normal leading-relaxed">
            Ferramentas genéricas foram feitas para feeds ou anotações em texto. O Salvei é um ateliê cirúrgico de referências visuais.
          </p>
        </div>

        {/* 4-Column Symmetrical Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {alternatives.map((alt, idx) => (
            <div
              key={idx}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between text-left transition-all ${
                alt.isFeatured
                  ? 'bg-[#141414] text-white border border-slate-800 shadow-xl relative overflow-hidden'
                  : 'bg-white/80 border border-[#DFD8CC] shadow-2xs text-slate-900'
              }`}
            >
              {/* Featured Subtle Glow */}
              {alt.isFeatured && (
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#4355DB]/25 rounded-full blur-2xl pointer-events-none" />
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    alt.isFeatured ? 'bg-white/10 border-white/15' : 'bg-[#FAF7F2] border-[#E5DFD5]'
                  }`}>
                    {alt.icon}
                  </div>
                  <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${alt.badgeColor}`}>
                    {alt.badge}
                  </span>
                </div>

                <h3 className={`font-['Outfit'] font-bold text-xl mb-1 ${alt.isFeatured ? 'text-white' : 'text-slate-950'}`}>
                  {alt.name}
                </h3>
                <p className={`font-['Inter'] text-xs mb-6 ${alt.isFeatured ? 'text-slate-400' : 'text-slate-500'}`}>
                  {alt.subtitle}
                </p>

                {/* Criteria Points */}
                <ul className="space-y-3.5 pt-4 border-t border-[#EAE3D6]/40 text-xs font-['Inter'] leading-relaxed">
                  {alt.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5">
                      {pt.ok ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                          ✓
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                          ✕
                        </div>
                      )}
                      <span className={alt.isFeatured ? 'text-slate-200' : 'text-slate-600'}>
                        {pt.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verdict Summary */}
              <div className={`mt-6 pt-4 border-t font-mono text-[11px] ${
                alt.isFeatured
                  ? 'border-white/10 text-[#93C5FD]'
                  : 'border-[#EAE3D6] text-slate-500'
              }`}>
                {alt.verdict}
              </div>

              {alt.isFeatured && onOpenAuth && (
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="mt-5 w-full bg-[#4355DB] hover:bg-[#3644B3] active:scale-[0.98] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Criar conta gratuita</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
