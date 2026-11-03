import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Copy, ExternalLink, Globe, RefreshCw } from 'lucide-react';

interface ExtractedPreset {
  url: string;
  domain: string;
  title: string;
  palette: string[];
  tags: string[];
  accentColor: string;
  previewGradient: string;
}

export const LandingLiveExtractor: React.FC<{ onOpenAuth: (mode: 'login' | 'signup') => void }> = ({ onOpenAuth }) => {
  const presets: Record<string, ExtractedPreset> = {
    'linear.app': {
      url: 'https://linear.app',
      domain: 'linear.app',
      title: 'Linear — The issue tracker you will actually enjoy using',
      palette: ['#0D0E15', '#5E6AD2', '#8F9BFF', '#F7F8F8'],
      tags: ['#interface', '#dark-mode', '#tokens'],
      accentColor: '#5E6AD2',
      previewGradient: 'from-[#0D0E15] via-[#1A1C29] to-[#0D0E15]',
    },
    'stripe.com': {
      url: 'https://stripe.com',
      domain: 'stripe.com',
      title: 'Stripe — Financial infrastructure for the internet',
      palette: ['#0A2540', '#635BFF', '#00D4AA', '#F6F9FC'],
      tags: ['#fintech', '#minimalismo', '#saas'],
      accentColor: '#635BFF',
      previewGradient: 'from-[#0A2540] via-[#1A3B66] to-[#0A2540]',
    },
    'github.com': {
      url: 'https://github.com',
      domain: 'github.com',
      title: 'GitHub — Where the world builds software',
      palette: ['#0D1117', '#238636', '#58A6FF', '#F0F6FC'],
      tags: ['#developer', '#dark-mode', '#interface'],
      accentColor: '#238636',
      previewGradient: 'from-[#0D1117] via-[#161B22] to-[#0D1117]',
    },
    'apple.com': {
      url: 'https://apple.com',
      domain: 'apple.com',
      title: 'Apple — Think Different. Hardware & Industrial UI',
      palette: ['#000000', '#1D1D1F', '#0071E3', '#F5F5F7'],
      tags: ['#hardware', '#design-system', '#minimal'],
      accentColor: '#0071E3',
      previewGradient: 'from-[#1D1D1F] via-[#2D2D30] to-[#1D1D1F]',
    },
    'figma.com': {
      url: 'https://figma.com',
      domain: 'figma.com',
      title: 'Figma — How modern teams design together',
      palette: ['#1E1E1E', '#F24E1E', '#A259FF', '#0ACF83'],
      tags: ['#design-tool', '#vector', '#branding'],
      accentColor: '#F24E1E',
      previewGradient: 'from-[#1E1E1E] via-[#2C2C2C] to-[#1E1E1E]',
    },
  };

  const [inputUrl, setInputUrl] = useState<string>('linear.app');
  const [activePreset, setActivePreset] = useState<ExtractedPreset>(presets['linear.app']);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleExtract = (urlToExtract: string) => {
    setIsExtracting(true);
    const cleaned = urlToExtract.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    setTimeout(() => {
      if (presets[cleaned]) {
        setActivePreset(presets[cleaned]);
      } else {
        // Fallback dynamic extraction for custom domains
        setActivePreset({
          url: `https://${cleaned}`,
          domain: cleaned,
          title: `${cleaned.split('.')[0]?.toUpperCase() || 'Website'} — Referência visual catalogada`,
          palette: ['#12151E', '#4355DB', '#38BDF8', '#F8FAFC'],
          tags: ['#web', '#curadoria', '#tokens'],
          accentColor: '#4355DB',
          previewGradient: 'from-[#12151E] via-[#1E2438] to-[#12151E]',
        });
      }
      setIsExtracting(false);
    }, 450);
  };

  const handleSelectPreset = (key: string) => {
    setInputUrl(key);
    handleExtract(key);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <section id="extrator" className="py-24 sm:py-32 bg-[#FAF7F2] dark:bg-[#090A0F] border-b border-[#E5DFD5] dark:border-slate-850 px-4 sm:px-8 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#4355DB] dark:text-[#8F9BFF] font-semibold bg-[#4355DB]/10 dark:bg-[#4355DB]/20 px-3.5 py-1 rounded-full border border-[#4355DB]/20 mb-3.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extrator de Cores & Tokens ao Vivo</span>
          </div>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl text-[#141414] dark:text-white tracking-[-0.035em] leading-[1.05] mb-4">
            Experimente agora com qualquer site.
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            Veja como o Salvei extrai metadados essenciais, favicon e paleta de cores HEX em menos de um segundo.
          </p>
        </div>

        {/* Live Input Bar */}
        <div className="bg-white dark:bg-[#141824] rounded-2xl p-3 sm:p-4 border border-[#DFD8CC] dark:border-slate-850 shadow-md mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExtract(inputUrl);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1 flex items-center">
              <span className="font-mono text-xs text-slate-400 pl-3 select-none">https://</span>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="ex: linear.app ou stripe.com"
                className="w-full pl-1 pr-3 py-2 text-sm font-['Inter'] text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isExtracting}
              className="bg-[#0F172A] hover:bg-slate-800 dark:bg-[#4355DB] dark:hover:bg-[#3644B3] active:scale-[0.98] text-white font-['Outfit'] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analisando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#93C5FD]" />
                  <span>Extrair Referência</span>
                </>
              )}
            </button>
          </form>

          {/* Quick presets */}
          <div className="pt-3 mt-3 border-t border-[#F0EBE1] dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-[11px] text-slate-400">Sugestões rápidas:</span>
            {Object.keys(presets).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`font-mono text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  inputUrl === key
                    ? 'bg-[#4355DB] text-white font-bold'
                    : 'bg-[#FAF7F2] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#EAE3D6] dark:hover:bg-slate-700'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Result Card */}
        <div className="bg-white dark:bg-[#141824] rounded-3xl border border-[#DFD8CC] dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Visual Preview (5 cols) */}
            <div className={`md:col-span-5 h-44 sm:h-52 rounded-2xl bg-gradient-to-br ${activePreset.previewGradient} p-5 flex flex-col justify-between text-white relative overflow-hidden border border-white/10 shadow-inner`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10">
                  {activePreset.domain}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div>
                <p className="font-['Outfit'] font-bold text-sm leading-snug line-clamp-2">
                  {activePreset.title}
                </p>
                <span className="font-mono text-[10px] text-slate-400 mt-1 block">
                  Captura de alta fidelidade
                </span>
              </div>
            </div>

            {/* Extracted Metadata & Palette (7 cols) */}
            <div className="md:col-span-7 space-y-5 text-left">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Globe className="w-4 h-4 text-[#4355DB] dark:text-[#8F9BFF]" />
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {activePreset.domain}
                  </span>
                </div>
                <h3 className="font-['Outfit'] font-bold text-lg sm:text-xl text-[#141414] dark:text-white leading-tight">
                  {activePreset.title}
                </h3>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {activePreset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-[#FAF7F2] dark:bg-slate-800 px-2.5 py-0.5 rounded border border-[#E5DFD5] dark:border-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* HEX Colors with 1-click copy */}
              <div className="pt-4 border-t border-[#F0EBE1] dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    Paleta de Cores HEX (1 toque p/ copiar)
                  </span>
                  <span className="font-mono text-[11px] text-[#4355DB] dark:text-[#8F9BFF]">
                    {copiedHex ? `Copiado: ${copiedHex}` : 'Pronto para o Figma'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activePreset.palette.map((hex) => {
                    const isCopied = copiedHex === hex;
                    return (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => handleCopyHex(hex)}
                        className="group flex items-center gap-2 p-2 rounded-xl border border-[#E5DFD5] dark:border-slate-700 hover:border-[#4355DB] dark:hover:border-[#8F9BFF] bg-[#FAF7F2] dark:bg-slate-800/80 transition-all cursor-pointer text-left"
                      >
                        <span
                          className="w-5 h-5 rounded-lg border border-black/10 shrink-0 shadow-2xs group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: hex }}
                        />
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {hex}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400 block">
                            {isCopied ? '✓ Copiado' : 'Copiar'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
