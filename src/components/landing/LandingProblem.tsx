import React from 'react';
import { X, Check, Globe, FolderGit2, AlertTriangle, Layers, ArrowRight } from 'lucide-react';

export const LandingProblem: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-[#15171C] border-y border-[#E7E7E5] dark:border-[#2D3139]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16">
          <span className="font-['JetBrains_Mono'] text-xs font-semibold tracking-wider text-[#EF4444] uppercase block mb-3">
            O Problema Que Resolvemos
          </span>
          <h2 className="font-['Outfit'] font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#171717] dark:text-white leading-tight mb-5">
            Suas referências criativas estão dispersas.
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-[#737373] dark:text-[#9CA3AF] leading-relaxed">
            Abas acumuladas que deixam o navegador lento, capturas de tela anônimas perdidas na pasta Downloads, links esquecidos em conversas de chat e documentos de texto sem qualquer prévia visual.
          </p>
        </div>

        {/* 3 Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Abas Infinitas */}
          <div className="rounded-xl border border-[#E7E7E5] dark:border-[#2D3139] bg-[#F8F8F6] dark:bg-[#191B20] p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-base mb-6">
                ✕
              </div>
              <h3 className="font-['Outfit'] font-bold text-xl text-[#171717] dark:text-white mb-2.5">
                Abas Infinitas
              </h3>
              <p className="font-['Inter'] text-sm text-[#737373] dark:text-[#9CA3AF] leading-relaxed mb-6">
                Você abre 40 abas ao pesquisar um projeto. Dias depois, fecha tudo por consumo excessivo de memória e perde o fio da meada.
              </p>
            </div>

            {/* Visual Sketch */}
            <div className="bg-white dark:bg-[#111214] border border-[#E7E7E5] dark:border-[#2D3139] rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="px-2 py-0.5 text-[10px] font-['JetBrains_Mono'] bg-red-50 text-red-600 dark:bg-red-950/30 rounded truncate">
                  tab_01...
                </span>
                <span className="px-2 py-0.5 text-[10px] font-['JetBrains_Mono'] bg-red-50 text-red-600 dark:bg-red-950/30 rounded truncate">
                  tab_02...
                </span>
                <span className="px-2 py-0.5 text-[10px] font-['JetBrains_Mono'] bg-red-50 text-red-600 dark:bg-red-950/30 rounded truncate">
                  +38 abas
                </span>
              </div>
              <div className="text-[11px] font-['JetBrains_Mono'] text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Memória sobrecarregada
              </div>
            </div>
          </div>

          {/* Card 2: Prints Sem Contexto */}
          <div className="rounded-xl border border-[#E7E7E5] dark:border-[#2D3139] bg-[#F8F8F6] dark:bg-[#191B20] p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-base mb-6">
                ✕
              </div>
              <h3 className="font-['Outfit'] font-bold text-xl text-[#171717] dark:text-white mb-2.5">
                Prints Sem Contexto
              </h3>
              <p className="font-['Inter'] text-sm text-[#737373] dark:text-[#9CA3AF] leading-relaxed mb-6">
                Capturas com nomes como <code className="text-xs bg-[#E8E8E4] dark:bg-[#20232A] px-1 py-0.5 rounded">Screenshot_2026.png</code>. Sem a URL de origem, sem tags e sem anotações do porquê foram salvas.
              </p>
            </div>

            {/* Visual Sketch */}
            <div className="bg-white dark:bg-[#111214] border border-[#E7E7E5] dark:border-[#2D3139] rounded-lg p-3 space-y-1.5">
              <div className="text-xs font-['JetBrains_Mono'] text-[#737373] dark:text-[#9CA3AF] truncate">
                📄 Screenshot_2026-10-21.png
              </div>
              <div className="text-[11px] font-['JetBrains_Mono'] text-red-500">
                Origem desconhecida • Sem tags
              </div>
            </div>
          </div>

          {/* Card 3: A Solução Salvei */}
          <div className="rounded-xl border-2 border-[#4355DB] bg-[#F8F8F6] dark:bg-[#191B20] p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#4355DB]/10 text-[#4355DB] flex items-center justify-center font-bold text-base mb-6">
                <Check className="w-5 h-5 text-[#4355DB]" />
              </div>
              <h3 className="font-['Outfit'] font-bold text-xl text-[#171717] dark:text-white mb-2.5">
                A Resposta Salvei
              </h3>
              <p className="font-['Inter'] text-sm text-[#737373] dark:text-[#9CA3AF] leading-relaxed mb-6">
                Um ateliê digital privado. Cole o link ou print e o Salvei cataloga o screenshot de alta resolução, título, domínio, paleta e suas anotações.
              </p>
            </div>

            {/* Visual Sketch */}
            <div className="bg-white dark:bg-[#111214] border border-[#4355DB]/40 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-['Outfit'] font-bold text-[#171717] dark:text-white">
                <span>Linear Workspace UI</span>
                <span className="w-2 h-2 rounded-full bg-[#4355DB]" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-['JetBrains_Mono'] text-[#4355DB]">
                <span className="bg-[#4355DB]/10 px-1.5 py-0.5 rounded">linear.app</span>
                <span className="bg-[#4355DB]/10 px-1.5 py-0.5 rounded">#dark-mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
