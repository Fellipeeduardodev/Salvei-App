import React, { useState } from 'react';
import { Calculator, Zap, AlertTriangle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface LandingCalculatorProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onEnterGuestMode?: () => void;
}

export const LandingCalculator: React.FC<LandingCalculatorProps> = ({ onOpenAuth, onEnterGuestMode }) => {
  const [tabsCount, setTabsCount] = useState<number>(42);
  const [lostPrintsPerWeek, setLostPrintsPerWeek] = useState<number>(6);

  // Real-time calculations based on creator usage patterns
  const ramWasteGb = ((tabsCount * 95) / 1024).toFixed(1);
  const hoursWastedPerYear = Math.round((tabsCount * 0.45 + lostPrintsPerWeek * 1.8) * 4);
  const crashRiskPercentage = Math.min(98, Math.round(tabsCount * 0.75 + 28));

  return (
    <section id="calculadora" className="py-24 sm:py-32 bg-[#F5F2EB] dark:bg-[#0D0F18] border-b border-[#E5DFD5] dark:border-slate-850 px-4 sm:px-8 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 text-left">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#4355DB] dark:text-[#8F9BFF] font-semibold bg-[#4355DB]/10 dark:bg-[#4355DB]/20 px-3 py-1 rounded-full border border-[#4355DB]/20 mb-3.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>Diagnóstico do Caos Visual</span>
          </div>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl text-[#141414] dark:text-white tracking-[-0.035em] leading-[1.05] mb-4">
            Quanto custa a desorganização de abas e prints?
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            Mova os controles para descobrir a memória RAM, o tempo e as ideias que se perdem no seu navegador toda semana.
          </p>
        </div>

        {/* Interactive Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Sliders (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#141824] rounded-3xl p-6 sm:p-9 border border-[#DFD8CC] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="space-y-8">
              
              {/* Slider 1: Open Tabs */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <label htmlFor="tabs-slider" className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Abas abertas no navegador hoje:
                  </label>
                  <span className="font-mono text-base font-bold text-[#4355DB] dark:text-[#8F9BFF] bg-[#4355DB]/10 dark:bg-[#4355DB]/25 px-3 py-1 rounded-lg">
                    {tabsCount} abas
                  </span>
                </div>
                <input
                  id="tabs-slider"
                  type="range"
                  min="5"
                  max="120"
                  value={tabsCount}
                  onChange={(e) => setTabsCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#EAE3D6] dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#4355DB]"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
                  <span>5 abas (Zen)</span>
                  <span>50 abas (Típico)</span>
                  <span>120+ abas (Pânico)</span>
                </div>
              </div>

              {/* Slider 2: Lost Prints per Week */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <label htmlFor="prints-slider" className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Prints perdidos ou esquecidos na Mesa por semana:
                  </label>
                  <span className="font-mono text-base font-bold text-[#4355DB] dark:text-[#8F9BFF] bg-[#4355DB]/10 dark:bg-[#4355DB]/25 px-3 py-1 rounded-lg">
                    {lostPrintsPerWeek} prints
                  </span>
                </div>
                <input
                  id="prints-slider"
                  type="range"
                  min="1"
                  max="20"
                  value={lostPrintsPerWeek}
                  onChange={(e) => setLostPrintsPerWeek(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#EAE3D6] dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#4355DB]"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
                  <span>1 print</span>
                  <span>10 prints</span>
                  <span>20 prints</span>
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-[#F0EBE1] dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Cálculo estimado com base na média de consumo do Chrome / V8 Engine e fluxos reais de estúdio.</span>
            </div>
          </div>

          {/* Right Column: Reactive Diagnostics Box (5 cols) */}
          <div className="lg:col-span-5 bg-[#141414] dark:bg-[#07090E] rounded-3xl p-6 sm:p-9 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden text-left">
            {/* Ambient accent glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#4355DB]/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#93C5FD] block mb-4">
                Impacto Calculado
              </span>

              {/* Metric 1: RAM Waste */}
              <div className="mb-6 pb-5 border-b border-white/10">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-['Outfit'] font-black text-4xl sm:text-5xl text-white">
                    {ramWasteGb}
                  </span>
                  <span className="font-mono text-sm text-slate-400 font-semibold">GB de RAM sequestrada</span>
                </div>
                <p className="font-['Inter'] text-xs text-slate-300">
                  Memória consumida mantendo dezenas de páginas ativas em segundo plano.
                </p>
              </div>

              {/* Metric 2: Wasted Hours */}
              <div className="mb-6 pb-5 border-b border-white/10">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-['Outfit'] font-black text-3xl sm:text-4xl text-amber-400">
                    ~{hoursWastedPerYear}h
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-semibold">por ano procurando referências</span>
                </div>
                <p className="font-['Inter'] text-xs text-slate-300">
                  Tempo procurando em histórico de navegação, conversas de Slack e pastas perdidas.
                </p>
              </div>

              {/* Metric 3: Crash Risk */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-slate-400">Risco de perda acidental:</span>
                  <span className="font-mono text-sm font-bold text-rose-400">{crashRiskPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${crashRiskPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full bg-[#4355DB] hover:bg-[#3644B3] active:scale-[0.98] text-white font-['Outfit'] font-bold text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Salvar meu navegador agora (R$ 0)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
