import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Compass,
  UploadCloud,
  Layers,
  Search,
  Command,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TourStep {
  selector: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  icon: React.ReactNode;
}

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      selector: '[data-tour="brand-header"]',
      badge: 'ETAPA 1 DE 5 • BOAS-VINDAS',
      title: 'Seu workspace editorial de referências',
      subtitle: 'Capture agora. Organize depois. Encontre quando precisar.',
      description:
        'O Salvei foi desenvolvido para designers, desenvolvedores frontend e criadores visuais reunirem referências, landing pages, componentes e tipografias sem fricção e sem perder o foco criativo.',
      tip: 'Chega de links perdidos nos favoritos ou capturas esquecidas nos downloads. O Salvei mantém tudo centralizado e protegido na nuvem.',
      icon: <Compass size={24} className="text-[#4355DB] dark:text-[#6375F1]" />,
    },
    {
      selector: '[data-tour="quick-capture"]',
      badge: 'ETAPA 2 DE 5 • CAPTURA RÁPIDA',
      title: 'Três formas ágeis de capturar referências',
      subtitle: 'Salve por URL, envio de arquivo ou colagem direta.',
      description:
        'Adicione referências colando links canônicos (tecla N), fazendo upload de capturas de tela (PNG, JPG, WebP de até 15 MB) ou simplesmente arrastando e soltando arquivos em qualquer parte do app.',
      tip: 'Tirou um print ou copiou uma imagem da internet? Basta pressionar Ctrl + V (Cmd + V no Mac) na tela para criar uma referência instantaneamente.',
      icon: <UploadCloud size={24} className="text-[#4355DB] dark:text-[#6375F1]" />,
    },
    {
      selector: '[data-tour="nav-organization"]',
      badge: 'ETAPA 3 DE 5 • TAXONOMIA',
      title: 'Projetos, Coleções e Etiquetas',
      subtitle: 'Organize seu acervo de maneira fluida e multidimensional.',
      description:
        'Estruture seu repertório através de Projetos (clientes e sprints em andamento), Coleções (curadorias transversais como Dark Mode, Microinterações, Tipografia) e Etiquetas (#tags rápidas com auto-slug).',
      tip: 'Uma única referência pode pertencer a múltiplos projetos e coleções ao mesmo tempo, sem criar cópias desnecessárias.',
      icon: <Layers size={24} className="text-[#4355DB] dark:text-[#6375F1]" />,
    },
    {
      selector: '[data-tour="global-search"]',
      badge: 'ETAPA 4 DE 5 • BUSCA & DETALHES',
      title: 'Busca instantânea e painel sem desvio de foco',
      subtitle: 'Localize rapidamente por título, domínio, etiquetas e notas.',
      description:
        'Pressione "/" a qualquer momento para focar na busca global. Ao clicar em qualquer card ou pressionar Espaço, o painel lateral abre sem sair do grid.',
      tip: 'No painel lateral você pode editar anotações com suporte a Markdown ao vivo, guardar trechos de código com destaque de sintaxe e anexar arquivos.',
      icon: <Search size={24} className="text-[#4355DB] dark:text-[#6375F1]" />,
    },
    {
      selector: '[data-tour="user-menu"]',
      badge: 'ETAPA 5 DE 5 • PRODUTIVIDADE',
      title: 'Velocidade keyboard-first e preferências',
      subtitle: 'Navegue na velocidade do pensamento e customize seu ambiente.',
      description:
        'O Salvei foi desenhado para ser operado inteiramente pelo teclado: use Ctrl + K para abrir a paleta global de comandos e "?" para o guia de atalhos. Você também pode alternar entre os temas Claro, Escuro e Sistema.',
      tip: 'Você pode reabrir este tutorial guiado ou editar seu perfil a qualquer momento clicando no seu avatar no topo superior.',
      icon: <Command size={24} className="text-[#4355DB] dark:text-[#6375F1]" />,
    },
  ];

  const current = steps[currentStep] || steps[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Responsive check
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Target DOM element measuring and smooth highlight update
  const updateTargetRect = useCallback(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(current.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      // Only set if element is actually visible and rendered
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
        // Scroll element gently into viewport if it is outside
        const isOffscreen =
          rect.top < 0 ||
          rect.bottom > window.innerHeight ||
          rect.left < 0 ||
          rect.right > window.innerWidth;
        if (isOffscreen) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }
    }
    setTargetRect(null);
  }, [isOpen, current.selector]);

  // Update rect on step change, resize and scroll
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow any view transitions/animations to finish
    const timer = setTimeout(updateTargetRect, 80);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isOpen, currentStep, updateTargetRect]);

  // Reset to step 0 when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (isLast) {
      onComplete();
      onClose();
    } else {
      setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentStep((prev) => Math.max(0, prev - 1));
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLast, isFirst]);

  if (!isOpen) return null;

  // Calculate Popover position for desktop
  const calculatePopoverStyle = (): React.CSSProperties => {
    if (isMobile || !targetRect) {
      return {};
    }

    const cardWidth = 420;
    const cardHeight = 360;
    const margin = 16;

    let top = targetRect.bottom + 12;
    let left = targetRect.left;

    // If bottom overflow, flip to above
    if (top + cardHeight > window.innerHeight - margin) {
      top = Math.max(margin, targetRect.top - cardHeight - 12);
    }

    // Clamp horizontal position
    if (left + cardWidth > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - cardWidth - margin);
    }
    left = Math.max(margin, left);

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      maxWidth: 'calc(100vw - 32px)',
    };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guided-tour-title"
      className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200 select-none"
    >
      {/* 1. Spotlight Overlay Layer */}
      {targetRect ? (
        <>
          {/* SVG Cutout Mask */}
          <svg
            className="fixed inset-0 w-full h-full z-40 pointer-events-none transition-all duration-300"
            aria-hidden="true"
          >
            <defs>
              <mask id="salvei-tour-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={Math.max(0, targetRect.left - 6)}
                  y={Math.max(0, targetRect.top - 6)}
                  width={targetRect.width + 12}
                  height={targetRect.height + 12}
                  rx="8"
                  ry="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(10, 12, 16, 0.68)"
              mask="url(#salvei-tour-mask)"
            />
          </svg>

          {/* Glowing Target Ring */}
          <div
            className="fixed z-40 pointer-events-none rounded-lg border-2 border-[#4355DB] shadow-[0_0_24px_rgba(67,85,219,0.55)] transition-all duration-300 ease-out"
            style={{
              top: Math.max(0, targetRect.top - 6),
              left: Math.max(0, targetRect.left - 6),
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
          />
        </>
      ) : (
        /* Fallback Backdrop */
        <div
          onClick={handleSkip}
          className="fixed inset-0 bg-[#0A0C10]/68 backdrop-blur-[1px] z-40 transition-opacity cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* 2. Interactive Backdrop Click Shield (Allows clicking outside to dismiss) */}
      <div
        onClick={handleSkip}
        className="fixed inset-0 z-40 pointer-events-auto"
        aria-hidden="true"
      />

      {/* 3. Contextual Guided Tour Popover Card */}
      <div
        ref={popoverRef}
        style={calculatePopoverStyle()}
        className={`z-50 bg-white dark:bg-[#191B20] text-[#171717] dark:text-[#F3F4F6] border border-[#E7E7E5] dark:border-[#2D3139] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out ${
          isMobile
            ? 'fixed bottom-4 left-3 right-3 max-h-[82vh]'
            : !targetRect
            ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md'
            : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Progress Dots & Skip Button */}
        <div className="px-5 pt-4 pb-3 border-b border-[#E7E7E5]/80 dark:border-[#2D3139]/80 flex items-center justify-between bg-white dark:bg-[#191B20]">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  idx === currentStep
                    ? 'w-6 bg-[#4355DB] dark:bg-[#6375F1]'
                    : idx < currentStep
                    ? 'w-2.5 bg-[#171717] dark:bg-[#D1D5DB]'
                    : 'w-2.5 bg-[#E7E7E5] dark:bg-[#3E434D]'
                }`}
                title={`Ir para etapa ${idx + 1}`}
                aria-label={`Etapa ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#A8A8A6] dark:text-[#9CA3AF] font-bold uppercase tracking-wider">
              {currentStep + 1} / {steps.length}
            </span>
            <button
              type="button"
              onClick={handleSkip}
              className="p-1 rounded text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] hover:bg-[#F1F1EF] dark:hover:bg-[#20232A] transition-colors cursor-pointer"
              title="Pular tutorial (Esc)"
              aria-label="Pular tutorial"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-3.5 max-h-[60vh] scrollbar-thin">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] shrink-0 shadow-2xs">
              {current.icon}
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-mono text-[9px] font-bold tracking-wider text-[#4355DB] dark:text-[#6375F1] uppercase flex items-center gap-1">
                <Sparkles size={11} />
                <span>{current.badge}</span>
              </span>
              <h2
                id="guided-tour-title"
                className="font-sans font-bold text-base text-[#171717] dark:text-[#F3F4F6] leading-snug"
              >
                {current.title}
              </h2>
              <p className="font-sans text-xs text-[#737373] dark:text-[#9CA3AF] leading-tight">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[#737373] dark:text-[#D1D5DB] leading-relaxed">
            {current.description}
          </p>

          {/* Practical Tip Callout */}
          <div className="p-3 rounded-xl bg-[#F8F8F6] dark:bg-[#20232A] border border-[#E7E7E5] dark:border-[#2D3139] flex items-start gap-2.5">
            <Lightbulb
              size={15}
              className="text-amber-500 fill-amber-500/20 shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-[#737373] dark:text-[#9CA3AF] leading-relaxed">
              <strong className="text-[#171717] dark:text-[#F3F4F6] font-semibold">Dica prática: </strong>
              {current.tip}
            </p>
          </div>
        </div>

        {/* Card Footer: Navigation Controls */}
        <div className="px-5 py-3.5 bg-[#F8F8F6] dark:bg-[#15171C] border-t border-[#E7E7E5] dark:border-[#2D3139] flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-xs text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6]"
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
