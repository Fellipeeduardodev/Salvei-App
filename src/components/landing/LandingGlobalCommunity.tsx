import React from 'react';

export const LandingGlobalCommunity: React.FC = () => {
  return (
    <section id="comunidade" className="py-24 sm:py-32 bg-[#FAF7F2] border-b border-[#E5DFD5] scroll-mt-20 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto text-center">
        
        {/* Section Header: Pure Typography */}
        <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl lg:text-6xl text-[#141414] tracking-[-0.035em] leading-[1.05] mb-5">
          Criado para quem vive de criar
        </h2>

        <p className="font-['Inter'] text-base sm:text-lg text-slate-600 mb-14 max-w-2xl mx-auto leading-relaxed font-normal">
          De estúdios independentes a desenvolvedores solo, o Salvei é a casa de referências para quem valoriza repertório autêntico e velocidade.
        </p>

        {/* Real 3D World Map Specimen */}
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(25,20,15,0.12)] border border-[#DFD8CC] bg-white mb-12">
          <img
            src="/brand/global-creators-map.webp"
            alt="Rede de criadores ao redor do mundo utilizando Salvei"
            className="w-full h-auto object-cover block"
            loading="lazy" decoding="async" />
        </div>

        {/* 3 Real Use Cases (No fake testimonial personas) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left font-['Inter']">
          <div className="p-6 rounded-2xl bg-white border border-[#DFD8CC] shadow-2xs">
            <span className="font-mono text-xs font-semibold text-[#8C8275] block mb-2">
              01 // DIREÇÃO DE ARTE
            </span>
            <h4 className="font-['Outfit'] font-bold text-slate-900 text-base mb-2">
              Composição & Fotografia
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Guarde referências de luz, enquadramentos editoriais e tipografias impressas com fidelidade máxima de proporção e cor.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#DFD8CC] shadow-2xs">
            <span className="font-mono text-xs font-semibold text-[#8C8275] block mb-2">
              02 // PRODUTO DIGITAL
            </span>
            <h4 className="font-['Outfit'] font-bold text-slate-900 text-base mb-2">
              Design Systems & UI
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Catalogue estados de foco, animações sutis e microinterações de produtos modernos sem poluir os favoritos do navegador.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#DFD8CC] shadow-2xs">
            <span className="font-mono text-xs font-semibold text-[#8C8275] block mb-2">
              03 // ALINHAMENTO
            </span>
            <h4 className="font-['Outfit'] font-bold text-slate-900 text-base mb-2">
              Moodboards de Clientes
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Abra coleções temáticas diretamente durante reuniões de briefing para calibrar a direção visual antes de começar o layout.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
