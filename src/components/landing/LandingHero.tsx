import React, { useState, useEffect, useRef } from 'react';
import { SalveiSymbol } from '../ui/Logo';
import {
  ArrowRight,
  Play,
  Search,
  Command,
  Inbox,
  Briefcase,
  Layers,
  Tag,
  SlidersHorizontal,
    Star,
  Globe,
  Plus,
  Check,
} from 'lucide-react';

interface HeroCardItem {
  id: string;
  title: string;
  domain: string;
  image: string;
  tags: string[];
  palette: string[];
  starred?: boolean;
}

const HERO_CARDS: Record<'todas' | 'interface' | 'editorial' | 'dark-mode' | 'design-system', HeroCardItem[]> = {
  todas: [
    {
      id: 'linear',
      title: 'Linear Modern Product Workspace',
      domain: 'linear.app',
      image: '/brand/digital-design-system-spec-02.jpg',
      tags: ['#interface', '#dark-mode'],
      palette: ['#0F172A', '#4355DB', '#64748B', '#E2E8F0'],
      starred: true,
    },
    {
      id: 'kinfolk',
      title: 'Ateliê de Concreto & Luz Rasante',
      domain: 'kinfolk.com',
      image: '/brand/editorial-architecture-01.jpg',
      tags: ['#editorial', '#fotografia'],
      palette: ['#292524', '#A8A29E', '#D6D3D1', '#F5F5F4'],
      starred: false,
    },
    {
      id: 'swiss',
      title: 'Swiss Design Specimen & Grid Tablet',
      domain: 'are.na/fellipe',
      image: '/brand/editorial-typography-print-02.jpg',
      tags: ['#tipografia', '#grid', '#interface'],
      palette: ['#1E1B4B', '#4355DB', '#93C5FD', '#EFF6FF'],
      starred: false,
    },
  ],
  interface: [
    {
      id: 'linear',
      title: 'Linear Modern Product Workspace',
      domain: 'linear.app',
      image: '/brand/digital-design-system-spec-02.jpg',
      tags: ['#interface', '#dark-mode'],
      palette: ['#0F172A', '#4355DB', '#64748B', '#E2E8F0'],
      starred: true,
    },
    {
      id: 'raycast',
      title: 'Raycast System & Command Tokens',
      domain: 'raycast.com',
      image: '/brand/digital-interface-grid-01.jpg',
      tags: ['#interface', '#design-system'],
      palette: ['#090A0F', '#FF6363', '#4355DB', '#E2E8F0'],
      starred: true,
    },
    {
      id: 'swiss',
      title: 'Swiss Design Specimen & Grid Tablet',
      domain: 'are.na/fellipe',
      image: '/brand/editorial-typography-print-02.jpg',
      tags: ['#interface', '#tipografia'],
      palette: ['#1E1B4B', '#4355DB', '#93C5FD', '#EFF6FF'],
      starred: false,
    },
  ],
  editorial: [
    {
      id: 'kinfolk',
      title: 'Ateliê de Concreto & Luz Rasante',
      domain: 'kinfolk.com',
      image: '/brand/editorial-architecture-01.jpg',
      tags: ['#editorial', '#fotografia'],
      palette: ['#292524', '#A8A29E', '#D6D3D1', '#F5F5F4'],
      starred: false,
    },
    {
      id: 'swiss',
      title: 'Swiss Design Specimen & Grid Tablet',
      domain: 'are.na/fellipe',
      image: '/brand/editorial-typography-print-02.jpg',
      tags: ['#editorial', '#tipografia'],
      palette: ['#1E1B4B', '#4355DB', '#93C5FD', '#EFF6FF'],
      starred: false,
    },
    {
      id: 'cereal',
      title: 'Cereal Minimal Volume & Concrete Grid',
      domain: 'readcereal.com',
      image: '/brand/hybrid-studio-still-01.jpg',
      tags: ['#editorial', '#fotografia'],
      palette: ['#242120', '#8C827A', '#DDD7CD', '#FAF8F5'],
      starred: false,
    },
  ],
  'dark-mode': [
    {
      id: 'linear',
      title: 'Linear Modern Product Workspace',
      domain: 'linear.app',
      image: '/brand/digital-design-system-spec-02.jpg',
      tags: ['#interface', '#dark-mode'],
      palette: ['#0F172A', '#4355DB', '#64748B', '#E2E8F0'],
      starred: true,
    },
    {
      id: 'raycast',
      title: 'Raycast System & Command Tokens',
      domain: 'raycast.com',
      image: '/brand/digital-interface-grid-01.jpg',
      tags: ['#dark-mode', '#interface'],
      palette: ['#090A0F', '#FF6363', '#4355DB', '#E2E8F0'],
      starred: true,
    },
    {
      id: 'swiss',
      title: 'Swiss Design Specimen & Grid Tablet',
      domain: 'are.na/fellipe',
      image: '/brand/editorial-typography-print-02.jpg',
      tags: ['#dark-mode', '#grid'],
      palette: ['#1E1B4B', '#4355DB', '#93C5FD', '#EFF6FF'],
      starred: false,
    },
  ],
  'design-system': [
    {
      id: 'raycast',
      title: 'Raycast System & Command Tokens',
      domain: 'raycast.com',
      image: '/brand/digital-interface-grid-01.jpg',
      tags: ['#design-system', '#interface'],
      palette: ['#090A0F', '#FF6363', '#4355DB', '#E2E8F0'],
      starred: true,
    },
    {
      id: 'linear',
      title: 'Linear Modern Product Workspace',
      domain: 'linear.app',
      image: '/brand/digital-design-system-spec-02.jpg',
      tags: ['#design-system', '#dark-mode'],
      palette: ['#0F172A', '#4355DB', '#64748B', '#E2E8F0'],
      starred: true,
    },
    {
      id: 'cereal',
      title: 'Cereal Minimal Volume & Concrete Grid',
      domain: 'readcereal.com',
      image: '/brand/hybrid-studio-still-01.jpg',
      tags: ['#design-system', '#editorial'],
      palette: ['#242120', '#8C827A', '#DDD7CD', '#FAF8F5'],
      starred: false,
    },
  ],
};

