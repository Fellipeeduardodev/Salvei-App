import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface LandingPricingProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onOpenAuth }) => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="precos" className="py-16 sm:py-32 bg-[#FAF7F2] border-b border-[#E5DFD5] scroll-mt-20 px-3.5 sm:px-8">
      <div className="max-w-5xl mx-auto text-center">
        
        {/* Section Header: Pure Display Authority, No Eyebrows */}
        <div className="max-w-3xl mx-auto mb-10 sm:mb-18 text-center">
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-5xl md:text-6xl lg:text-[64px] text-[#141414] tracking-[-0.04em] leading-[1.08] sm:leading-[1.01] mb-3 sm:mb-4 break-words">
            Simples, claro e sem surpresas.
          </h2>
          <p className="font-['Inter'] text-sm sm:text-lg text-slate-600 font-normal max-w-xl mx-auto">
            Organize seu repertório visual sem necessidade de cartão de crédito.
          </p>

          {/* Toggle Monthly / Yearly */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-[#EFE9DF] border border-[#DDD5C8] mt-8 text-xs font-semibold">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                !isYearly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Uso Pessoal
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                isYearly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Para Estúdios</span>
              <span className="text-[#4355DB] font-bold text-[11px] bg-[#4355DB]/10 px-1.5 py-0.5 rounded-full">Em Breve</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          
          {/* Card 1: Standard / Gratuito (Dark Signature Card) */}
          <div className="gsap-pricing-card rounded-3xl bg-[#141414] text-white p-8 sm:p-9 shadow-xl flex flex-col justify-between relative overflow-hidden border border-slate-800">
            {/* Ambient Warm Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#4355DB]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-white font-mono">
                  100% Grátis
                </span>
                <span className="text-xs text-slate-300 font-mono">Sem cartão</span>
              </div>

              <div>
                <h3 className="font-['Outfit'] font-bold text-2xl text-white">Plano Pessoal</h3>
                <p className="text-xs text-slate-300 mt-1">Para designers, pesquisadores e criadores visuais.</p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-black font-['Outfit'] text-white">R$ 0</span>
                  <span className="text-xs text-slate-400 font-mono">/ para sempre</span>
                </div>
              </div>

              <div className="space-y-3 pt-5 border-t border-white/10 text-xs sm:text-sm text-slate-200 font-['Inter']">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Referências e links ilimitados</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Extração automática de paleta HEX</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Coleções e quadros por projeto</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Busca relâmpago por teclado ⌘K</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Acesso no computador, tablet e celular</span>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3.5 text-center text-sm font-bold text-[#141414] bg-white hover:bg-slate-100 hover:shadow-lg active:scale-[0.98] rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Criar Conta Gratuita</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Pro / Estúdio */}
          <div className="gsap-pricing-card rounded-3xl bg-white border border-[#DFD8CC] text-slate-900 p-8 sm:p-9 shadow-xs flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider bg-[#F2ECE1] text-slate-700 px-3 py-1 rounded-full font-mono">
                  Em Desenvolvimento
                </span>
                <span className="text-xs text-slate-500 font-mono">Para Times</span>
              </div>

              <div>
                <h3 className="font-['Outfit'] font-bold text-2xl text-slate-900">Plano Estúdio</h3>
                <p className="text-xs text-slate-600 mt-1">Para agências e projetos colaborativos em equipe.</p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-black font-['Outfit'] text-slate-900">Pro</span>
                  <span className="text-xs text-slate-500 font-mono">/ novidades em breve</span>
                </div>
              </div>

              <div className="space-y-3 pt-5 border-t border-[#EAE3D6] text-xs sm:text-sm text-slate-600 font-['Inter']">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#4355DB] shrink-0" />
                  <span>Tudo incluído no Plano Pessoal</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#4355DB] shrink-0" />
                  <span>Exportação de moodboards em alta definição</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#4355DB] shrink-0" />
                  <span>Links compartilháveis com clientes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#4355DB] shrink-0" />
                  <span>Biblioteca visual compartilhada em equipe</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3.5 text-center text-sm font-semibold text-slate-900 bg-[#EFE9DF] hover:bg-[#E5DFD5] border border-[#DDD5C8] rounded-full transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Avisar Quando Estiver Pronto</span>
                <Sparkles className="w-4 h-4 text-[#4355DB]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
