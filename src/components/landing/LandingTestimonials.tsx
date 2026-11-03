import React from 'react';
import { Quote, CheckCircle2, MessageSquareHeart } from 'lucide-react';

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarBg: string;
  avatarInitials: string;
  quote: string;
  highlightMetric: string;
}

export const LandingTestimonials: React.FC = () => {
  const testimonials: TestimonialItem[] = [
    {
      id: 'lucas',
      name: 'Lucas Menezes',
      role: 'Lead Product Designer',
      company: 'Ex-Nubank • Studio Paralelo',
      avatarBg: 'bg-[#4355DB] text-white',
      avatarInitials: 'LM',
      quote:
        'Eu tinha mais de 70 abas abertas no Chrome só de referências que eu não podia fechar por medo de esquecer. O Salvei virou meu ateliê diário: salvo com Ctrl+V, o HEX já vem pronto pro Figma e meu Mac finalmente respira em paz.',
      highlightMetric: '⌘ 480+ referências salvas',
    },
    {
      id: 'camila',
      name: 'Camila Duarte',
      role: 'Senior Frontend Engineer',
      company: 'SaaS Creator & Design Systems',
      avatarBg: 'bg-emerald-600 text-white',
      avatarInitials: 'CD',
      quote:
        'O que me conquistou foi a busca instantânea com ⌘K e a fidelidade das capturas. Não preciso abrir DevTools pra catar código de cor nem inspecionar tipografia. É o software mais rápido e sem atrito do meu fluxo diário.',
      highlightMetric: '⚡ Busca em menos de 35ms',
    },
    {
      id: 'rafael',
      name: 'Rafael Siqueira',
      role: 'Diretor de Arte & Branding',
      company: 'Estúdio Raiz Visual',
      avatarBg: 'bg-amber-600 text-white',
      avatarInitials: 'RS',
      quote:
        'Montar moodboards pra reuniões de alinhamento com clientes era um parto com prints desorganizados na Área de Trabalho. Agora crio uma coleção temática no Salvei e apresento na hora. Transmite um profissionalismo absurdo.',
      highlightMetric: '📁 24 moodboards criados',
    },
  ];

  return (
    <section id="depoimentos" className="py-24 sm:py-32 bg-[#FAF7F2] border-b border-[#E5DFD5] px-4 sm:px-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-14 sm:mb-20 text-left">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#4355DB] font-semibold bg-[#4355DB]/10 px-3 py-1 rounded-full border border-[#4355DB]/20 mb-3.5">
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>Quem Usa Aprova</span>
          </div>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl lg:text-6xl text-[#141414] tracking-[-0.035em] leading-[1.03] mb-4">
            O fim das abas acumuladas e dos prints esquecidos na Mesa.
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Veja como designers de produto, engenheiros e diretores de arte organizam seus repertórios visuais sem perder tempo.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-7 sm:p-8 border border-[#DFD8CC] shadow-2xs flex flex-col justify-between text-left"
            >
              <div>
                {/* Quote Icon & Metric */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#4355DB]">
                    <Quote className="w-4 h-4 fill-current opacity-80" />
                  </div>
                  <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F2] text-slate-700 border border-[#E5DFD5]">
                    {t.highlightMetric}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="font-['Inter'] text-sm sm:text-base text-slate-700 leading-relaxed mb-6 font-normal">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-5 border-t border-[#F0EBE1] flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-['Outfit'] font-bold text-sm shrink-0 ${t.avatarBg}`}>
                  {t.avatarInitials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-['Outfit'] font-bold text-sm text-[#141414] truncate">
                      {t.name}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="font-['Inter'] text-xs text-slate-500 truncate">
                    {t.role}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 truncate">
                    {t.company}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
