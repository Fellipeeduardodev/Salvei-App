import React from 'react';

export const LandingIntegrations: React.FC = () => {
  const tools = [
    {
      name: 'Figma',
      badge: 'Copiar / Colar',
      icon: (
        <svg className="w-5 h-5 text-slate-900" viewBox="0 0 38 57" fill="currentColor">
          <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0zM0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0zM0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5zM0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5zM19 0h9.5a9.5 9.5 0 1 1 0 19H19V0z"/>
        </svg>
      ),
    },
    {
      name: 'Linear',
      badge: 'Design System',
      icon: (
        <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.5 19.5l17-17A10.5 10.5 0 0 0 2.5 19.5zm-1-2.5A10.5 10.5 0 0 0 17 22.5L1.5 7v10zm20.8-2.6A10.5 10.5 0 0 0 22.5 7L7 22.5a10.5 10.5 0 0 0 15.3-8.1zM7 1.5A10.5 10.5 0 0 0 1.5 7l15.5 15.5A10.5 10.5 0 0 0 7 1.5z"/>
        </svg>
      ),
    },
    {
      name: 'Notion',
      badge: 'Notas & Docs',
      icon: (
        <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.69c-.42-.326-.98-.7-2.053-.607L3.62 2.063c-.467.047-.56.327-.374.513zm.793 3.684v13.076c0 .746.42 1.026 1.213.98l14.473-.84c.793-.046.98-.56.98-1.166V6.634c0-.606-.327-.933-.886-.886l-14.893.886c-.606.047-.887.42-.887.958zm13.494.98c.047.373 0 .746-.373.793l-.84.14v8.863c-.466.28-.98.42-1.446.42-.793 0-1.12-.28-1.773-.98l-4.759-7.464v7.231l1.353.327s0 .746-.746.746l-3.313.187c-.046-.187 0-.606.327-.653l.886-.233V9.758l-1.073-.093c-.047-.373.14-.793.606-.84l3.64-.233 4.992 7.744V9.618l-1.12-.14c-.047-.42.187-.793.653-.84z"/>
        </svg>
      ),
    },
    {
      name: 'Raycast',
      badge: 'Atalho ⌘',
      icon: (
        <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.75 6.5h-3.5v7h3.5v-7zm0 9.25h-3.5v1.75h3.5v-1.75z"/>
        </svg>
      ),
    },
    {
      name: 'Dribbble & Web',
      badge: 'Captura Instantânea',
      icon: (
        <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm8.79 10.37c-.37-.03-2.61-.17-5.18.89-.18-.42-.37-.84-.57-1.25 3.32-1.39 4.67-3.15 4.82-3.36 1.09 1.12 1.8 2.58 1.93 4.22zm-3.69-5.74c-.16.2-1.45 1.85-4.66 3.16-1.54-2.81-3.23-5.2-3.39-5.42 1.48-.48 3.08-.66 4.75-.41 1.25.19 2.39.69 3.3 1.67zm-9.87.62c.16.22 1.86 2.61 3.4 5.43-2.31.74-4.89.84-7.46.77.72-2.73 2.15-4.88 4.06-6.2zm-5.07 8.35c.03.02 2.64.09 5.32-.73.34.72.65 1.46.92 2.19-3.08 1.88-5.79 1.77-5.99 1.76a9.92 9.92 0 0 1-.25-3.22zm2.08 5.09c.21 0 2.59.08 5.61-1.76.99 2.59 1.4 4.87 1.44 5.12a9.97 9.97 0 0 1-7.05-3.36zm9.23 2.94c-.05-.28-.48-2.52-1.51-5.11 2.37-1.02 4.41-.83 4.65-.8a9.97 9.97 0 0 1-3.14 5.91z"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-14 sm:py-16 border-y border-[#E5DFD5] bg-white/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h3 className="font-['Outfit'] font-bold text-xl sm:text-2xl text-slate-900 mb-2.5 tracking-tight">
          Projetado para quem cria no Figma, Linear, Notion e Raycast
        </h3>
        <p className="font-['Inter'] text-sm sm:text-base text-slate-600 mb-8 max-w-xl mx-auto">
          Capture referências da web com Ctrl+V ou arraste screenshots soltos com zero fricção.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="gsap-integrations-chip flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#DFD8CC] shadow-2xs select-none"
            >
              <div className="text-slate-800">
                {tool.icon}
              </div>
              <div className="text-left font-['Inter']">
                <span className="font-['Outfit'] font-bold text-xs sm:text-sm text-slate-900 block leading-tight">
                  {tool.name}
                </span>
                <span className="font-mono text-[10px] text-slate-500 block leading-tight">
                  {tool.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
