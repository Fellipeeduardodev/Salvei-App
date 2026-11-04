import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Palette,
  Layers,
  Type,
  Camera,
  BookOpen,
  Box,
  Film,
  Play,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

interface InspirationItem {
  id: string;
  category: 'web' | 'branding' | 'digital' | 'type' | 'mood' | 'print' | 'espaco' | 'motion';
  categoryLabel: string;
  badge: string;
  title: string;
  domain: string;
  sourceUrl: string;
  image: string;
  description: string;
  tags: string[];
  colors?: string[];
  metaBadge: string;
  typeSpecimen?: {
    letter: string;
    fontName: string;
  };
  motionMeta?: {
    duration: string;
    fps: string;
  };
}

const INSPIRATION_ITEMS: InspirationItem[] = [
  {
    id: 'insp-web-01',
    category: 'web',
    categoryLabel: 'Sites & Landing Pages',
    badge: 'WEB',
    title: 'Lumina — Estúdio de Arquitetura & Luz',
    domain: 'siteinspire.com',
    sourceUrl: 'https://siteinspire.com/showcase/lumina',
    image: '/brand/hero-variations/hero-02-editorial-showcase.webp',
    description: 'Landing page editorial com rolagem suave, microinterações e grid assimétrico suíço.',
    tags: ['#web', '#landing-page', '#minimalismo', '#suíço'],
    colors: ['#0B0F19', '#38BDF8', '#F1F5F9'],
    metaBadge: 'Web · 60fps',
  },
  {
    id: 'insp-brand-01',
    category: 'branding',
    categoryLabel: 'Identidades Visuais',
    badge: 'BRANDING',
    title: 'Kroma Studio — Sistema Gráfico & Papelaria',
    domain: 'behance.net',
    sourceUrl: 'https://behance.net/gallery/kroma-identity',
    image: '/brand/digital-design-system-spec-02.webp',
    description: 'Sistema completo de identidade visual, tipografia institucional e paleta contrastante.',
    tags: ['#branding', '#logotipo', '#paleta', '#design-system'],
    colors: ['#4355DB', '#F59E0B', '#10B981', '#18181B'],
    metaBadge: 'Identidade · Vetor',
  },
  {
    id: 'insp-digital-01',
    category: 'digital',
    categoryLabel: 'Interfaces & UI/UX',
    badge: 'DIGITAL',
    title: 'Workspace Grid & Arquitetura Dark Mode',
    domain: 'linear.app',
    sourceUrl: 'https://linear.app/method',
    image: '/brand/digital-interface-grid-01.webp',
    description: 'Alta densidade de informação, atalhos de teclado ágeis e tipografia monospaçada.',
    tags: ['#ui-ux', '#dark-mode', '#grid-system', '#linear'],
    colors: ['#121316', '#5E6AD2', '#8A99AD'],
    metaBadge: 'Figma · Dark UI',
  },
  {
    id: 'insp-type-01',
    category: 'type',
    categoryLabel: 'Tipografia & Fontes',
    badge: 'TYPE',
    title: 'Editorial New & Satoshi — Harmonia Suíça',
    domain: 'fontshare.com',
    sourceUrl: 'https://fontshare.com/specimen/satoshi',
    image: '/brand/editorial-typography-print-02.webp',
    description: 'Tipografia impressa em baixo-relevo com contrastes serifados e grotescos precisos.',
    tags: ['#tipografia', '#letterpress', '#swiss-type', '#serif'],
    colors: ['#EAE4D9', '#2C2B29', '#C2410C'],
    metaBadge: 'Type · Espécime',
    typeSpecimen: {
      letter: 'Aa',
      fontName: 'Editorial Serif 120pt',
    },
  },
  {
    id: 'insp-mood-01',
    category: 'mood',
    categoryLabel: 'Fotografia & Cores',
    badge: 'MOOD',
    title: 'Luz Natural, Grão Analógico & Cores Quentes',
    domain: 'are.na',
    sourceUrl: 'https://are.na/block/analog-light',
    image: '/brand/creator-portrait.webp',
    description: 'Fotografia 35mm com iluminação lateral quente, paleta terrosa e textura orgânica.',
    tags: ['#fotografia', '#moodboard', '#luz-natural', '#35mm'],
    colors: ['#D4B996', '#8B5E3C', '#2A201A', '#F7F3EE'],
    metaBadge: 'Mood · 35mm',
  },
  {
    id: 'insp-print-01',
    category: 'print',
    categoryLabel: 'Design Editorial',
    badge: 'PRINT',
    title: 'Monografia Suíça: Concreto, Grade & Ritmo',
    domain: 'kinfolk.com',
    sourceUrl: 'https://kinfolk.com/issue-42',
    image: '/brand/editorial-architecture-01.webp',
    description: 'Diagramação editorial rígida em 12 colunas para monografia arquitetônica contemporânea.',
    tags: ['#editorial', '#print', '#grid-suíço', '#diagramação'],
    colors: ['#1E1E1E', '#9E9E9E', '#FAFAFA'],
    metaBadge: 'Editorial · 300 DPI',
  },
  {
    id: 'insp-espaco-01',
    category: 'espaco',
    categoryLabel: 'Arquitetura & 3D',
    badge: 'ESPAÇO',
    title: 'Pavilhão Monolítico em Concreto Aparente',
    domain: 'dezeen.com',
    sourceUrl: 'https://dezeen.com/spatial-monolith',
    image: '/brand/hero-product-mockup-16x9.webp',
    description: 'Estudo volumétrico em 3D de concreto ripado com incidência solar zenital.',
    tags: ['#arquitetura', '#3d-render', '#brutalismo', '#luz'],
    colors: ['#27272A', '#71717A', '#F4F4F5'],
    metaBadge: 'Espaço · 3D Render',
  },
  {
    id: 'insp-motion-01',
    category: 'motion',
    categoryLabel: 'Motion & Vídeos',
    badge: 'MOTION',
    title: 'Kinetic Typography & Identidade em Movimento',
    domain: 'vimeo.com',
    sourceUrl: 'https://vimeo.com/kinetic-ident',
    image: '/brand/hero-variations/hero-03-layered-interface.webp',
    description: 'Animação fluida de tipografia cinética com curvas de aceleração exponencial em 60fps.',
    tags: ['#motion', '#kinetic', '#after-effects', '#60fps'],
    colors: ['#09090B', '#3B82F6', '#A1A1AA'],
    metaBadge: 'Motion · 60 FPS',
    motionMeta: {
      duration: '00:15',
      fps: '60 FPS',
    },
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Tudo', tag: 'TODOS', icon: Sparkles },
  { id: 'web', label: 'Sites & Landing Pages', tag: 'WEB', icon: Globe },
  { id: 'branding', label: 'Identidades Visuais', tag: 'BRANDING', icon: Palette },
  { id: 'digital', label: 'Interfaces & UI/UX', tag: 'DIGITAL', icon: Layers },
  { id: 'type', label: 'Tipografia & Fontes', tag: 'TYPE', icon: Type },
  { id: 'mood', label: 'Fotografia & Cores', tag: 'MOOD', icon: Camera },
  { id: 'print', label: 'Design Editorial', tag: 'PRINT', icon: BookOpen },
  { id: 'espaco', label: 'Arquitetura & 3D', tag: 'ESPAÇO', icon: Box },
  { id: 'motion', label: 'Motion & Vídeos', tag: 'MOTION', icon: Film },
];

const SAMPLE_CAPTURES = [
  { label: 'siteinspire.com', query: 'web', cardId: 'insp-web-01' },
  { label: 'fontshare.com', query: 'type', cardId: 'insp-type-01' },
  { label: 'linear.app', query: 'digital', cardId: 'insp-digital-01' },
  { label: 'dezeen.com', query: 'espaco', cardId: 'insp-espaco-01' },
];

export const LandingPillars: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['insp-web-01', 'insp-digital-01']));
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [captureFeedback, setCaptureFeedback] = useState<string | null>(null);

  // Toggle bookmark interaction
  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Copy color hex to clipboard
  const handleCopyColor = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Simulate instant capture test
  const handleSimulateCapture = (sample: typeof SAMPLE_CAPTURES[number]) => {
    setActiveCategory(sample.query);
    setSearchQuery('');
    setHighlightedId(sample.cardId);
    setCaptureFeedback(`✓ Link ${sample.label} capturado: metadados, imagem e paleta extraídos em 0.18s!`);
    setTimeout(() => setHighlightedId(null), 3000);
    setTimeout(() => setCaptureFeedback(null), 4500);
  };

  // Filter items based on activeCategory and searchQuery
  const filteredItems = useMemo(() => {
    return INSPIRATION_ITEMS.filter((item) => {
      // Category match
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Search query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDomain = item.domain.toLowerCase().includes(q);
      const matchCategory = item.categoryLabel.toLowerCase().includes(q) || item.badge.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchDomain || matchCategory || matchDesc || matchTags;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section className="py-20 md:py-32 bg-white" id="curadoria">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            1. SECTION HEADLINE & SUBTITLE (Tight Editorial Typography)
           ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="font-['Outfit'] font-black text-4xl sm:text-5xl lg:text-6xl text-slate-950 tracking-[-0.03em] mb-4 leading-[1.04]">
            O que você pode guardar no Salvei
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Qualquer faísca de inspiração que chame sua atenção na web. De sites inteiros e tipografia a paletas, interfaces e renders 3D — seu repertório organizado visualmente.
          </p>
        </div>

        {/* =========================================================================
            2. INTERACTIVE SEARCH BAR & SIMULATOR
           ========================================================================= */}
        <div className="max-w-2xl mx-auto mb-8 space-y-3">
          {/* Main Search Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
              <Search className="w-4 sm:w-5 h-4 sm:h-5 text-[#4355DB] transition-colors group-focus-within:text-[#4355DB]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por inspiração, site, estilo, cor ou tag (ex: minimalismo, dark, suíço)..."
              className="w-full pl-11 sm:pl-12 pr-28 py-3.5 sm:py-4 rounded-full border border-slate-300/90 bg-slate-50/70 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#4355DB] focus:bg-white focus:ring-4 focus:ring-[#4355DB]/10 transition-all shadow-2xs hover:border-slate-400"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Limpar busca"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
              <span className="text-[11px] font-['JetBrains_Mono'] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 hidden sm:inline-block">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
          </div>

          {/* Quick Simulation Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#4355DB]" />
              Testar captura:
            </span>
            {SAMPLE_CAPTURES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleSimulateCapture(sample)}
                className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-[#4355DB] hover:border-blue-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer shadow-2xs"
              >
                + {sample.label}
              </button>
            ))}
          </div>

          {/* Capture Toast Feedback Banner */}
          {captureFeedback ? (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-medium text-[#4355DB] text-center shadow-xs animate-fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{captureFeedback}</span>
            </div>
          ) : null}
        </div>

        {/* =========================================================================
            3. INTERACTIVE CATEGORY TABS / PILLS BAR
           ========================================================================= */}
        <div className="mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none sm:flex-wrap sm:justify-center">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count =
                cat.id === 'all'
                  ? INSPIRATION_ITEMS.length
                  : INSPIRATION_ITEMS.filter((i) => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`group relative shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-md shadow-slate-950/10'
                      : 'bg-slate-50/90 text-slate-700 border border-slate-200/90 hover:bg-white hover:text-slate-950 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <Icon
                    className={`w-3.5 sm:w-4 h-3.5 sm:h-4 transition-colors ${
                      isActive ? 'text-[#4355DB]' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-['JetBrains_Mono'] px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-slate-200/70 text-slate-500 font-medium'
                    }`}
                  >
                    {cat.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Notice if filtered */}
          {(activeCategory !== 'all' || searchQuery) && (
            <div className="flex items-center justify-between text-xs text-slate-500 max-w-4xl mx-auto pt-2 px-1">
              <span>
                Mostrando <strong className="text-slate-900">{filteredItems.length}</strong> de{' '}
                {INSPIRATION_ITEMS.length} inspirações curadas
                {activeCategory !== 'all' && (
                  <>
                    {' '}
                    em <strong className="text-[#4355DB]">{CATEGORIES.find((c) => c.id === activeCategory)?.label}</strong>
                  </>
                )}
                {searchQuery && (
                  <>
                    {' '}
                    para &quot;<strong className="text-slate-900">{searchQuery}</strong>&quot;
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="text-[#4355DB] hover:underline font-semibold cursor-pointer"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            4. THE LIVING INSPIRATION SHOWCASE (Bento / Cards Grid)
           ========================================================================= */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-300 max-w-md mx-auto my-8 bg-slate-50/50">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h4 className="font-['Outfit'] font-bold text-lg text-slate-900 mb-1">
              Nenhuma referência encontrada
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Tente buscar por &quot;web&quot;, &quot;suíço&quot;, &quot;dark&quot;, &quot;branding&quot; ou explore outra categoria.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              Ver todas as referências
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-24 md:mb-32">
            {filteredItems.map((item) => {
              const isSaved = savedIds.has(item.id);
              const isHighlighted = highlightedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-[26px] border bg-white flex flex-col justify-between overflow-hidden group transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1.5 ${
                    isHighlighted
                      ? 'border-[#4355DB] ring-4 ring-[#4355DB]/20'
                      : 'border-slate-200/90 hover:border-[#4355DB]/50'
                  }`}
                >
                  {/* Card Media Header */}
                  <div className="relative aspect-16/10 sm:aspect-4/3 overflow-hidden bg-slate-950">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" decoding="async" />

                    {/* Gradient Overlay for Top Badges Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 pointer-events-none" />

                    {/* Top Row: Domain / Source Pill + Bookmark Button */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-['JetBrains_Mono'] text-white shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4355DB]" />
                        <span className="font-medium truncate max-w-[120px]">{item.domain}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleSave(item.id, e)}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-xs ${
                          isSaved
                            ? 'bg-[#4355DB] text-white border-[#4355DB]'
                            : 'bg-black/50 text-white/90 border-white/20 hover:bg-white hover:text-slate-900'
                        }`}
                        title={isSaved ? 'Referência salva no Salvei' : 'Salvar no Salvei'}
                        aria-label={isSaved ? 'Referência salva no Salvei' : 'Salvar no Salvei'}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Bottom of Image: Format Specific Rich Details */}
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
                      {/* Format Badge */}
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs border border-white/10">
                        {item.metaBadge}
                      </span>

                      {/* Interactive Palette Dots */}
                      {item.colors && item.colors.length > 0 && (
                        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
                          {item.colors.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={(e) => handleCopyColor(hex, e)}
                              className="w-3.5 h-3.5 rounded-full border border-white/30 hover:scale-125 transition-transform cursor-pointer relative group/dot"
                              style={{ backgroundColor: hex }}
                              title={`Copiar ${hex}`}
                              aria-label={`Copiar cor ${hex}`}
                            >
                              <span className="sr-only">{hex}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Type Specimen Floating Badge */}
                      {item.typeSpecimen && (
                        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 text-[10px] font-['Outfit'] font-bold text-white">
                          <span>{item.typeSpecimen.letter}</span>
                          <span className="text-slate-400 font-normal">Specimen</span>
                        </div>
                      )}

                      {/* Motion Play Overlay */}
                      {item.motionMeta && (
                        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 text-[10px] font-['JetBrains_Mono'] text-white">
                          <Play className="w-2.5 h-2.5 fill-white" />
                          <span>{item.motionMeta.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category Label Pill */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-['JetBrains_Mono'] font-semibold tracking-wider uppercase text-[#4355DB]">
                          {item.categoryLabel}
                        </span>
                        <span className="text-[10px] font-['JetBrains_Mono'] text-slate-400 uppercase tracking-widest font-semibold">
                          {item.badge}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-['Outfit'] font-bold text-base text-slate-950 group-hover:text-[#4355DB] transition-colors line-clamp-1 mb-1.5 leading-snug">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2 mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div>
                      {/* Tags Bar */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                        {item.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSearchQuery(t.replace('#', ''))}
                            className="text-[10px] font-['JetBrains_Mono'] text-slate-500 hover:text-[#4355DB] hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors"
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Footer Actions / State */}
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100/70 text-xs text-slate-400">
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          {isSaved ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-emerald-700 font-semibold">Salvo no seu Ateliê</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              <span>Pronto para guardar</span>
                            </>
                          )}
                        </span>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#4355DB] hover:text-slate-950 flex items-center gap-0.5 font-semibold text-[11px] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Fonte</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Temporary Copied Hex Toast */}
        {copiedHex && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white text-xs font-['JetBrains_Mono'] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800 animate-fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cor {copiedHex} copiada para a área de transferência!</span>
          </div>
        )}

        {/* =========================================================================
            5. THREE PILLARS (Simples, Silencioso e Privado)
           ========================================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16 pt-8 border-t border-slate-200/80">
          <h2 className="font-['Outfit'] font-black text-4xl sm:text-5xl text-slate-950 tracking-[-0.03em] mb-3 leading-[1.05]">
            Simples, silencioso e privado
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-slate-600 font-normal">
            Três pilares fundamentais para você criar com tranquilidade, sem ruído e com foco no seu repertório.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          
          {/* Pillar 1 */}
          <div className="rounded-[32px] border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/70 hover:border-[#4355DB]/40 p-8 shadow-xs hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4355DB] border border-blue-200/60 flex items-center justify-center mb-6 shadow-2xs group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-['Outfit'] font-bold text-xl text-slate-950 mb-2.5">
                Salve de Qualquer Lugar
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
                Cole links de qualquer site, blog, rede social ou solte imagens direto do seu computador. O Salvei cuida de formatar o card perfeitamente.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200/70 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4355DB] shrink-0" />
                <span>Captura instantânea de URL</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4355DB] shrink-0" />
                <span>Colagem direta do clipboard (Ctrl+V)</span>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-[32px] border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/70 hover:border-[#4355DB]/40 p-8 shadow-xs hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4355DB] border border-indigo-200/60 flex items-center justify-center mb-6 shadow-2xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-['Outfit'] font-bold text-xl text-slate-950 mb-2.5">
                100% Pessoal e Privado
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
                Seu espaço é o seu ateliê. Sem feed social para te distrair, sem contagem de likes e sem vender seu repertório para algoritmos de anúncios.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200/70 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4355DB] shrink-0" />
                <span>Zero anúncios ou feeds públicos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4355DB] shrink-0" />
                <span>Seus dados pertencem apenas a você</span>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-[32px] border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/70 hover:border-[#4355DB]/40 p-8 shadow-xs hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4355DB] border border-blue-200/60 flex items-center justify-center mb-6 shadow-2xs group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-['Outfit'] font-bold text-xl text-slate-950 mb-2.5">
                Sempre no Seu Ritmo
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
                Acesse no computador, tablet ou direto pelo navegador do celular com sincronização imediata em segundo plano para você criar sem atrito.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200/70 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4355DB] shrink-0" />
                <span>Sincronizado entre todos os dispositivos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4355DB] shrink-0" />
                <span>Leve, rápido e sem instalar nada pesado</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
