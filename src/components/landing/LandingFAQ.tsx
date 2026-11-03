import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const LandingFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'O Salvei é gratuito para usar?',
      answer: 'Sim. Você pode criar sua conta gratuita e começar a guardar e organizar suas referências imediatamente, sem necessidade de cartão de crédito e sem prazo de expiração.',
    },
    {
      question: 'Quais tipos de referências posso salvar?',
      answer: 'Qualquer URL da internet (sites de design, portfólios, artigos, landing pages) ou imagens soltas (PNG, JPG, WebP) arrastadas do seu computador ou coladas com Ctrl+V.',
    },
    {
      question: 'Minhas referências são privadas?',
      answer: 'Sim, 100% privadas por padrão. Suas coleções pertencem apenas a você e não são exibidas em feeds públicos ou compartilhadas sem sua autorização expressa.',
    },
    {
      question: 'Como funciona a extração de paleta de cores?',
      answer: 'Assim que você salva uma referência, o Salvei analisa as cores principais da imagem e gera 4 amostras com códigos HEX prontos para você copiar com um clique e usar nas suas criações.',
    },
    {
      question: 'Preciso instalar aplicativo ou extensão pesada?',
      answer: 'Não. O Salvei funciona direto no navegador do computador e do celular como um web app leve e veloz, sem consumir memória da sua máquina.',
    },
    {
      question: 'Posso importar meus favoritos antigos do Chrome, Safari ou Raindrop?',
      answer: 'Sim! O Salvei possui um importador universal de favoritos. Basta exportar seus links do navegador atual em formato bookmarks.html e soltar no app para catalogar tudo automaticamente em poucos segundos.',
    },
    {
      question: 'Como funciona a busca por teclado ⌘K?',
      answer: 'Basta pressionar ⌘K (ou Ctrl+K no Windows) em qualquer tela para abrir a paleta de comandos. Você pesquisa por título, domínio ou tags e salta direto para a referência em milissegundos.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-32 bg-[#FAF7F2] border-b border-[#E5DFD5] scroll-mt-20 px-3.5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Section Header: Pure Display Authority, No Eyebrows */}
        <div className="mb-10 sm:mb-20 text-left">
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-5xl md:text-6xl lg:text-[64px] text-[#141414] tracking-[-0.04em] leading-[1.08] sm:leading-[1.01] mb-3 sm:mb-4 break-words">
            Perguntas frequentes
          </h2>
          <p className="font-['Inter'] text-sm sm:text-lg text-slate-600 font-normal">
            Tudo o que você precisa saber sobre o fluxo de curadoria do Salvei.
          </p>
        </div>

        {/* Clean Accordion List with Buildify Circular Toggle Button */}
        <div className="space-y-3 sm:space-y-3.5 text-left font-['Inter']">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`gsap-faq-item rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#141414] bg-white shadow-xs'
                    : 'border-[#DFD8CC] bg-white/70 hover:bg-white hover:border-[#BFB6A6]'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left cursor-pointer focus-visible:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-['Outfit'] font-bold text-sm sm:text-lg text-slate-900 pr-3 sm:pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-[#4355DB] text-white shadow-xs'
                        : 'bg-[#F2ECE1] text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isOpen ? <X className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-[#F0ECE4] mt-1 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};