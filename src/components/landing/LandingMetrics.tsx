import React from 'react';
import { Zap, Palette, ShieldCheck, Cpu } from 'lucide-react';

export const LandingMetrics: React.FC = () => {
  const metrics = [
    {
      value: '< 1s',
      label: 'Tempo de captura',
      desc: 'Cole qualquer link com Ctrl+V e o card é gerado na hora com screenshot em alta fidelidade.',
      icon: <Zap className="w-4 h-4 text-[#4355DB]" />,
    },
    {
      value: '4 Cores',
      label: 'Paleta HEX extraída',
      desc: 'Amostras dominantes identificadas automaticamente para você copiar com 1 clique para o Figma.',
      icon: <Palette className="w-4 h-4 text-[#4355DB]" />,
    },
    {
      value: '100%',
      label: 'Privado e focado',
      desc: 'Suas referências pertencem a você. Sem feeds públicos caóticos e sem anúncios atrapalhando.',
      icon: <ShieldCheck className="w-4 h-4 text-[#4355DB]" />,
    },
    {
      value: '0 Abas',
      label: 'Memória liberada',
      desc: 'Feche dezenas de abas pesadas no navegador com a certeza de que tudo está seguro e catalogado.',
      icon: <Cpu className="w-4 h-4 text-[#4355DB]" />,
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#FAF7F2] border-b border-[#E5DFD5] px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="gsap-metrics-item p-5 sm:p-6 rounded-2xl bg-white border border-[#DFD8CC] shadow-2xs text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center mb-4 shadow-2xs">
                {m.icon}
              </div>
              <div className="font-['Outfit'] font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight mb-1">
                {m.value}
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-[#4355DB] font-bold mb-2">
                {m.label}
              </div>
              <p className="font-['Inter'] text-xs text-slate-600 leading-relaxed font-normal">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
