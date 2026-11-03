import React, { useState, useMemo } from 'react';
import { SharedCollectionData, SharedReferenceItem } from '../../lib/collectionSharing';
import { Reference, ColorPaletteItem } from '../../types/reference';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { MoodboardView } from '../../components/references/MoodboardView';
import { PresentationMode } from '../../components/presentation/PresentationMode';
import {
  LayoutGrid,
  Move,
  Maximize2,
  Moon,
  Sun,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  Search,
  Sparkles,
  Palette,
  Download,
  Share2,
  X,
  Layers,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  exportPaletteAsFigmaTokens,
  exportPaletteAsTailwind,
  exportPaletteAsCss,
} from '../../lib/colorExtractor';

interface PublicMoodboardViewProps {
  collectionData: SharedCollectionData;
  onExit?: () => void;
  onGoToAuth?: (mode: 'login' | 'signup') => void;
  isOwnerPreview?: boolean;
}

export const PublicMoodboardView: React.FC<PublicMoodboardViewProps> = ({
  collectionData,
  onExit,
  onGoToAuth,
  isOwnerPreview = false,
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  const [viewMode, setViewMode] = useState<'grid' | 'moodboard'>('grid');
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Card Inspection Modal State
  const [inspectingItem, setInspectingItem] = useState<SharedReferenceItem | null>(null);
  const [exportedPaletteFeedback, setExportedPaletteFeedback] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    collectionData.references.forEach((r) => r.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [collectionData.references]);

  // Filtered references
  const filteredReferences = useMemo(() => {
    return collectionData.references.filter((ref) => {
      if (selectedTag && !ref.tags?.includes(selectedTag)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (ref.title || '').toLowerCase().includes(q);
        const matchesDomain = (ref.domain || '').toLowerCase().includes(q);
        const matchesTags = ref.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDomain && !matchesTags) return false;
      }
      return true;
    });
  }, [collectionData.references, selectedTag, searchQuery]);

  // Transform SharedReferenceItem to Reference for compatible components
  const compatibleReferences: Reference[] = useMemo(() => {
    return filteredReferences.map((item) => ({
      id: item.id,
      title: item.title || '',
      url: item.url || '',
      domain: item.domain || '',
      sourceType: 'both',
      screenshotUrl: item.screenshotUrl,
      screenshotStatus: 'ready',
      tags: item.tags || [],
      palette: item.palette || [],
      notesMarkdown: item.notesMarkdown ?? '',
      isFavorite: false,
      collectionIds: [collectionData.id],
      projectIds: [],
      codeSnippets: [],
      relatedFiles: [],
      createdAt: collectionData.createdAt || new Date().toISOString(),
      updatedAt: collectionData.createdAt || new Date().toISOString(),
    }));
  }, [filteredReferences, collectionData]);

  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleExportPalette = (format: 'figma' | 'tailwind' | 'css', item: SharedReferenceItem) => {
    if (!item.palette || item.palette.length === 0) return;
    let code = '';
    if (format === 'figma') {
      code = exportPaletteAsFigmaTokens(item.title, item.palette);
    } else if (format === 'tailwind') {
      code = exportPaletteAsTailwind(item.title, item.palette);
    } else if (format === 'css') {
      code = exportPaletteAsCss(item.title, item.palette);
    }
    navigator.clipboard.writeText(code);
    setExportedPaletteFeedback(`${format.toUpperCase()} copiado!`);
    setTimeout(() => setExportedPaletteFeedback(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0E0F12] text-[#171717] dark:text-[#F3F4F6] font-sans flex flex-col selection:bg-[#4355DB]/20">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#12141A]/90 backdrop-blur-md border-b border-[#E7E7E5] dark:border-[#22252E] px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Collection Pill */}
          <div className="flex items-center gap-3">
            {onExit ? (
              <button
                type="button"
                onClick={onExit}
                className="flex items-center gap-1.5 text-xs font-mono text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer mr-1"
                title="Voltar ao Workspace"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            ) : null}

            <a
              href={typeof window !== 'undefined' ? `${window.location.origin}/?landing=true` : '/'}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Logo size={24} variant="horizontal" />
            </a>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E7E7E5] dark:border-[#262A34]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4355DB]/10 dark:bg-[#4355DB]/20 text-[#4355DB] dark:text-[#6375F1] border border-[#4355DB]/20">
                Moodboard Público
              </span>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#F1F1EF] dark:bg-[#1A1D24] border border-[#E7E7E5] dark:border-[#262A34] rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#252833] text-[#171717] dark:text-white shadow-xs font-medium'
                    : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white'
                }`}
                title="Visualização em Grade Editorial"
              >
                <LayoutGrid size={14} />
                <span className="hidden md:inline">Grade</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('moodboard')}
                className={`p-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'moodboard'
                    ? 'bg-white dark:bg-[#252833] text-[#171717] dark:text-white shadow-xs font-medium'
                    : 'text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white'
                }`}
                title="Mural Canvas Livre"
              >
                <Move size={14} />
                <span className="hidden md:inline">Mural Canvas</span>
              </button>
            </div>

            {/* Presentation Mode button */}
            <button
              type="button"
              onClick={() => setIsPresentationOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border border-[#E7E7E5] dark:border-[#262A34] hover:bg-[#F1F1EF] dark:hover:bg-[#1A1D24] text-xs font-mono text-[#52525B] dark:text-[#D1D5DB] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Apresentar em tela cheia (Slideshow)"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">Apresentar</span>
            </button>

            {/* Share link copy */}
            <button
              type="button"
              onClick={handleCopyShareLink}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border transition-colors cursor-pointer text-xs font-mono flex items-center gap-1.5 ${
                copiedLink
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                  : 'border-[#E7E7E5] dark:border-[#262A34] hover:bg-[#F1F1EF] dark:hover:bg-[#1A1D24] text-[#52525B] dark:text-[#D1D5DB]'
              }`}
              title="Copiar link deste moodboard"
            >
              {copiedLink ? <Check size={13} /> : <Share2 size={13} />}
              <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-md border border-[#E7E7E5] dark:border-[#262A34] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Alternar tema claro/escuro"
            >
              {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* CTA: Create Acervo */}
            {!isOwnerPreview && onGoToAuth && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onGoToAuth('signup')}
                className="cursor-pointer ml-1 text-xs"
              >
                Criar Meu Acervo
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Presentation Header */}
      <div className="w-full border-b border-[#E7E7E5] dark:border-[#22252E] bg-white dark:bg-[#12141A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#4355DB] dark:text-[#6375F1] tracking-wider uppercase mb-2">
                <Layers size={13} />
                <span>Curadoria Temática & Moodboard</span>
              </div>

              <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-[#171717] dark:text-white tracking-tight leading-tight">
                {collectionData.name}
              </h1>

              {collectionData.description && (
                <p className="font-sans text-sm sm:text-base text-[#737373] dark:text-[#9CA3AF] mt-2.5 leading-relaxed">
                  {collectionData.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-[#A8A8A6] dark:text-[#6B7280]">
                <span className="px-2 py-0.5 rounded bg-[#F1F1EF] dark:bg-[#1A1D24] text-[#52525B] dark:text-[#A1A1AA] border border-[#E7E7E5] dark:border-[#262A34]">
                  {collectionData.references.length}{' '}
                  {collectionData.references.length === 1 ? 'referência' : 'referências'}
                </span>
                {collectionData.authorName && (
                  <span>• Organizado por {collectionData.authorName}</span>
                )}
                <span>• Visualização pública somente leitura</span>
              </div>
            </div>

            {/* Live Search Input */}
            <div className="w-full md:w-72 shrink-0">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A8A6] dark:text-[#6B7280]"
                />
                <input
                  type="text"
                  placeholder="Filtrar por título, domínio ou tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#F9F9FB] dark:bg-[#171920] border border-[#E7E7E5] dark:border-[#262A34] rounded-md text-[#171717] dark:text-white placeholder-[#A8A8A6] dark:placeholder-[#6B7280] focus:outline-hidden focus:border-[#4355DB] dark:focus:border-[#6375F1] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717] dark:hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tags Pills Bar */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-6 pt-5 border-t border-[#E7E7E5] dark:border-[#22252E]">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  selectedTag === null
                    ? 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-semibold'
                    : 'bg-[#F1F1EF] dark:bg-[#1A1D24] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                Todas ({collectionData.references.length})
              </button>

              {allTags.map((tag) => {
                const count = collectionData.references.filter((r) => r.tags?.includes(tag)).length;
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#4355DB] text-white font-semibold'
                        : 'bg-[#F1F1EF] dark:bg-[#1A1D24] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span className="opacity-60 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {filteredReferences.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-[#E7E7E5] dark:border-[#262A34] rounded-lg">
            <p className="font-sans text-sm text-[#737373] dark:text-[#9CA3AF]">
              Nenhuma referência encontrada para os filtros selecionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="mt-3 text-xs font-mono text-[#4355DB] dark:text-[#6375F1] underline cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Editorial Grid Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReferences.map((item) => {
              const thumb =
                item.screenshotUrl ||
                'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
              return (
                <article
                  key={item.id}
                  onClick={() => setInspectingItem(item)}
                  className="group bg-white dark:bg-[#14161B] border border-[#E7E7E5] dark:border-[#22252E] hover:border-[#4355DB] dark:hover:border-[#6375F1] rounded-lg overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-16/10 bg-[#F1F1EF] dark:bg-[#1C1E26] overflow-hidden">
                    <img
                      src={thumb}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-300"
                    />

                    {/* Domain pill */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono border border-white/10 flex items-center gap-1 shadow-xs">
                      <span>{item.domain}</span>
                    </div>

                    {/* Open link external button */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded bg-black/75 backdrop-blur-xs text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Visitar URL externa"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-1 gap-2.5">
                    <h3 className="font-sans font-semibold text-sm text-[#171717] dark:text-[#F3F4F6] line-clamp-2 leading-snug group-hover:text-[#4355DB] dark:group-hover:text-[#6375F1] transition-colors">
                      {item.title}
                    </h3>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] text-[#737373] dark:text-[#9CA3AF] bg-[#F1F1EF] dark:bg-[#1D1F27] px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="font-mono text-[10px] text-[#A8A8A6] dark:text-[#6B7280]">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Color Swatches */}
                    {item.palette && item.palette.length > 0 && (
                      <div
                        className="pt-2 border-t border-[#E7E7E5] dark:border-[#22252E] flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          {item.palette.slice(0, 4).map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={(e) => handleCopyHex(c.hex, e)}
                              className="w-5 h-5 rounded-xs border border-black/10 dark:border-white/10 relative transition-transform hover:scale-120 cursor-pointer"
                              style={{ backgroundColor: c.hex }}
                              title={`Copiar ${c.hex} (${c.name || c.role || 'Tom'})`}
                            />
                          ))}
                        </div>

                        <span className="font-mono text-[10px] text-[#A8A8A6] dark:text-[#6B7280]">
                          {item.palette.length} cores
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Mural Canvas Mode */
          <div className="w-full h-[78vh] rounded-xl border border-[#E7E7E5] dark:border-[#22252E] overflow-hidden bg-[#111217]">
            <MoodboardView
              references={compatibleReferences}
              onSelectReference={(ref) => {
                const item = collectionData.references.find((r) => r.id === ref.id);
                if (item) setInspectingItem(item);
              }}
            />
          </div>
        )}
      </main>

      {/* Floating Copied Hex Toast */}
      {copiedHex && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-mono text-xs font-semibold px-4 py-2.5 rounded-md shadow-2xl animate-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-xs border border-white/20" style={{ backgroundColor: copiedHex }} />
          <span>Hex {copiedHex} copiado!</span>
        </div>
      )}

      {/* Presentation Mode Slideshow */}
      <PresentationMode
        references={compatibleReferences}
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />

      {/* Card Inspection Modal */}
      {inspectingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setInspectingItem(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#14161C] border border-[#E7E7E5] dark:border-[#282B35] rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden text-[#171717] dark:text-[#F3F4F6] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Preview Image */}
            <div className="md:w-3/5 bg-[#0C0D10] relative flex items-center justify-center min-h-[260px] md:min-h-[460px] p-4 overflow-hidden">
              <img
                src={
                  inspectingItem.screenshotUrl ||
                  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80'
                }
                alt={inspectingItem.title}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-md shadow-md"
              />

              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/80 backdrop-blur-xs text-white text-xs font-mono border border-white/10">
                {inspectingItem.domain}
              </div>
            </div>

            {/* Right Details Panel */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-sans font-bold text-lg text-[#171717] dark:text-white leading-snug">
                    {inspectingItem.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setInspectingItem(null)}
                    className="p-1.5 rounded-md text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white hover:bg-[#F1F1EF] dark:hover:bg-[#1D1F27] transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* External Link */}
                <a
                  href={inspectingItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#4355DB] dark:text-[#6375F1] hover:underline"
                >
                  <span>{inspectingItem.url}</span>
                  <ExternalLink size={12} />
                </a>

                {/* Tags */}
                {inspectingItem.tags && inspectingItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {inspectingItem.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-xs bg-[#F1F1EF] dark:bg-[#1E2029] text-[#52525B] dark:text-[#A1A1AA] px-2 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {inspectingItem.notesMarkdown && (
                  <div className="p-3 rounded bg-[#F9F9FB] dark:bg-[#181920] border border-[#E7E7E5] dark:border-[#262A34] text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed whitespace-pre-wrap font-sans">
                    {inspectingItem.notesMarkdown}
                  </div>
                )}

                {/* Palette and Exports */}
                {inspectingItem.palette && inspectingItem.palette.length > 0 && (
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-[#E7E7E5] dark:border-[#262A34]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#737373] dark:text-[#9CA3AF] flex items-center gap-1">
                        <Palette size={12} />
                        <span>Paleta Cromática</span>
                      </span>
                      {exportedPaletteFeedback && (
                        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                          {exportedPaletteFeedback}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {inspectingItem.palette.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={(e) => handleCopyHex(c.hex, e)}
                          className="p-2 rounded-md border border-[#E7E7E5] dark:border-[#262A34] hover:border-[#4355DB] dark:hover:border-[#6375F1] bg-[#FDFDFD] dark:bg-[#181A22] flex items-center gap-2.5 cursor-pointer text-left transition-colors"
                        >
                          <div
                            className="w-5 h-5 rounded-xs border border-black/15 dark:border-white/15 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-xs font-semibold text-[#171717] dark:text-white">
                              {c.hex}
                            </div>
                            <div className="font-mono text-[10px] text-[#737373] dark:text-[#9CA3AF] truncate">
                              {c.name || c.role || 'Tom'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Quick export formats */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleExportPalette('figma', inspectingItem)}
                        className="px-2 py-1 rounded bg-[#F1F1EF] dark:bg-[#1E2029] text-[10px] font-mono hover:text-[#4355DB] dark:hover:text-[#6375F1] transition-colors cursor-pointer"
                      >
                        Copiar Tokens Figma
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportPalette('tailwind', inspectingItem)}
                        className="px-2 py-1 rounded bg-[#F1F1EF] dark:bg-[#1E2029] text-[10px] font-mono hover:text-[#4355DB] dark:hover:text-[#6375F1] transition-colors cursor-pointer"
                      >
                        Tailwind
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportPalette('css', inspectingItem)}
                        className="px-2 py-1 rounded bg-[#F1F1EF] dark:bg-[#1E2029] text-[10px] font-mono hover:text-[#4355DB] dark:hover:text-[#6375F1] transition-colors cursor-pointer"
                      >
                        CSS
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Inspection Footer CTA */}
              <div className="pt-4 border-t border-[#E7E7E5] dark:border-[#262A34] mt-6 flex items-center justify-between">
                <a
                  href={inspectingItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171717] dark:text-white hover:text-[#4355DB] dark:hover:text-[#6375F1]"
                >
                  <span>Abrir website</span>
                  <ExternalLink size={12} />
                </a>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectingItem(null)}
                  className="cursor-pointer text-xs"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Public Footer */}
      <footer className="border-t border-[#E7E7E5] dark:border-[#22252E] bg-white dark:bg-[#12141A] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Logo size={20} variant="horizontal" />
            <span className="font-mono text-xs text-[#737373] dark:text-[#9CA3AF]">
              — O acervo visual para designers e criativos
            </span>
          </div>

          <div className="flex items-center gap-4">
            {!isOwnerPreview && onGoToAuth && (
              <button
                type="button"
                onClick={() => onGoToAuth('signup')}
                className="text-xs font-mono text-[#4355DB] dark:text-[#6375F1] hover:underline cursor-pointer font-semibold"
              >
                Crie seu acervo gratuito no Salvei →
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
