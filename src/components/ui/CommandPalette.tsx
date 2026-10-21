import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Command,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  Globe,
  Inbox,
  Briefcase,
  Layers,
  Tag,
  SlidersHorizontal,
  CheckSquare,
  HelpCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { Reference, NavigationDestination } from '../../types/reference';
import { normalizeText } from '../../lib/searchAndFilter';

interface CommandPaletteAction {
  id: string;
  category: 'Ações' | 'Navegação' | 'Referências';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  references: Reference[];
  onNavigate: (dest: NavigationDestination) => void;
  onOpenAddModal: (mode: 'image' | 'url') => void;
  onSelectReference: (ref: Reference) => void;
  onSelectAllVisible?: () => void;
  onOpenShortcutsModal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  references,
  onNavigate,
  onOpenAddModal,
  onSelectReference,
  onSelectAllVisible,
  onOpenShortcutsModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const defaultActions: CommandPaletteAction[] = useMemo(() => {
    return [
      {
        id: 'action-add-url',
        category: 'Ações',
        title: 'Adicionar referência por URL',
        subtitle: 'Salva um novo site ou página web canônica',
        icon: <Globe size={15} className="text-[#4355DB]" />,
        shortcut: 'N',
        onSelect: () => {
          onClose();
          onOpenAddModal('url');
        },
      },
      {
        id: 'action-add-image',
        category: 'Ações',
        title: 'Adicionar imagem local',
        subtitle: 'Importa capturas de tela e arquivos visuais',
        icon: <ImageIcon size={15} className="text-[#4355DB]" />,
        onSelect: () => {
          onClose();
          onOpenAddModal('image');
        },
      },
      ...(onSelectAllVisible
        ? [
            {
              id: 'action-select-all',
              category: 'Ações' as const,
              title: 'Selecionar todas as referências visíveis',
              subtitle: 'Ativa o modo de seleção múltipla em lote',
              icon: <CheckSquare size={15} className="text-[#171717]" />,
              shortcut: 'Ctrl+A',
              onSelect: () => {
                onClose();
                onSelectAllVisible();
              },
            },
          ]
        : []),
      ...(onOpenShortcutsModal
        ? [
            {
              id: 'action-shortcuts',
              category: 'Ações' as const,
              title: 'Atalhos de teclado e produtividade',
              subtitle: 'Exibe a lista completa de comandos rápidos',
              icon: <HelpCircle size={15} className="text-[#737373]" />,
              shortcut: '?',
              onSelect: () => {
                onClose();
                onOpenShortcutsModal();
              },
            },
          ]
        : []),
      {
        id: 'nav-inbox',
        category: 'Navegação',
        title: 'Ir para Caixa de entrada',
        subtitle: 'Biblioteca geral de referências',
        icon: <Inbox size={15} className="text-[#737373]" />,
        onSelect: () => {
          onClose();
          onNavigate('inbox');
        },
      },
      {
        id: 'nav-projects',
        category: 'Navegação',
        title: 'Ir para Projetos',
        subtitle: 'Visualizar sprints e entregáveis',
        icon: <Briefcase size={15} className="text-[#737373]" />,
        onSelect: () => {
          onClose();
          onNavigate('projects');
        },
      },
      {
        id: 'nav-collections',
        category: 'Navegação',
        title: 'Ir para Coleções',
        subtitle: 'Curadorias temáticas atemporais',
        icon: <Layers size={15} className="text-[#737373]" />,
        onSelect: () => {
          onClose();
          onNavigate('collections');
        },
      },
      {
        id: 'nav-tags',
        category: 'Navegação',
        title: 'Ir para Etiquetas',
        subtitle: 'Índice taxonômico de marcadores',
        icon: <Tag size={15} className="text-[#737373]" />,
        onSelect: () => {
          onClose();
          onNavigate('tags');
        },
      },
      {
        id: 'nav-settings',
        category: 'Navegação',
        title: 'Ir para Configurações',
        subtitle: 'Preferências e integridade da conta',
        icon: <SlidersHorizontal size={15} className="text-[#737373]" />,
        onSelect: () => {
          onClose();
          onNavigate('settings');
        },
      },
    ];
  }, [onClose, onOpenAddModal, onNavigate, onSelectAllVisible, onOpenShortcutsModal]);

  // Reference matches when searching
  const filteredItems = useMemo(() => {
    const clean = normalizeText(query);
    if (!clean) return defaultActions;

    const matchedActions = defaultActions.filter(
      (a) =>
        normalizeText(a.title).includes(clean) ||
        (a.subtitle && normalizeText(a.subtitle).includes(clean))
    );

    const matchedReferences: CommandPaletteAction[] = references
      .filter((r) => {
        return (
          normalizeText(r.title).includes(clean) ||
          (r.domain && normalizeText(r.domain).includes(clean)) ||
          (r.tags && r.tags.some((t) => normalizeText(t).includes(clean)))
        );
      })
      .slice(0, 8)
      .map((ref) => ({
        id: `ref-${ref.id}`,
        category: 'Referências' as const,
        title: ref.title,
        subtitle: ref.domain || (ref.tags ? `#${ref.tags.join(' #')}` : 'Referência visual'),
        icon: ref.screenshotUrl ? (
          <img
            src={ref.screenshotUrl}
            alt=""
            className="w-4 h-4 rounded-xs object-cover border border-[#E7E7E5]"
          />
        ) : (
          <Globe size={15} className="text-[#A8A8A6]" />
        ),
        shortcut: 'Enter',
        onSelect: () => {
          onClose();
          onSelectReference(ref);
        },
      }));

    return [...matchedActions, ...matchedReferences];
  }, [query, defaultActions, references, onClose, onSelectReference]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].onSelect();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedIndex, filteredItems]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu de comandos e busca rápida"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-[#0F0F0F]/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#E7E7E5] rounded-lg shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Search Input */}
        <div className="flex items-center px-4 h-12 border-b border-[#E7E7E5] bg-white gap-3">
          <Command size={16} className="text-[#737373] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Digite um comando ou busque em suas referências..."
            className="flex-1 h-full bg-transparent text-sm text-[#171717] placeholder-[#A8A8A6] outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#737373] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-[#E7E7E5] bg-[#F8F8F6] font-mono text-[10px] text-[#A8A8A6]">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2 flex flex-col gap-0.5 divide-y divide-[#E7E7E5]/50"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-1">
              <Search size={20} className="text-[#A8A8A6] mb-1" />
              <p className="font-sans text-xs font-semibold text-[#171717]">
                Nenhum resultado para "{query}"
              </p>
              <p className="font-sans text-[11px] text-[#737373]">
                Tente buscar por outro termo, domínio ou etiqueta.
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-selected={isSelected}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-sm transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#F1F1EF] text-[#171717]' : 'hover:bg-[#F8F8F6] text-[#737373]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-sans text-xs font-medium text-[#171717] truncate">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="font-mono text-[10px] text-[#737373] truncate">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E7E7E5] font-mono text-[10px] text-[#A8A8A6] shadow-2xs">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <ArrowRight size={13} className="text-[#4355DB] hidden sm:block" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-[#F8F8F6] border-t border-[#E7E7E5] flex items-center justify-between text-[11px] text-[#A8A8A6] font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ para navegar</span>
            <span>↵ para executar</span>
          </div>
          <span>Curator Productivity</span>
        </div>
      </div>
    </div>
  );
};
