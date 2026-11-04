import React from 'react';
import { Smartphone, Zap, Cloud } from 'lucide-react';

export const LandingMobileShowcase: React.FC = () => {
  return (
    <section id="mobile" className="py-24 sm:py-32 bg-[#F5F2EB] border-b border-[#E5DFD5] px-4 sm:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Text & Values */}
          <div className="lg:col-span-6 text-left space-y-6 gsap-mobile-left">
            <span className="font-mono text-xs uppercase tracking-wider text-[#4355DB] font-semibold block mb-2">
              Em Qualquer Lugar
            </span>
            <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl lg:text-6xl text-[#141414] tracking-[-0.035em] leading-[1.05]">
              A inspiração não avisa quando vai aparecer.
            </h2>

            <p className="font-['Inter'] text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Viu um site incrível ou uma fotografia marcante enquanto tomava um café? Salve no navegador do celular em segundos. Quando você abrir o computador no estúdio, tudo já estará catalogado.
            </p>

            <div className="space-y-4 pt-2 font-['Inter']">
              <div className="p-4 rounded-2xl bg-white border border-[#DFD8CC] shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-[#4355DB]">01</span>
                  <h3 className="font-['Outfit'] text-sm font-bold text-slate-900">
                    Captura direta pelo navegador móvel
                  </h3>
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Basta colar a URL no Safari ou Chrome do smartphone. O Salvei gera o card e extrai as cores na hora.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#DFD8CC] shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-[#4355DB]">02</span>
                  <h3 className="font-['Outfit'] text-sm font-bold text-slate-900">
                    Sem aplicativos pesados consumindo memória
                  </h3>
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Aplicação web rápida e responsiva que abre instantaneamente como um PWA leve.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#DFD8CC] shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-[#4355DB]">03</span>
                  <h3 className="font-['Outfit'] text-sm font-bold text-slate-900">
                    Sincronização imediata com sua mesa de trabalho
                  </h3>
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  Suas coleções, notas e tags ficam sempre sincronizadas entre todos os seus dispositivos.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Real Editorial iPhone Photograph */}
          <div className="lg:col-span-6 flex justify-center gsap-mobile-right">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(25,20,15,0.14)] border border-[#DDD5C8] bg-white">
              <img
                src="/brand/mobile-showcase.webp"
                alt="Designer usando o Salvei no celular ao lado de livros de design"
                className="w-full h-auto object-cover block"
                loading="lazy" decoding="async" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