const FILTER_COUNTS: Record<string, string> = {
  todas: '24 referências curadas',
  interface: '8 referências em #interface',
  editorial: '6 referências em #editorial',
  'dark-mode': '5 referências em #dark-mode',
  'design-system': '7 referências em #design-system',
};

const getTagBadgeStyle = (tag: string) => {
  switch (tag) {
    case '#dark-mode':
      return 'bg-indigo-50 text-[#4355DB]';
    case '#editorial':
      return 'bg-amber-50 text-amber-700';
    case '#tipografia':
      return 'bg-blue-50 text-[#4355DB]';
    case '#design-system':
      return 'bg-purple-50 text-purple-700';
    default:
      return 'bg-[#F1F1EF] text-[#737373]';
  }
};

interface LandingHeroProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onDemoClick?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenAuth, onDemoClick }) => {
  const [activeFilter, setActiveFilter] = useState<'todas' | 'interface' | 'editorial' | 'dark-mode' | 'design-system'>('todas');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Simulated Mouse Cursor & Interactive Demo Loop States
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 315, y: 170 });
  const [moveDuration, setMoveDuration] = useState<number>(500);
  const [simulatedHover, setSimulatedHover] = useState<'interface' | 'editorial' | 'todas' | 'swatch' | null>(null);
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [showRipple, setShowRipple] = useState<boolean>(false);
  const [rippleKey, setRippleKey] = useState<number>(0);
  const [isUserHovering, setIsUserHovering] = useState<boolean>(false);

  // DOM Refs for pixel-perfect cursor positioning
  const containerRef = useRef<HTMLDivElement>(null);
  const todasBtnRef = useRef<HTMLButtonElement>(null);
  const interfaceBtnRef = useRef<HTMLButtonElement>(null);
  const editorialBtnRef = useRef<HTMLButtonElement>(null);
  const colorSwatchRef = useRef<HTMLSpanElement>(null);

  const getCoordsForElement = (
    el: HTMLElement | null,
    fallbackX = 315,
    fallbackY = 170,
    targetSelector?: string
  ) => {
    if (containerRef.current) {
      const target = el || (targetSelector ? (containerRef.current.querySelector(targetSelector) as HTMLElement) : null);
      if (target) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const elRect = target.getBoundingClientRect();
        return {
          x: Math.round(elRect.left - containerRect.left + elRect.width / 2 - 3),
          y: Math.round(elRect.top - containerRect.top + elRect.height / 2 - 3),
        };
      }
    }
    return { x: fallbackX, y: fallbackY };
  };

  // Automated Interactive Showcase Loop with Fluid Motion & Hover Anticipation
  useEffect(() => {
    if (isUserHovering) return;

    let timer: NodeJS.Timeout;

    const moveCursorTo = (
      el: HTMLElement | null,
      fallbackX: number,
      fallbackY: number,
      targetSelector: string,
      duration = 520
    ) => {
      const coords = getCoordsForElement(el, fallbackX, fallbackY, targetSelector);
      setMoveDuration(duration);
      setCursorPos(coords);
    };

    const sequence = [
      // 1. Move to Search Input (Simulating ⌘K Search)
      {
        delay: 500,
        action: () => {
          moveCursorTo(searchInputRef.current, 460, 68, '[data-demo-target="input-search"]', 460);
        },
      },
      // 2. Click in Search Input
      {
        delay: 500,
        action: () => {
          setIsClicking(true);
          setShowRipple(true);
          setRippleKey((k) => k + 1);
          setIsSearchFocused(true);
        },
      },
      // 3. Release click & Type "editorial" letter-by-letter
      {
        delay: 160,
        action: () => {
          setIsClicking(false);
          setShowRipple(false);
          const word = 'editorial';
          let i = 1;
          const typingInterval = setInterval(() => {
            if (i <= word.length) {
              setSearchQuery(word.slice(0, i));
              i++;
            } else {
              clearInterval(typingInterval);
            }
          }, 45);
        },
      },
      // 4. Hold viewing search results, then backspace cleanly
      {
        delay: 1400,
        action: () => {
          const word = 'editorial';
          let i = word.length;
          const deleteInterval = setInterval(() => {
            if (i >= 0) {
              setSearchQuery(word.slice(0, i));
              i--;
            } else {
              clearInterval(deleteInterval);
              setIsSearchFocused(false);
            }
          }, 28);
        },
      },
      // 5. Move to #interface filter button (natural acceleration)
      {
        delay: 550,
        action: () => {
          moveCursorTo(interfaceBtnRef.current, 409, 170, '[data-demo-target="btn-interface"]', 480);
          setTimeout(() => setSimulatedHover('interface'), 320);
        },
      },
      // 6. Click #interface down (tactile press)
      {
        delay: 520,
        action: () => {
          setIsClicking(true);
          setShowRipple(true);
          setRippleKey((k) => k + 1);
        },
      },
      // 7. ACTUALLY CHANGE filter to #interface!
      {
        delay: 140,
        action: () => {
          setActiveFilter('interface');
          setCopiedHex(null);
          setSimulatedHover(null);
        },
      },
      // 8. Release mouse click
      {
        delay: 180,
        action: () => {
          setIsClicking(false);
          setShowRipple(false);
        },
      },
      // 9. Hold viewing interface cards (1.5s), then move towards Linear card's color swatch #4355DB
      {
        delay: 1500,
        action: () => {
          moveCursorTo(colorSwatchRef.current, 313, 408, '[data-demo-target="swatch-cobalt"]', 580);
          setTimeout(() => setSimulatedHover('swatch'), 440);
        },
      },
      // 10. Click down on color swatch
      {
        delay: 620,
        action: () => {
          setIsClicking(true);
          setShowRipple(true);
          setRippleKey((k) => k + 1);
        },
      },
      // 11. ACTUALLY TRIGGER color copy & feedback!
      {
        delay: 140,
        action: () => {
          setCopiedHex('#4355DB');
        },
      },
      // 12. Release click on swatch
      {
        delay: 180,
        action: () => {
          setIsClicking(false);
          setShowRipple(false);
        },
      },
      // 13. Hold viewing copied color feedback (1.4s), then move up to #editorial
      {
        delay: 1400,
        action: () => {
          moveCursorTo(editorialBtnRef.current, 499, 170, '[data-demo-target="btn-editorial"]', 580);
          setTimeout(() => setSimulatedHover('editorial'), 440);
        },
      },
      // 14. Click down on #editorial
      {
        delay: 620,
        action: () => {
          setIsClicking(true);
          setShowRipple(true);
          setRippleKey((k) => k + 1);
        },
      },
      // 15. ACTUALLY CHANGE filter to #editorial!
      {
        delay: 140,
        action: () => {
          setActiveFilter('editorial');
          setCopiedHex(null);
          setSimulatedHover(null);
        },
      },
      // 16. Release click
      {
        delay: 180,
        action: () => {
          setIsClicking(false);
          setShowRipple(false);
        },
      },
      // 17. Hold viewing editorial cards (1.5s), then move to Todas (24)
      {
        delay: 1500,
        action: () => {
          moveCursorTo(todasBtnRef.current, 315, 170, '[data-demo-target="btn-todas"]', 480);
          setTimeout(() => setSimulatedHover('todas'), 340);
        },
      },
      // 18. Click down on Todas (24)
      {
        delay: 520,
        action: () => {
          setIsClicking(true);
          setShowRipple(true);
          setRippleKey((k) => k + 1);
        },
      },
      // 19. ACTUALLY CHANGE filter back to Todas!
      {
        delay: 140,
        action: () => {
          setActiveFilter('todas');
          setSimulatedHover(null);
        },
      },
      // 20. Release click
      {
        delay: 180,
        action: () => {
          setIsClicking(false);
          setShowRipple(false);
        },
      },
      // 21. Hold viewing full collection before repeating loop
      {
        delay: 1400,
        action: () => {
          // Loops naturally
        },
      },
    ];

    let currentIdx = 0;
    const runNext = () => {
      if (currentIdx >= sequence.length) {
        currentIdx = 0;
      }
      const step = sequence[currentIdx];
      timer = setTimeout(() => {
        step.action();
        currentIdx++;
        runNext();
      }, step.delay);
    };

    runNext();

    return () => {
      clearTimeout(timer);
    };
  }, [isUserHovering]);

  // Adjust cursor on window resize to ensure accuracy
  useEffect(() => {
    const handleResize = () => {
      let targetEl: HTMLElement | null = null;
      if (activeFilter === 'todas') targetEl = todasBtnRef.current;
      else if (activeFilter === 'interface') targetEl = interfaceBtnRef.current;
      else if (activeFilter === 'editorial') targetEl = editorialBtnRef.current;
      if (targetEl) {
        setCursorPos(getCoordsForElement(targetEl));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeFilter]);

  const handleLaunchDemo = () => {
    if (onDemoClick) {
      onDemoClick();
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('preview', 'workspace');
      window.location.search = params.toString();
    }
  };

  const copyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2200);
  };

  return (
    <section className="relative pt-24 sm:pt-36 lg:pt-40 pb-16 sm:pb-28 px-3.5 sm:px-6 lg:px-8 overflow-hidden bg-[#FAF7F2] text-[#0F172A]">
      
      {/* ========================================================================= */}
      {/* AUTHENTIC SALVEI ACCENTS: OPTICAL REGISTRATION & PRISM CAUSTIC GLOW       */}
      {/* ========================================================================= */}
      
      {/* Subtle Atmospheric Prism Caustic Glow in Background */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(67,85,219,0.08),rgba(240,106,56,0.04),transparent_75%)] pointer-events-none -z-10" />

      {/* Technical Editorial Crop Marks & Alignment Guides */}
      <div className="absolute top-28 left-8 hidden lg:flex flex-col gap-1 text-[10px] font-mono text-[#B8AEA2] select-none pointer-events-none opacity-60">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4355DB]" />
          <span>SALVEI // OPTICAL GRID 16:9</span>
        </span>
        <span className="text-[#968D81]">REF_ID: #4355DB • 300DPI</span>
      </div>

      <div className="absolute top-28 right-8 hidden lg:flex flex-col items-end gap-1 text-[10px] font-mono text-[#B8AEA2] select-none pointer-events-none opacity-60">
        <span>CURATOR_WORKSPACE_v0.3</span>
        <span className="flex items-center gap-1 text-[#968D81]">
          <span>PRISM_SPECTRA</span>
          <span className="w-2 h-2 rounded-xs border border-[#4355DB]" />
        </span>
      </div>

      {/* Optical Crop Crosshairs */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-6xl pointer-events-none hidden sm:block opacity-35">
        <span className="absolute left-6 text-sm font-mono text-[#A89E92]">+</span>
        <span className="absolute right-6 text-sm font-mono text-[#A89E92]">+</span>
      </div>

      {/* Hero Header Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Subtle pill tag with genuine product value */}
        <div className="gsap-hero-badge inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-[#E2DDD5] shadow-2xs text-[11px] sm:text-xs font-medium text-slate-700 mb-5 sm:mb-6 max-w-full">
          <span className="w-2 h-2 rounded-full bg-[#4355DB] shrink-0" />
          <span className="truncate">O santuário visual para quem desenha e constrói na web</span>
        </div>

        {/* Headline — Confident, Editorial Display with Fluid Mobile Typography */}
        <h1 className="gsap-hero-title font-['Outfit'] font-black text-3xl sm:text-5xl md:text-6xl lg:text-[76px] tracking-[-0.04em] text-[#141414] leading-[1.05] sm:leading-[0.98] mb-5 sm:mb-6 break-words">
          Guarde o que te inspira.<br className="hidden sm:inline" />
          <span className="text-[#141414]"> Crie no seu tempo.</span>
        </h1>

        {/* Subtitle — Distilled, Active, Grounded in Real Workflow */}
        <p className="gsap-hero-sub font-['Inter'] text-sm sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 font-normal px-1 sm:px-0">
          Cole qualquer link ou imagem. O Salvei arquiva o layout em alta fidelidade, extrai a paleta HEX e liberta seu navegador das abas infinitas.
        </p>

        {/* Dual Action Buttons */}
        <div className="gsap-hero-actions flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 mb-10 sm:mb-14 w-full sm:w-auto max-w-md sm:max-w-none mx-auto">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto bg-[#171717] hover:bg-[#262626] active:scale-[0.98] text-white font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Criar Minha Biblioteca Grátis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-[#D5CEC2] text-slate-800 font-medium text-sm sm:text-base px-7 py-3.5 rounded-full transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#4355DB] fill-[#4355DB]" />
            <span>Testar sem Cadastro</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FAITHFUL APPLICATION WINDOW PREVIEW WITH ANIMATED MOUSE CURSOR           */}
      {/* ========================================================================= */}
      <div className="gsap-hero-mockup max-w-5xl mx-auto relative z-10 px-0 sm:px-2">
        
        {/* Main Application Container */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsUserHovering(true)}
          onMouseLeave={() => setIsUserHovering(false)}
          onClick={handleLaunchDemo}
          className="bg-white rounded-2xl sm:rounded-3xl border border-[#E0D9CE] shadow-[0_20px_60px_-15px_rgba(25,20,15,0.12)] overflow-hidden cursor-pointer relative group text-left select-none"
        >
          {/* 1. macOS Window Topbar with Address Pill */}
          <div className="h-10 px-3 sm:px-4 bg-[#F8F8F6] border-b border-[#E7E7E5] flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#EF4444]/90 inline-block" />
              <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#F59E0B]/90 inline-block" />
              <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#22C55E]/90 inline-block" />
            </div>

            {/* Simulated Address Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-md bg-white border border-[#E7E7E5] shadow-2xs font-mono text-[10px] sm:text-[11px] text-slate-500 truncate max-w-[210px] sm:max-w-none">
              <span className="text-emerald-600 shrink-0">🔒</span>
              <span className="truncate">salvei.app/workspace/inbox</span>
              <span className="text-[#A8A8A6] font-semibold text-[10px] uppercase tracking-wider ml-1 hidden sm:inline">
                [ WORKSPACE ATIVO ]
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>v0.3</span>
            </div>
          </div>

          {/* 2. Workspace Layout: Sidebar + Main App Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-auto md:min-h-[580px] bg-[#F8F8F6]">
            
            {/* Sidebar (Faithful to Curator's src/components/layout/Sidebar.tsx, hidden on mobile so cards take stage) */}
            <div className="hidden md:flex md:col-span-3 bg-white border-r border-[#E7E7E5] p-3 flex-col justify-between text-xs font-['Inter']">
              <div>
                
                {/* Brand Header */}
                <div className="h-12 px-2 flex items-center justify-between border-b border-[#E7E7E5]/70 mb-3">
                  <div className="flex items-center gap-2.5">
                    <SalveiSymbol size={22} className="shrink-0" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-['Outfit'] font-bold text-base tracking-tight text-[#171717]">
                        Salvei
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] tracking-wider uppercase">
                        v0.3
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  <span className="px-2 pt-1 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A8A8A6] block">
                    Workspace
                  </span>

                  {/* 1. Caixa de Entrada (Active) */}
                  <div className="flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] font-semibold bg-[#EDEDEA] text-[#171717]">
                    <div className="flex items-center gap-2.5">
                      <Inbox size={17} className="text-[#4355DB]" />
                      <span>Caixa de entrada</span>
                    </div>
                    <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded bg-white font-semibold text-[#171717] shadow-2xs">
                      24
                    </span>
                  </div>

                  {/* 2. Projetos */}
                  <div className="flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] font-medium text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Briefcase size={17} />
                      <span>Projetos</span>
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-[#A8A8A6]">
                      6
                    </span>
                  </div>

                  {/* 3. Coleções */}
                  <div className="flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] font-medium text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Layers size={17} />
                      <span>Coleções</span>
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-[#A8A8A6]">
                      12
                    </span>
                  </div>

                  {/* 4. Etiquetas */}
                  <div className="flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] font-medium text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Tag size={17} />
                      <span>Etiquetas</span>
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-[#A8A8A6]">
                      18
                    </span>
                  </div>

                  {/* 5. Configurações */}
                  <div className="flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] font-medium text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal size={17} />
                      <span>Configurações</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Profile Card Bottom */}
              <div className="pt-3 border-t border-[#E7E7E5] flex items-center gap-2.5 px-2">
                <div className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center font-['Outfit'] font-bold text-xs shadow-2xs">
                  FE
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-['Outfit'] font-bold text-xs text-[#171717] block truncate">
                    Fellipe Eduardo
                  </span>
                  <span className="font-mono text-[10px] text-[#A8A8A6] block truncate">
                    Plano Pro • Ativo
                  </span>
                </div>
              </div>
            </div>

            {/* Main Application Area (Faithful to Curator's Topbar & InboxView) */}
            <div className="md:col-span-9 flex flex-col bg-[#F8F8F6]">
              
              {/* App Topbar */}
              <div className="h-12 sm:h-14 px-3 sm:px-5 bg-white border-b border-[#E7E7E5] flex items-center justify-between gap-2 sm:gap-4">
                {/* Search Bar with Cmd+K */}
                <div className="flex-1 max-w-md">
                  <div className="relative flex items-center w-full">
                    <Search size={14} className={`absolute left-2.5 sm:left-3 transition-colors ${isSearchFocused ? 'text-[#4355DB]' : 'text-[#737373]'}`} />
                    <input
                      ref={searchInputRef}
                      data-demo-target="input-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar referências..."
                      className={`w-full h-8 sm:h-9 pl-8 sm:pl-9 pr-11 sm:pr-14 rounded-md text-[11px] sm:text-[12px] border transition-all duration-200 outline-none ${
                        isSearchFocused
                          ? 'bg-white text-[#171717] border-[#4355DB] ring-2 ring-[#4355DB]/20 shadow-xs'
                          : 'bg-[#F8F8F6] text-[#171717] placeholder-[#A8A8A6] border-[#E7E7E5]'
                      }`}
                    />
                    <div className="absolute right-2 sm:right-2.5 flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded border border-[#E7E7E5] bg-white text-[10px] font-mono text-[#737373] flex items-center gap-0.5 shadow-2xs">
                        <Command size={10} />
                        <span>K</span>
                      </kbd>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Desktop only in mockup preview) */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-md border border-[#E7E7E5] bg-white text-xs font-medium text-[#737373] shadow-2xs flex items-center gap-1.5">
                    <Globe size={13} />
                    <span>Adicionar imagem</span>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-md bg-[#171717] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5">
                    <Plus size={14} />
                    <span>Adicionar por URL</span>
                  </div>
                </div>
              </div>

              {/* View Header & Filter Pills */}
              <div className="p-3.5 sm:p-5 pb-3">
                <div className="flex flex-wrap items-baseline justify-between gap-1.5 mb-3">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <h2 className="font-['Outfit'] font-extrabold text-base sm:text-xl text-[#171717] truncate">
                      Caixa de entrada
                    </h2>
                    <span className="font-mono text-[11px] sm:text-xs text-[#737373] transition-all duration-300 truncate">
                      [ {searchQuery.trim() ? `3 encontrados` : FILTER_COUNTS[activeFilter]} ]
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-[#737373]">
                    <span>Grade 3 colunas</span>
                  </div>
                </div>

                {/* Filter Pills with Interactive Click & Auto Animation Targets */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-['Inter']">
                  <button
                    ref={todasBtnRef}
                    data-demo-target="btn-todas"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      setActiveFilter('todas');
                    }}
                    className={`px-3 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                      activeFilter === 'todas' && !searchQuery.trim()
                        ? 'bg-[#171717] text-white shadow-xs'
                        : simulatedHover === 'todas'
                        ? 'bg-[#EDEDEA] text-[#171717] border border-[#D5D0C7]'
                        : 'bg-white border border-[#E7E7E5] text-[#737373] hover:text-[#171717]'
                    } ${activeFilter === 'todas' && isClicking ? 'scale-95' : ''}`}
                  >
                    Todas (24)
                  </button>

                  <button
                    ref={interfaceBtnRef}
                    data-demo-target="btn-interface"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      setActiveFilter('interface');
                    }}
                    className={`px-3 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                      activeFilter === 'interface' && !searchQuery.trim()
                        ? 'bg-[#171717] text-white shadow-xs'
                        : simulatedHover === 'interface'
                        ? 'bg-[#EDEDEA] text-[#171717] border border-[#D5D0C7]'
                        : 'bg-white border border-[#E7E7E5] text-[#737373] hover:text-[#171717]'
                    } ${activeFilter === 'interface' && isClicking ? 'scale-95' : ''}`}
                  >
                    #interface
                  </button>

                  <button
                    ref={editorialBtnRef}
                    data-demo-target="btn-editorial"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      setActiveFilter('editorial');
                    }}
                    className={`px-3 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                      activeFilter === 'editorial' && !searchQuery.trim()
                        ? 'bg-[#171717] text-white shadow-xs'
                        : simulatedHover === 'editorial'
                        ? 'bg-[#EDEDEA] text-[#171717] border border-[#D5D0C7]'
                        : 'bg-white border border-[#E7E7E5] text-[#737373] hover:text-[#171717]'
                    } ${activeFilter === 'editorial' && isClicking ? 'scale-95' : ''}`}
                  >
                    #editorial
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      setActiveFilter('dark-mode');
                    }}
                    className={`px-3 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                      activeFilter === 'dark-mode' && !searchQuery.trim()
                        ? 'bg-[#171717] text-white shadow-xs'
                        : 'bg-white border border-[#E7E7E5] text-[#737373] hover:text-[#171717]'
                    }`}
                  >
                    #dark-mode
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      setActiveFilter('design-system');
                    }}
                    className={`px-3 py-1 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                      activeFilter === 'design-system' && !searchQuery.trim()
                        ? 'bg-[#171717] text-white shadow-xs'
                        : 'bg-white border border-[#E7E7E5] text-[#737373] hover:text-[#171717]'
                    }`}
                  >
                    #design-system
                  </button>
                </div>
              </div>

              {/* 3 Real Dynamic Reference Cards in Grid (Faithfully Responsive to Active Filter or Search) */}
              <div className="p-5 pt-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(searchQuery.trim() ? HERO_CARDS['editorial'] : HERO_CARDS[activeFilter]).map((card, idx) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl border border-[#E7E7E5] overflow-hidden shadow-2xs hover:shadow-md transition-all group/card animate-hero-card"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Image Preview Container */}
                    <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover opacity-85 group-hover/card:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 font-mono text-[10px] bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                        {card.domain}
                      </span>
                      {card.starred && (
                        <span className="absolute top-2 right-2 text-amber-400">
                          <Star size={13} className="fill-amber-400" />
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-3">
                      <h3 className="font-['Outfit'] font-bold text-xs text-[#171717] mb-1 truncate" title={card.title}>
                        {card.title}
                      </h3>
                      
                      {/* Tags */}
                      <div className="flex items-center gap-1 mb-2.5 flex-wrap">
                        {card.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`font-mono text-[9px] px-1.5 py-0.5 rounded transition-colors ${getTagBadgeStyle(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Extracted 4-color palette bar */}
                      <div className="pt-2 border-t border-[#E7E7E5]/70 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {card.palette.map((hex, hexIdx) => {
                            const isCobaltTarget = card.id === 'linear' && hex === '#4355DB';
                            const isThisCopied = copiedHex === hex;
                            const isHovered = simulatedHover === 'swatch' && isCobaltTarget;
                            return (
                              <span
                                key={hexIdx}
                                ref={isCobaltTarget ? colorSwatchRef : undefined}
                                data-demo-target={isCobaltTarget ? 'swatch-cobalt' : undefined}
                                onClick={(e) => copyHex(hex, e)}
                                className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all duration-200 ${
                                  isThisCopied
                                    ? 'scale-125 ring-2 ring-[#4355DB] ring-offset-1 z-10'
                                    : isHovered
                                    ? 'scale-125 ring-2 ring-[#4355DB]/60 ring-offset-1 z-10'
                                    : 'hover:scale-115 border border-black/10'
                                }`}
                                style={{ backgroundColor: hex }}
                                title={`Copiar tom ${hex}`}
                              />
                            );
                          })}
                        </div>

                        <span className="font-mono text-[9px] text-[#A8A8A6] transition-colors">
                          {copiedHex && (card.id === 'linear' || card.palette.includes(copiedHex)) ? (
                            <span className="text-[#4355DB] font-semibold flex items-center gap-1">
                              <Check size={10} strokeWidth={2.5} />
                              Copiado!
                            </span>
                          ) : (
                            'Paleta 4 cores'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* THE FLOATING ORANGE-BORDERED TOAST POPOVER                                 */}
          {/* ========================================================================= */}
          <div className="absolute bottom-3 sm:bottom-6 left-3 right-3 sm:left-10 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-xs rounded-xl sm:rounded-2xl border-2 border-[#F06A38] shadow-[0_16px_40px_rgba(240,106,56,0.18)] p-3 sm:p-4.5 z-20 text-left font-['Inter'] pointer-events-none transition-all duration-300">
            <div className="space-y-2 text-xs font-medium text-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-[#F06A38] text-sm">✦</span>
                <span className="font-semibold text-slate-900 truncate">
                  URL capturada e screenshot 4K arquivado
                </span>
                <Check className="w-3.5 h-3.5 text-[#F06A38] ml-auto shrink-0 stroke-[2.5]" />
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[#F06A38] text-sm">🎨</span>
                <span className="text-slate-700 truncate">
                  Extração cromática detectou 4 tons dominantes
                </span>
                <Check className="w-3.5 h-3.5 text-[#F06A38] ml-auto shrink-0 stroke-[2.5]" />
              </div>

              <div className={`flex items-center gap-2.5 transition-all duration-300 ${copiedHex ? 'bg-indigo-50/80 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                <svg className="w-3.5 h-3.5 text-slate-900 shrink-0" viewBox="0 0 38 57" fill="currentColor">
                  <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0zM0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0zM0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5zM0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5zM19 0h9.5a9.5 9.5 0 1 1 0 19H19V0z"/>
                </svg>
                <span className={`truncate transition-colors ${copiedHex ? 'text-[#4355DB] font-semibold' : 'text-slate-700'}`}>
                  {copiedHex ? `Paleta extraída • Tom ${copiedHex} copiado` : 'Paleta de cores extraída de cada imagem'}
                </span>
                <Check className={`w-3.5 h-3.5 ml-auto shrink-0 stroke-[2.5] transition-all ${copiedHex ? 'text-[#4355DB] scale-110' : 'text-emerald-600'}`} />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DYNAMIC ANIMATED MOUSE CURSOR (Hidden on touch / mobile devices)           */}
          {/* ========================================================================= */}
          <div
            className={`hidden md:block absolute z-30 pointer-events-none transition-opacity duration-300 ${
              isUserHovering ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
              transition: `transform ${moveDuration}ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease`,
              left: 0,
              top: 0,
              width: '32px',
              height: '32px',
              willChange: 'transform',
            }}
          >
            {/* Visual Click Ripple Wave (Fires on Click Contact) */}
            {showRipple && (
              <div
                key={rippleKey}
                className="absolute -top-3.5 -left-3.5 w-9 h-9 rounded-full border-2 border-[#4355DB] bg-[#4355DB]/25 animate-demo-ripple pointer-events-none"
              />
            )}

            {/* Pointer Body with Click Scale Depression & Optical Glow */}
            <div
              className={`relative origin-top-left transition-transform duration-100 ${
                isClicking ? 'scale-[0.82] translate-y-0.5' : 'scale-100 translate-y-0'
              }`}
            >
              {/* Subtle Optical Halo behind Pointer Tip */}
              <div className="absolute -top-2.5 -left-2.5 w-8 h-8 rounded-full bg-[#4355DB]/20 blur-[3px] pointer-events-none" />

              {/* macOS Black Pointer with Crisp White Stroke */}
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] relative z-10"
                fill="none"
              >
                <path
                  d="M 3 3 L 10 20 L 13.5 13.5 L 20 10 L 3 3 Z"
                  fill="#0F172A"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

        </div>

        {/* 3 Genuine Value Chips Below the Window */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-slate-700 font-['Inter']">
          <div className="px-5 py-2 rounded-full bg-white border border-[#DDD5C7] shadow-2xs">
            Captura sem atrito em 1 clique
          </div>
          <div className="px-5 py-2 rounded-full bg-white border border-[#DDD5C7] shadow-2xs">
            Extração automática de paletas
          </div>
          <div className="px-5 py-2 rounded-full bg-white border border-[#DDD5C7] shadow-2xs">
            Biblioteca visual sem distrações
          </div>
        </div>

      </div>

    </section>
  );
};

