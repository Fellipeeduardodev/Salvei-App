import React from 'react';
import { Logo } from '../ui/Logo';

interface LandingFooterProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onDemoClick?: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenAuth, onDemoClick }) => {
  const handleLaunchDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDemoClick) {
      onDemoClick();
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('preview', 'workspace');
      window.location.search = params.toString();
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="pt-16 pb-12 px-4 sm:px-8 border-t border-[#E5DFD5] bg-[#FAF7F2] text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Tier: Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#EAE3D6]">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <Logo size={26} />

            <p className="font-['Inter'] text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
              O santuário visual para designers, desenvolvedores e diretores de arte guardarem, organizarem e reencontrarem referências na web.
            </p>

            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#4355DB] bg-white px-3 py-1 rounded-full border border-[#DFD8CC]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistemas operacionais • v0.3</span>
            </div>
          </div>

          {/* Links (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-left">
            <div className="space-y-3">
              <h4 className="font-['Outfit'] font-bold text-slate-900 text-xs uppercase tracking-wider">
                Navegação
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors cursor-pointer">
                    Início
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('comparativo')} className="hover:text-slate-900 transition-colors cursor-pointer">
                    Comparativo
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('como-funciona')} className="hover:text-slate-900 transition-colors cursor-pointer">
                    Como Funciona
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('recursos')} className="hover:text-slate-900 transition-colors cursor-pointer">
                    Recursos
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('precos')} className="hover:text-slate-900 transition-colors cursor-pointer">
                    Preços
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('faq')} className="hover:text-slate-900 transition-colors cursor-pointer">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-['Outfit'] font-bold text-slate-900 text-xs uppercase tracking-wider">
                Acesso
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => onOpenAuth('login')} className="hover:text-slate-900 transition-colors cursor-pointer">
                    Entrar na Conta
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenAuth('signup')} className="hover:text-slate-900 transition-colors cursor-pointer">
                    Criar Conta Gratuita
                  </button>
                </li>
                <li>
                  <a href="#demo" onClick={handleLaunchDemo} className="hover:text-slate-900 transition-colors cursor-pointer">
                    Demonstração ao Vivo
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-['Outfit'] font-bold text-slate-900 text-xs uppercase tracking-wider">
                Recursos
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="text-slate-600">Captura em 1 Clique</li>
                <li className="text-slate-600">Extração de Paletas HEX</li>
                <li className="text-slate-600">Busca com Teclado ⌘K</li>
                <li className="text-slate-600">Projetos & Moodboards</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Tier: Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-400">
          <p>© 2026 Salvei — Workspace de Referências Web. Feito para quem cria no seu próprio tempo.</p>
        </div>

      </div>
    </footer>
  );
};
