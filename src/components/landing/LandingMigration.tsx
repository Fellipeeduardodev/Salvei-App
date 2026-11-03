import React from 'react';
import { DownloadCloud, FileCode2, ArrowRight, ShieldCheck, Check, Chrome, Compass, Flame } from 'lucide-react';

interface LandingMigrationProps {
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onDemoClick?: () => void;
}

export const LandingMigration: React.FC<LandingMigrationProps> = ({ onOpenAuth, onDemoClick }) => {
  const sources = [
    {
      name: 'Google Chrome & Arc',
      ext: 'bookmarks.html',
      desc: 'Exporte seus favoritos em 1 clique nas configurações do navegador.',
    },
    {
      name: 'Apple Safari & Edge',
      ext: 'bookmarks.html',
      desc: 'Padrão universal Netscape Bookmark aceito nativamente.',
    },
    {
      name: 'Mozilla Firefox',
      ext: 'bookmarks.html',
      desc: 'Importação integral de pastas e marcadores em segundos.',
    },
    {
      name: 'Raindrop.io & Backups',
      ext: '.html ou .json',
      desc: 'Compatibilidade com arquivos de exportação e backups estruturados.',
    },
  ];

  const handleAction = () => {
    if (onDemoClick) {
      onDemoClick();
    } else if (onOpenAuth) {
      onOpenAuth('signup');
    }
  };

  return (
    <section id="migracao" className="py-24 sm:py-36 bg-[#FAF7F2] border-b border-[#E5DFD5] px-4 sm:px-8 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-20 text-left">
          <span className="font-mono text-xs uppercase tracking-wider text-[#4355DB] font-semibold block mb-3">
            Migração sem Fricção
          </span>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-5xl lg:text-6xl text-[#141414] tracking-[-0.035em] leading-[1.03] mb-4">
            Traga seus favoritos antigos em segundos.
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-slate-600 font-normal max-w-2xl">
            Você não precisa recomeçar do zero. O Salvei lê o arquivo de favoritos do Chrome, Safari, Firefox, Edge ou Raindrop e organiza tudo automaticamente na sua Caixa de Entrada.
          </p>
        </div>

        {/* 2-Column Layout: Sources vs Interactive Dropzone Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: 4 Supported Sources */}
          <div className="lg:col-span-6 space-y-3.5">
            {sources.map((source, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#DFD8CC] shadow-2xs flex items-start gap-4 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-[#4355DB] flex items-center justify-center shrink-0 mt-0.5">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-['Outfit'] font-bold text-sm text-slate-900">
                      {source.name}
                    </h4>
                    <span className="font-mono text-[11px] text-slate-500 bg-[#FAF7F2] border border-[#E5DFD5] px-2 py-0.5 rounded-full">
                      {source.ext}
                    </span>
                  </div>
                  <p className="font-['Inter'] text-xs text-slate-600 leading-relaxed font-normal">
                    {source.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Privacy Guarantee Note */}
            <div className="p-4 rounded-2xl bg-[#EFE9DF] border border-[#DDD5C8] flex items-center gap-3 text-left font-mono text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Processamento 100% no seu navegador: nenhum dado é compartilhado ou enviado para terceiros.</span>
            </div>
          </div>

          {/* Right Column: Visual Dropzone Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#DFD8CC] p-8 sm:p-10 shadow-sm flex flex-col justify-between text-left relative overflow-hidden">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#4355DB] font-bold block mb-2">
                Como Funciona a Importação
              </span>
              <h3 className="font-['Outfit'] font-bold text-2xl text-slate-900 mb-6 tracking-tight">
                Do arquivo .html à biblioteca estruturada
              </h3>

              {/* 3 Clear Steps */}
              <div className="space-y-4 font-['Inter'] text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <span className="font-mono font-bold text-slate-900 bg-[#FAF7F2] border border-[#DFD8CC] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 font-semibold block mb-0.5">Exporte seus favoritos</strong>
                    <span>No seu navegador atual, acione a opção de exportar favoritos para gerar o arquivo <code className="bg-[#FAF7F2] border border-[#DDD5C8] px-1.5 py-0.5 rounded font-mono text-xs text-slate-800">bookmarks.html</code>.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono font-bold text-slate-900 bg-[#FAF7F2] border border-[#DFD8CC] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 font-semibold block mb-0.5">Solte o arquivo no Salvei</strong>
                    <span>O sistema lê todos os links, extrai os domínios e organiza os títulos automaticamente.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono font-bold text-slate-900 bg-[#FAF7F2] border border-[#DFD8CC] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 font-semibold block mb-0.5">Navegue com foco absoluto</strong>
                    <span>Todas as suas referências preservadas em um único lugar, sem abas infinitas abertas.</span>
                  </div>
                </div>
              </div>

              {/* Visual Drop Area Simulation */}
              <div className="mt-8 p-6 rounded-2xl border-2 border-dashed border-[#DFD8CC] bg-[#FAF7F2] text-center space-y-2">
                <DownloadCloud className="w-8 h-8 text-[#4355DB] mx-auto" />
                <p className="font-['Outfit'] font-bold text-sm text-slate-900">
                  Importador universal de favoritos
                </p>
                <p className="font-mono text-xs text-slate-500">
                  Disponível nas Configurações da sua biblioteca
                </p>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-8">
              <button
                onClick={handleAction}
                className="w-full py-3.5 px-6 rounded-full bg-[#0F172A] hover:bg-slate-800 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Experimentar o Salvei Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
