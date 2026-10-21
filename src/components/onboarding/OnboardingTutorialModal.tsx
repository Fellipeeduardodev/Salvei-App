import React, { useState } from 'react';
import {
  Compass,
  Globe,
  UploadCloud,
  Layers,
  Search,
  Command,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Star,
  Tag,
  Copy,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: 'BEM-VINDO AO SALVEI',
      title: 'Seu workspace editorial de referências visuais',
      subtitle: 'Capture agora. Organize depois. Encontre quando precisar.',
      icon: <Compass size={28} className="text-[#4355DB]" />,
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-[#737373] leading-relaxed">
            O <strong>Salvei</strong> foi criado para que designers, desenvolvedores frontend e criadores organizem seu repertório visual sem fricção. Chega de links esquecidos nos favoritos ou capturas perdidas na pasta de downloads.
          </p>
          <div className="p-3.5 rounded-xl bg-[#F8F8F6] border border-[#E7E7E5] flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#171717]">
              <span className="w-2 h-2 rounded-full bg-[#4355DB]" />
              <span>Princípios nucleares do Salvei:</span>
            </div>
            <ul className="text-xs text-[#737373] flex flex-col gap-1.5 pl-4 list-disc">
              <li><strong>Zero atrito para salvar:</strong> cole e guarde em 3 segundos.</li>
              <li><strong>Reconhecimento visual imediato:</strong> foco na imagem e proporção do site.</li>
              <li><strong>Privacidade absoluta:</strong> dados e imagens protegidos com segurança na nuvem.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      badge: 'TRÊS FORMAS DE CAPTURA',
      title: 'Salve referências visuais em milissegundos',
      subtitle: 'Capture referências sem quebrar o seu fluxo de raciocínio criativo.',
      icon: <UploadCloud size={28} className="text-[#4355DB]" />,
      content: (
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-lg bg-[#F8F8F6] border border-[#E7E7E5] flex items-start gap-3">
            <div className="p-2 rounded-md bg-white border border-[#E7E7E5] text-[#4355DB] shrink-0 mt-0.5">
              <Globe size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <strong className="text-xs text-[#171717]">Captura por URL (N)</strong>
              <span className="text-[11px] text-[#737373]">
                Cole o link de qualquer página e o Salvei extrai automaticamente o título, domínio e imagem de pré-visualização.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F8F6] border border-[#E7E7E5] flex items-start gap-3">
            <div className="p-2 rounded-md bg-white border border-[#E7E7E5] text-[#22C55E] shrink-0 mt-0.5">
              <UploadCloud size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <strong className="text-xs text-[#171717]">Upload de Imagem</strong>
              <span className="text-[11px] text-[#737373]">
                Envie capturas de tela em PNG, JPG ou WebP de até 15 MB por clique ou arrastando diretamente no navegador.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F8F6] border border-[#E7E7E5] flex items-start gap-3">
            <div className="p-2 rounded-md bg-white border border-[#E7E7E5] text-[#F59E0B] shrink-0 mt-0.5">
              <Copy size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <strong className="text-xs text-[#171717]">Colagem Direta (Ctrl + V)</strong>
              <span className="text-[11px] text-[#737373]">
                Tirou um print ou copiou uma imagem da internet? Basta pressionar Ctrl + V na tela para criar a referência na hora.
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'TAXONOMIA EDITORIAL',
      title: 'Organize do seu jeito, sem rigidez de pastas',
      subtitle: 'Estruture seu repertório por projetos, coleções, etiquetas e favoritos.',
      icon: <Layers size={28} className="text-[#4355DB]" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-lg bg-[#F8F8F6] border border-[#E7E7E5] flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717]">
              <Layers size={14} className="text-[#4355DB]" />
              <span>Coleções</span>
            </div>
            <p className="text-[11px] text-[#737373]">
              Curadorias transversais perenes (ex: <em>Dark Mode</em>, <em>Microinterações</em>, <em>Brutalismo</em>).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F8F6] border border-[#E7E7E5] flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717]">
              <SlidersHorizontal size={14} className="text-[#171717]" />
              <span>Projetos</span>
            </div>
            <p className="text-[11px] text-[#737373]">
              Workspaces dedicados para clientes, produtos e iniciativas em andamento.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F8F6] border border-[#E7E7E5] flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717]">
              <Tag size={14} className="text-emerald-600" />
              <span>Etiquetas (Tags)</span>
            </div>
            <p className="text-[11px] text-[#737373]">
              Marcadores livres com auto-slug e filtros rápidos na barra superior.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F8F6] border border-[#E7E7E5] flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717]">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span>Favoritos (F)</span>
            </div>
            <p className="text-[11px] text-[#737373]">
              Destaque referências essenciais com um clique ou pressionando a tecla F.
            </p>
          </div>
        </div>
      ),
    },
    {
      badge: 'BUSCA & DETALHES',
      title: 'Busca instantânea e painel sem desvio de foco',
      subtitle: 'Encontre referências por texto e edite notas sem perder a posição do grid.',
      icon: <Search size={28} className="text-[#4355DB]" />,
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#737373] leading-relaxed">
            A busca do Salvei é reativa e instantânea: basta pressionar <strong>/</strong> para filtrar simultaneamente por título, domínio, etiquetas e notas.
          </p>

          <div className="p-3.5 rounded-xl bg-[#F8F8F6] border border-[#E7E7E5] flex flex-col gap-2">
            <strong className="text-xs text-[#171717]">Painel Lateral de Inspeção (Drawer)</strong>
            <p className="text-[11px] text-[#737373] leading-relaxed">
              Ao clicar em qualquer card ou teclar <strong>Espaço</strong>, o painel lateral abre sem desarmar a sua busca. Você pode:
            </p>
            <ul className="text-xs text-[#737373] flex flex-col gap-1 pl-4 list-disc">
              <li>Escrever anotações com formatação em <strong>Markdown</strong> ao vivo.</li>
              <li>Guardar <strong>trechos de código</strong> com destaque de sintaxe (HTML, CSS, React).</li>
              <li>Gerenciar arquivos anexos e metadados.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      badge: 'PRODUTIVIDADE KEYBOARD-FIRST',
      title: 'Navegue na velocidade do pensamento',
      subtitle: 'O Salvei foi desenhado para ser operado inteiramente pelo teclado.',
      icon: <Command size={28} className="text-[#4355DB]" />,
      content: (
        <div className="flex flex-col gap-3">
          <div className="border border-[#E7E7E5] rounded-xl overflow-hidden divide-y divide-[#E7E7E5] text-xs">
            <div className="flex items-center justify-between p-2.5 bg-white">
              <span className="text-[#171717] font-medium">Paleta de Comandos Global</span>
              <kbd className="font-mono text-[10px] bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E7E7E5]">
                Ctrl + K
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#F8F8F6]">
              <span className="text-[#171717] font-medium">Focar na Busca</span>
              <kbd className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#E7E7E5]">
                /
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white">
              <span className="text-[#171717] font-medium">Nova Referência</span>
              <kbd className="font-mono text-[10px] bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E7E7E5]">
                N
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#F8F8F6]">
              <span className="text-[#171717] font-medium">Navegar Cards no Grid</span>
              <kbd className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#E7E7E5]">
                J / K ou Setas
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white">
              <span className="text-[#171717] font-medium">Abrir Detalhes / Favoritar</span>
              <kbd className="font-mono text-[10px] bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E7E7E5]">
                Espaço / F
              </kbd>
            </div>
          </div>
          <p className="text-[11px] text-[#A8A8A6] text-center">
            Pressione <strong>?</strong> a qualquer momento para abrir o guia completo de atalhos.
          </p>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleSkip();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handleBack();
      }}
    >
      <div className="w-full max-w-lg bg-white border border-[#E7E7E5] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Progress Bar Header */}
        <div className="px-6 pt-5 pb-3 border-b border-[#E7E7E5]/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  idx === currentStep
                    ? 'w-6 bg-[#4355DB]'
                    : idx < currentStep
                    ? 'w-3 bg-[#171717]'
                    : 'w-3 bg-[#E7E7E5]'
                }`}
                title={`Ir para etapa ${idx + 1}`}
                aria-label={`Etapa ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#A8A8A6] font-semibold">
              {currentStep + 1} de {steps.length}
            </span>
            <button
              type="button"
              onClick={handleSkip}
              className="p-1 rounded text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer"
              title="Pular tutorial (Esc)"
              aria-label="Pular tutorial"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#F8F8F6] border border-[#E7E7E5] shrink-0 shadow-2xs">
              {current.icon}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-mono text-[10px] font-bold tracking-wider text-[#4355DB] uppercase">
                {current.badge}
              </span>
              <h2
                id="tutorial-modal-title"
                className="font-sans font-bold text-lg text-[#171717] leading-tight"
              >
                {current.title}
              </h2>
              <p className="font-sans text-xs text-[#737373] leading-snug">
                {current.subtitle}
              </p>
            </div>
          </div>

          <div className="pt-2">{current.content}</div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[#F8F8F6] border-t border-[#E7E7E5] flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-xs text-[#737373] hover:text-[#171717]"
          >
            Pular tutorial
          </Button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleBack}
                iconLeft={<ArrowLeft size={13} />}
              >
                Anterior
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              iconRight={isLast ? <Check size={13} /> : <ArrowRight size={13} />}
            >
              {isLast ? 'Começar a Usar' : 'Próximo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
