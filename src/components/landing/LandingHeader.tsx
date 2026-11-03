import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Logo } from '../ui/Logo';

interface LandingHeaderProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isLoggedIn?: boolean;
  onGoToApp?: () => void;
  onEnterGuestMode?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onOpenAuth,
  isLoggedIn = false,
  onGoToApp,
  onEnterGuestMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const lenis = (window as any).lenis;
    if (id === 'inicio') {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      if (lenis) {
        lenis.scrollTo(element, { offset: -90, duration: 1.2 });
      } else {
        const topOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - topOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (isLoggedIn && onGoToApp) {
      onGoToApp();
      return;
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('preview', 'workspace');
      window.location.search = params.toString();
    }
  };

  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
      <div
        className={`glass-card pointer-events-auto flex items-center justify-between gap-2 sm:gap-6 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] max-w-4xl w-full border border-[#E5DFD5] transition-all duration-300 ${
          scrolled ? 'shadow-lg bg-white/95' : 'bg-[#FAF7F2]/90'
        }`}
      >
        {/* Brand Logo */}
        <a
          href="#"
          onClick={(e) => scrollToSection(e, 'inicio')}
          className="flex items-center gap-2 sm:gap-2.5 text-decoration-none group shrink-0"
          aria-label="Salvei - Página Inicial"
        >
          <Logo size={22} className="sm:hidden" />
          <Logo size={26} className="hidden sm:inline-flex" />
        </a>

        {/* Quick Nav Links (Desktop) - Clean & Minimal (3 essential links) */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-slate-600 shrink-0">
          <a
            href="#como-funciona"
            onClick={(e) => scrollToSection(e, 'como-funciona')}
            className="hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Como Funciona
          </a>
          <a
            href="#recursos"
            onClick={(e) => scrollToSection(e, 'recursos')}
            className="hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Recursos
          </a>
          <a
            href="#faq"
            onClick={(e) => scrollToSection(e, 'faq')}
            className="hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons - Distinctive, Clean & Grouped */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {isLoggedIn ? (
            <button
              onClick={() => onGoToApp && onGoToApp()}
              className="bg-[#0F172A] hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Ir para o App</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : (
            <>
              {onEnterGuestMode && (
                <button
                  type="button"
                  onClick={onEnterGuestMode}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-slate-950 px-3 py-1.5 rounded-full border border-[#DFD8CC] bg-white/90 hover:bg-white transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs hover:shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Testar sem cadastro</span>
                </button>
              )}

              <div className="hidden sm:block w-px h-3.5 bg-[#E5DFD5] mx-0.5 shrink-0" />

              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:inline-block text-xs font-medium text-slate-600 hover:text-slate-950 px-2 sm:px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Entrar
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="bg-[#0F172A] hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold px-3 sm:px-4.5 py-1.5 sm:py-2.5 rounded-full transition-all shadow-xs flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Criar Conta</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-700 hover:text-slate-950 p-1.5 rounded-lg focus-visible:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-card pointer-events-auto absolute top-16 inset-x-4 p-5 rounded-2xl shadow-xl border border-[#E5DFD5] flex flex-col gap-3 animate-in fade-in duration-200 bg-white/98">
          <a
            href="#como-funciona"
            onClick={(e) => scrollToSection(e, 'como-funciona')}
            className="text-sm font-medium text-slate-700 hover:text-slate-950 py-1.5"
          >
            Como Funciona
          </a>
          <a
            href="#recursos"
            onClick={(e) => scrollToSection(e, 'recursos')}
            className="text-sm font-medium text-slate-700 hover:text-slate-950 py-1.5"
          >
            Recursos
          </a>
          <a
            href="#faq"
            onClick={(e) => scrollToSection(e, 'faq')}
            className="text-sm font-medium text-slate-700 hover:text-slate-950 py-1.5"
          >
            Perguntas Frequentes
          </a>
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGoToApp && onGoToApp();
                }}
                className="w-full bg-[#0F172A] text-white text-xs font-semibold py-2.5 rounded-full"
              >
                Ir para o App
              </button>
            ) : (
              <>
                {onEnterGuestMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onEnterGuestMode();
                    }}
                    className="w-full text-center text-xs font-semibold text-[#4355DB] py-2.5 rounded-full border border-[#4355DB]/30 bg-[#4355DB]/5"
                  >
                    Testar sem cadastro (Modo Convidado)
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full text-center text-xs font-semibold text-slate-700 py-2.5 rounded-full border border-slate-200"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="w-full bg-[#0F172A] text-white text-xs font-semibold py-2.5 rounded-full"
                >
                  Criar Conta
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
