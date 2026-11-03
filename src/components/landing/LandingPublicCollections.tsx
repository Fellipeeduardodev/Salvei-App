import React, { useState } from 'react';
import { Share2, Copy, Check, ArrowRight, Globe, Lock, Shield } from 'lucide-react';

export const LandingPublicCollections: React.FC<{ onOpenAuth: (mode: 'login' | 'signup') => void }> = ({ onOpenAuth }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const sampleUrl = 'https://salvei.app/@beatriz/design-systems-2026';

  const handleCopy = () => {
    navigator.clipboard?.writeText(sampleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="compartilhamento" className="py-24 sm:py-32 bg-[#F5F2EB] dark:bg-[#0D0F18] border-b border-[#E5DFD5] dark:border-slate-850 px-4 sm:px-8 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
          
          {/* Left Column: Public Collections Visual (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-[#141824] rounded-3xl p-6 sm:p-8 border border-[#DFD8CC] dark:border-slate-800 shadow-md text-left">
            {/* Custom URL bar */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF7F2] dark:bg-slate-850 border border-[#E5DFD5] dark:border-slate-700 mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                  salvei.app/@beatriz/design-systems-2026
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="font-mono text-xs px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#DFD8CC] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {copied ? '✓ Copiado' : 'Copiar link'}
              </button>
            </div>

            {/* Collection Preview Header */}
            <div className="mb-6 pb-6 border-b border-[#F0EBE1] dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#4355DB] dark:text-[#8F9BFF] font-bold bg-[#4355DB]/10 px-2 py-0.5 rounded">
                  Página Pública
                </span>
                <span className="font-mono text-[11px] text-slate-400">18 referências</span>
              </div>
              <h3 className="font-['Outfit'] font-black text-xl text-slate-900 dark:text-white mb-1">
                Design Systems & Microinterações
              </h3>
              <p className="font-['Inter'] text-xs text-slate-500 dark:text-slate-400">
                Curadoria aberta por Beatriz Mendes • Para o time de produto e clientes
              </p>
            </div>

            {/* Micro Gallery Grid in Preview */}
            <div className="grid grid-cols-3 gap-3">
              {['Linear UI', 'Stripe Press', 'Raycast Hub'].map((name, idx) => (
                <div key={name} className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-850 border border-[#E5DFD5] dark:border-slate-700/80">
                  <div className={`h-16 rounded-lg mb-2 ${
                    idx === 0 ? 'bg-indigo-900' : idx === 1 ? 'bg-amber-800' : 'bg-slate-900'
                  }`} />
                  <span className="font-['Outfit'] font-bold text-[11px] text-slate-800 dark:text-slate-200 block truncate">
                    {name}
                  </span>
                </div>
              ))}
            </div>

            {/* Privacy toggle badge */}
            <div className="mt-6 pt-4 border-t border-[#F0EBE1] dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Privado por padrão. Público só quando você quiser.</span>
              </span>
            </div>
          </div>

          {/* Right Column: Text & Pitch (6 cols) */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#4355DB] dark:text-[#8F9BFF] font-semibold bg-[#4355DB]/10 dark:bg-[#4355DB]/20 px-3 py-1 rounded-full border border-[#4355DB]/20 mb-3.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Acervos Públicos & Clientes</span>
            </div>

            <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl text-[#141414] dark:text-white tracking-[-0.035em] leading-[1.05] mb-5">
              Apresente seu repertório com links limpos e autorais.
            </h2>

            <p className="font-['Inter'] text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed mb-8">
              Transforme qualquer coleção em uma página pública cinematográfica com seu slug personalizado. Ideal para reuniões de alinhamento visual com clientes ou para compartilhar na sua bio.
            </p>

            <div className="space-y-3.5 mb-8 font-['Inter'] text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4355DB]" />
                <span>Clientes visualizam o moodboard sem precisar criar conta.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4355DB]" />
                <span>Links protegidos por senha opcional para projetos confidenciais.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4355DB]" />
                <span>Exportação limpa em PDF ou imagem para apresentações de pitch.</span>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth('signup')}
              className="bg-[#0F172A] hover:bg-slate-800 dark:bg-[#4355DB] dark:hover:bg-[#3644B3] active:scale-[0.98] text-white font-['Outfit'] font-bold text-sm py-3 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Criar minha primeira coleção pública</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
