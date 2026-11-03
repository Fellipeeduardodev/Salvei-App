import React from 'react';
import { ShieldCheck, HardDrive, Download, Lock, CheckCircle2 } from 'lucide-react';

export const LandingDataSovereignty: React.FC = () => {
  const pillars = [
    {
      icon: <HardDrive className="w-5 h-5 text-[#4355DB] dark:text-[#8F9BFF]" />,
      title: 'Persistência Local-First',
      desc: 'Suas referências ficam guardadas na memória local do seu navegador. Navegue, busque e categorize mesmo sem conexão com a internet.',
      badge: 'Offline Pronto',
    },
    {
      icon: <Download className="w-5 h-5 text-emerald-500" />,
      title: 'Exportação Universal (.zip)',
      desc: 'Baixe um arquivo zip com todas as capturas em resolução original, metadados em .json e notas em Markdown compatíveis com Obsidian e Notion.',
      badge: 'Zero Lock-in',
    },
    {
      icon: <Lock className="w-5 h-5 text-amber-500" />,
      title: 'Privacidade Sagrada',
      desc: 'Nós nunca vendemos seus dados nem usamos suas referências para treinar inteligências artificiais. O Salvei é um ateliê privado, não uma rede social.',
      badge: '100% Confidencial',
    },
  ];

  return (
    <section id="soberania" className="py-24 sm:py-32 bg-[#FAF7F2] dark:bg-[#090A0F] border-b border-[#E5DFD5] dark:border-slate-850 px-4 sm:px-8 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-14 sm:mb-20 text-left">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#4355DB] dark:text-[#8F9BFF] font-semibold bg-[#4355DB]/10 dark:bg-[#4355DB]/20 px-3 py-1 rounded-full border border-[#4355DB]/20 mb-3.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Soberania Digital</span>
          </div>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl text-[#141414] dark:text-white tracking-[-0.035em] leading-[1.05] mb-4">
            Suas referências pertencem a você. Ponto final.
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            Construído para criadores que valorizam longevidade, segurança e controle total sobre o seu patrimônio visual.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#141824] rounded-3xl p-7 sm:p-8 border border-[#DFD8CC] dark:border-slate-800 shadow-2xs flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E5DFD5] dark:border-slate-700 flex items-center justify-center">
                    {p.icon}
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#DFD8CC] dark:border-slate-700">
                    {p.badge}
                  </span>
                </div>

                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900 dark:text-white mb-2">
                  {p.title}
                </h3>

                <p className="font-['Inter'] text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F0EBE1] dark:border-slate-800 flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Garantia de controle total</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
