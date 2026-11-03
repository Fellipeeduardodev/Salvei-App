import React from 'react';
import { Check } from 'lucide-react';

export const LandingFeatures: React.FC = () => {
  return (
    <section id="recursos" className="py-20 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto scroll-mt-20">
      <div id="como-funciona" className="scroll-mt-20" />
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#4355DB] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Fluxo Simplificado
        </span>
        <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-950 mt-4 mb-3">
          Tudo o que você precisa. Nada de excesso.
        </h2>
        <p className="font-['Inter'] text-slate-600 text-sm sm:text-base leading-relaxed">
          Substitua dezenas de pastas perdidas e abas esquecidas por um espaço de trabalho organizado e visualmente estimulante.
        </p>
      </div>

      {/* 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pilar 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-8 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#4355DB] flex items-center justify-center mb-6 font-['Outfit'] font-bold text-lg border border-blue-100/60">
            01
          </div>
          <h3 className="font-['Outfit'] font-bold text-xl text-slate-950 mb-3 tracking-tight">
            Captura em 1 Clique
          </h3>
          <p className="font-['Inter'] text-slate-600 text-sm leading-relaxed mb-6">
            Cole uma URL ou arraste uma imagem. O Salvei busca o título, gera o screenshot de alta fidelidade e captura o favicon instantaneamente.
          </p>
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500 font-mono">
            <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span>Metadados automáticos</span>
          </div>
        </div>

        {/* Pilar 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-8 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 font-['Outfit'] font-bold text-lg border border-indigo-100/60">
            02
          </div>
          <h3 className="font-['Outfit'] font-bold text-xl text-slate-950 mb-3 tracking-tight">
            Projetos & Moodboards
          </h3>
          <p className="font-['Inter'] text-slate-600 text-sm leading-relaxed mb-6">
            Conecte referências a projetos de clientes ou coleções temáticas permanentes. Alterne entre visualização em alvenaria e grade compacta.
          </p>
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500 font-mono">
            <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span>Filtros instantâneos por tags</span>
          </div>
        </div>

        {/* Pilar 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-8 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 font-['Outfit'] font-bold text-lg border border-purple-100/60">
            03
          </div>
          <h3 className="font-['Outfit'] font-bold text-xl text-slate-950 mb-3 tracking-tight">
            Extração & Inspeção
          </h3>
          <p className="font-['Inter'] text-slate-600 text-sm leading-relaxed mb-6">
            Abra o painel lateral para copiar códigos hexadecimais da paleta de cores, anotar aprendizados de UX em Markdown e abrir o link original.
          </p>
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500 font-mono">
            <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span>Paletas prontas para o Figma</span>
          </div>
        </div>

      </div>
    </section>
  );
};
