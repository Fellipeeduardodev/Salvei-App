import React from 'react';
import { ArrowRight, Play, ShieldCheck, Zap, CreditCard } from 'lucide-react';

interface LandingCTAProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onDemoClick?: () => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onOpenAuth, onDemoClick }) => {
  const handleLaunchDemo = () => {
    if (onDemoClick) {
      onDemoClick();
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('preview', 'workspace');
      window.location.search = params.toString();
    }
  };

  return (
    <section className="py-16 sm:py-32 px-3.5 sm:px-8 max-w-7xl mx-auto">
      <div className="gsap-cta-card rounded-2xl sm:rounded-4xl bg-[#141414] p-6 sm:p-16 md:p-20 text-center text-white shadow-2xl relative overflow-hidden border border-slate-800">
        {/* Subtle Warm Prism Ambient Lighting */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[#4355DB]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#F06A38]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6 sm:space-y-7">
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-5xl md:text-6xl lg:text-[68px] text-white tracking-[-0.04em] leading-[1.08] sm:leading-[1.01] break-words">
            Pronto para dar um lar<br className="hidden sm:inline" />
            <span className="text-white"> às suas referências?</span>
          </h2>

          <p className="font-['Inter'] text-slate-300 text-sm sm:text-xl leading-relaxed max-w-2xl mx-auto font-normal">
            Crie sua conta em 1 minuto e tenha um espaço definitivo para guardar e reencontrar suas referências sem atrito.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 pt-2 sm:pt-4 w-full">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto bg-white hover:bg-slate-100 active:scale-[0.98] text-[#141414] font-semibold text-sm sm:text-base px-7 sm:px-10 py-3.5 sm:py-4 rounded-full transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-lg min-h-[48px]"
            >
              <span>Criar Minha Biblioteca Grátis</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white shrink-0" />
              <span>Testar sem Cadastro</span>
            </button>
          </div>

          {/* Trust Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Gratuito</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#93C5FD]" />
              <span>Acesso imediato no navegador</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>Sem cartão de crédito</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
