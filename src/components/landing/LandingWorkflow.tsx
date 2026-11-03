import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, Palette, Command, Check, Copy, ArrowRight, Layers, LayoutGrid } from 'lucide-react';

export const LandingWorkflow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const steps = [
    {
      id: 'step-01',
      num: '01',
      badge: 'PASSO 01 — CAPTURA',
      title: 'Cole a URL ou solte uma imagem',
      desc: 'Sem formulários manuais. O Salvei gera screenshot em alta definição, captura o favicon original e salva o título da página em menos de um segundo.',
      tag: 'Cole com Ctrl+V direto na tela',
    },
    {
      id: 'step-02',
      num: '02',
      badge: 'PASSO 02 — CORES & TAGS',
      title: 'Extração automática de cores e etiquetas',
      desc: 'Identificação imediata das 4 cores principais da referência com código HEX para copiar, além de sugestão automática de etiquetas para manter tudo organizado.',
      tag: 'Paleta de cores instantânea',
    },
    {
      id: 'step-03',
      num: '03',
      badge: 'PASSO 03 — ACERVO',
      title: 'Localize qualquer ideia em segundos',
      desc: 'Abra a busca com ⌘K sem tirar as mãos do teclado. Encontre referências por cor, etiqueta ou site mesmo meses após ter guardado.',
      tag: 'Busca relâmpago por teclado',
    },
  ];

  const handleCopyColor = (color: string) => {
    navigator.clipboard?.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const STEP_DURATION = 8000;

  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / STEP_DURATION) * 100);
      setProgress(currentProgress);
      if (elapsed >= STEP_DURATION) {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [activeStep, steps.length]);

  const handleSelectStep = (idx: number) => {
    setActiveStep(idx);
    setProgress(0);
  };

  return (
    <section id="como-funciona" className="py-16 sm:py-32 bg-[#FAF7F2] border-b border-[#E5DFD5] px-3.5 sm:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header: Pure Display Authority, No Eyebrows */}
        <div className="max-w-3xl mb-10 sm:mb-20 text-left">
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-5xl md:text-6xl lg:text-[64px] tracking-[-0.04em] text-[#141414] leading-[1.08] sm:leading-[1.01] mb-4 sm:mb-5 break-words">
            Da descoberta à sua biblioteca<br className="hidden sm:inline" />
            <span className="text-[#141414]"> em três passos simples.</span>
          </h2>
          <p className="font-['Inter'] text-sm sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
            Elimine etapas intermediárias e guarde ideias visuais na mesma velocidade em que você navega.
          </p>
        </div>

        {/* 2-Column Asymmetric Interactive Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Buildify-style Step Cards with Watermark Numbers */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.id}
                  onClick={() => handleSelectStep(idx)}
                  className={`gsap-workflow-step relative p-5 sm:p-8 rounded-2xl sm:rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden text-left ${
                    isActive
                      ? 'bg-white border-[#141414] shadow-md ring-1 ring-[#141414]/10'
                      : 'bg-white/60 hover:bg-white border-[#DFD8CC] hover:border-[#BFB6A6]'
                  }`}
                >
                  {/* Watermark Number in background (Buildify AI inspired) */}
                  <div
                    aria-hidden="true"
                    className={`absolute -right-2 -bottom-6 font-['Outfit'] font-black text-8xl sm:text-9xl select-none pointer-events-none transition-colors duration-300 ${
                      isActive ? 'text-[#141414]/[0.06]' : 'text-[#141414]/[0.02]'
                    }`}
                  >
                    {step.num}
                  </div>

                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                    <span
                      className={`font-mono text-[11px] sm:text-xs tracking-wider font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full ${
                        isActive
                          ? 'bg-[#141414] text-white'
                          : 'bg-[#EAE4D8] text-slate-700'
                      }`}
                    >
                      {step.badge}
                    </span>
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isActive ? 'text-[#4355DB]' : 'text-slate-400'
                      }`}
                    >
                      {isActive ? '● EM FOCO' : 'VER SIMULAÇÃO'}
                    </span>
                  </div>

                  <h3
                    className={`relative z-10 font-['Outfit'] font-bold text-xl sm:text-2xl mb-2.5 tracking-tight transition-colors ${
                      isActive ? 'text-[#141414]' : 'text-slate-700'
                    }`}
                  >
                    {step.title}
                  </h3>

                  <p className="relative z-10 font-['Inter'] text-sm text-slate-600 leading-relaxed font-normal mb-5">
                    {step.desc}
                  </p>

                  <div className="relative z-10 pt-4 border-t border-[#EAE3D6] font-mono text-xs flex items-center justify-between text-slate-500">
                    <span>{step.tag}</span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isActive
                          ? 'text-[#4355DB] translate-x-1'
                          : 'text-slate-400 opacity-60'
                      }`}
                    />
                  </div>

                  {/* Active Step Visual Progress Line */}
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#4355DB] transition-[width] duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Salvei Dynamic Stage (Linea sticky app stage style) */}
          <div className="lg:col-span-7 sticky top-28 gsap-workflow-stage">
            <div className="bg-[#141414] rounded-3xl p-4 sm:p-6 shadow-[0_25px_60px_-15px_rgba(20,20,20,0.35)] border border-slate-800 text-left">
              
              {/* Window Titlebar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="ml-3 font-mono text-xs text-slate-400">
                    Salvei // Workspace
                  </span>
                </div>
                <div className="font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Dynamic Stage Canvas based on activeStep */}
              <div className="bg-[#FAF7F2] rounded-2xl p-5 sm:p-8 min-h-[440px] flex flex-col justify-between transition-all duration-500 text-slate-900 border border-[#E5DFD5]">
                
                {/* STAGE 0: Fast URL Capture */}
                {activeStep === 0 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-[#4355DB]" />
                        <span className="font-['Outfit'] font-bold text-base text-slate-900">
                          Captura Inteligente por Link
                        </span>
                      </div>
                      <span className="font-mono text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded">
                        Captura automática
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs space-y-2">
                      <span className="text-xs font-mono text-slate-400 block">
                        Link colado:
                      </span>
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 font-mono text-xs text-slate-800">
                        <span className="text-[#4355DB] font-semibold">https://linear.app</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          ✓ Salvo na Caixa de Entrada
                        </span>
                      </div>
                    </div>

                    {/* Live Processing Preview Card */}
                    <div className="bg-white rounded-2xl border border-[#DFD8CC] p-4 shadow-sm flex items-center gap-4">
                      <div className="w-24 h-18 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-200 relative group">
                        <img
                          src="/brand/hero-variations/hero-01-floating-product.png"
                          alt="Linear Specimen"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-[#4355DB]" />
                          <h4 className="font-['Outfit'] font-bold text-base text-slate-900 truncate">
                            Linear Modern Product Workspace
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 truncate mb-2">
                          linear.app • Captura nítida 1920×1080
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                            #interface
                          </span>
                          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            #dark-mode
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#EFECE5] rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600 font-mono">
                      <span>✓ Metadados extraídos automaticamente</span>
                      <span className="text-slate-400">Ctrl+V pronto</span>
                    </div>
                  </div>
                )}

                {/* STAGE 1: Automatic Chromatic Extraction */}
                {activeStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
                      <div className="flex items-center gap-2.5">
                        <Palette className="w-4 h-4 text-[#4355DB]" />
                        <span className="font-['Outfit'] font-bold text-base text-slate-900">
                          Extração Cromática em Tempo Real
                        </span>
                      </div>
                      <span className="font-mono text-xs bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded font-bold">
                        4 Tons Dominantes
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Clique em qualquer amostra abaixo para copiar o código HEX diretamente para sua área de transferência:
                    </p>

                    {/* Interactive Swatches Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { hex: '#0B0F19', label: 'Primary Slate' },
                        { hex: '#5E6AD2', label: 'Brand Indigo' },
                        { hex: '#8E9AFF', label: 'Accent Lavender' },
                        { hex: '#F0F4FF', label: 'Canvas Light' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => handleCopyColor(c.hex)}
                          className="bg-white p-3 rounded-xl border border-[#DFD8CC] hover:border-[#141414] hover:shadow-md transition-all text-left group cursor-pointer"
                        >
                          <div
                            className="w-full h-14 rounded-lg mb-2 shadow-inner border border-black/10 flex items-center justify-center text-white"
                            style={{ backgroundColor: c.hex }}
                          >
                            {copiedColor === c.hex ? (
                              <Check className="w-4 h-4 bg-black/60 rounded-full p-0.5" />
                            ) : null}
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-900 block">
                            {c.hex}
                          </span>
                          <span className="text-xs text-slate-400 truncate block">
                            {copiedColor === c.hex ? '✓ Copiado!' : c.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="bg-white rounded-xl border border-[#DFD8CC] p-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono text-slate-500 font-medium">
                          Cores prontas para suas artes
                        </span>
                        <div className="font-mono text-xs text-slate-800">
                          Clique em qualquer tom para copiar o código HEX
                        </div>
                      </div>
                      <span className="text-xs font-mono text-[#4355DB] bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 font-semibold">
                        4 Cores Salvas
                      </span>
                    </div>
                  </div>
                )}

                {/* STAGE 2: ⌘K Instant Search & Retrieval */}
                {activeStep === 2 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
                      <div className="flex items-center gap-2.5">
                        <Command className="w-4 h-4 text-[#4355DB]" />
                        <span className="font-['Outfit'] font-bold text-base text-slate-900">
                          Busca Rápida por Teclado ⌘K
                        </span>
                      </div>
                      <span className="font-mono text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded font-bold">
                        Busca Instantânea
                      </span>
                    </div>

                    {/* Interactive Mock Command Palette */}
                    <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-4 space-y-3">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <Command className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-xs text-slate-900 font-semibold">
                          design system|
                        </span>
                        <span className="ml-auto font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          ESC para fechar
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="bg-[#4355DB] text-white p-3 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span className="font-semibold text-sm">
                              Design System & Componentes UI
                            </span>
                          </div>
                          <span className="font-mono text-xs opacity-80">linear.app</span>
                        </div>

                        <div className="p-3 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            <span className="font-medium">Swiss Graphic Poster Catalog</span>
                          </div>
                          <span className="font-mono text-xs text-slate-400">are.na</span>
                        </div>

                        <div className="p-3 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            <span className="font-medium">Minimalist Concrete Architecture</span>
                          </div>
                          <span className="font-mono text-xs text-slate-400">kinfolk.com</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#EFECE5] rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600 font-mono">
                      <span>Navegue com setas ↑ ↓ e pressione Enter</span>
                      <span className="text-[#4355DB] font-semibold">Atalho Universal</span>
                    </div>
                  </div>
                )}

                {/* Bottom Stage Controls */}
                <div className="pt-5 border-t border-[#DFD8CC] flex items-center justify-between text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-2">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveStep(i)}
                        className={`w-8 h-2 rounded-full transition-all cursor-pointer ${
                          activeStep === i ? 'bg-[#4355DB] w-12' : 'bg-slate-300'
                        }`}
                        aria-label={`Ver passo ${i + 1}`}
                      />
                    ))}
                  </div>
                  <span>Etapa {activeStep + 1} de 3</span>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};