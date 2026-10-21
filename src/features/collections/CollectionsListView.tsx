import React, { useState } from 'react';
import { Collection, Reference } from '../../types/reference';
import { Layers, Plus, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface CollectionsListViewProps {
  collections: Collection[];
  references: Reference[];
  onSelectCollection: (collectionId: string) => void;
  onCreateCollection: (name: string, description?: string) => void;
  onEditCollection: (id: string, name: string, description?: string) => void;
  onDeleteCollection: (id: string) => void;
}

export const CollectionsListView: React.FC<CollectionsListViewProps> = ({
  collections,
  references,
  onSelectCollection,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Editing state
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete confirmation
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null);

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewName('');
    setNewDescription('');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateCollection(newName.trim(), newDescription.trim() || undefined);
    setIsCreating(false);
  };

  const handleStartEdit = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollectionId(col.id);
    setEditName(col.name);
    setEditDescription(col.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollectionId || !editName.trim()) return;
    onEditCollection(editingCollectionId, editName.trim(), editDescription.trim() || undefined);
    setEditingCollectionId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-[#171717] tracking-tight">
            Coleções
          </h1>
          <p className="font-sans text-xs md:text-sm text-[#737373] mt-0.5">
            Curadorias temáticas de linguagens visuais, padrões de UI e arquivos de design.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleStartCreate}
          iconLeft={<Plus size={14} strokeWidth={2.5} />}
          className="self-start sm:self-auto cursor-pointer"
        >
          Nova coleção
        </Button>
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <form
          onSubmit={handleSaveCreate}
          className="p-5 bg-white border border-[#4355DB] rounded-sm flex flex-col gap-3 shadow-xs animate-in fade-in duration-100"
        >
          <div className="flex items-center justify-between">
            <span className="font-sans font-bold text-sm text-[#171717]">
              Criar Nova Coleção
            </span>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-[#737373] hover:text-[#171717] cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da coleção (ex: Minimalismo Editorial, Dark Mode Devtools)"
            autoFocus
            required
            className="w-full text-sm font-semibold text-[#171717] px-3 py-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] focus:bg-white focus:border-[#4355DB] outline-none"
          />

          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Conceito, padrão visual ou anotações temáticas da coleção..."
            rows={2}
            className="w-full text-xs text-[#171717] p-3 rounded bg-[#F8F8F6] border border-[#E7E7E5] focus:bg-white focus:border-[#4355DB] outline-none resize-none"
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={!newName.trim()}>
              Criar coleção
            </Button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="py-20 bg-white border border-[#E7E7E5] rounded-sm p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#F1F1EF] text-[#737373] flex items-center justify-center mb-3">
            <Layers size={22} strokeWidth={1.8} />
          </div>
          <h3 className="font-sans font-semibold text-base text-[#171717] mb-1">
            Nenhuma coleção criada ainda
          </h3>
          <p className="font-sans text-xs text-[#737373] max-w-sm mb-4">
            Coleções reúnem materiais com afinidades estéticas, linguagens de layout ou componentes específicos.
          </p>
          <Button variant="primary" size="sm" onClick={handleStartCreate}>
            Criar primeira coleção
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => {
            const colRefs = references.filter((r) => r.collectionIds?.includes(col.id));
            const count = colRefs.length;
            const topThumbs = colRefs
              .map((r) => r.screenshotUrl)
              .filter(Boolean)
              .slice(0, 3);

            return (
              <div
                key={col.id}
                onClick={() => onSelectCollection(col.id)}
                className="group relative bg-white border border-[#E7E7E5] hover:border-[#D4D4D0] rounded-sm overflow-hidden cursor-pointer transition-all duration-150 flex flex-col justify-between select-none outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCollection(col.id);
                  }
                }}
              >
                {/* Visual Mosaic Preview of Top References (16:9 ratio) */}
                <div className="w-full aspect-[16/9] bg-[#F1F1EF] border-b border-[#E7E7E5] relative overflow-hidden flex">
                  {topThumbs.length > 0 ? (
                    <div className="w-full h-full flex">
                      {topThumbs.map((thumbUrl, idx) => (
                        <div
                          key={idx}
                          className="h-full flex-1 overflow-hidden border-r last:border-r-0 border-[#E7E7E5]"
                        >
                          <img
                            src={thumbUrl!}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#A8A8A6] gap-1 bg-[#FAFAF8]">
                      <Layers size={22} strokeWidth={1.5} />
                      <span className="font-mono text-[9px] uppercase tracking-wider">
                        Coleção vazia
                      </span>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div
                    className="absolute top-2 right-2 flex items-center gap-1 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(col, e)}
                      className="p-1 rounded bg-white/90 hover:bg-white text-[#737373] hover:text-[#171717] border border-[#E7E7E5] shadow-2xs transition-colors cursor-pointer"
                      title="Editar coleção"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingCollectionId(col.id);
                      }}
                      className="p-1 rounded bg-white/90 hover:bg-white text-[#737373] hover:text-[#EF4444] border border-[#E7E7E5] shadow-2xs transition-colors cursor-pointer"
                      title="Excluir coleção"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#171717] group-hover:text-[#4355DB] transition-colors truncate">
                      {col.name}
                    </h3>
                    <p className="font-sans text-xs text-[#737373] mt-1 line-clamp-2 leading-relaxed">
                      {col.description || 'Nenhum descritor editorial cadastrado.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[#A8A8A6] font-mono text-[11px] border-t border-[#E7E7E5]/50">
                    <span className="font-semibold text-[#171717] tabular-nums">
                      [ {count} {count === 1 ? 'referência' : 'referências'} ]
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#4355DB]">
                      Ver acervo →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Collection Dialog */}
      {editingCollectionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setEditingCollectionId(null)}
            className="fixed inset-0 bg-[#0F0F0F]/50 backdrop-blur-xs"
          />
          <form
            onSubmit={handleSaveEdit}
            className="relative w-full max-w-md bg-white border border-[#E7E7E5] rounded-sm p-6 shadow-2xl z-10 flex flex-col gap-4 animate-in fade-in zoom-in-95"
          >
            <h3 className="font-sans font-bold text-base text-[#171717]">
              Editar Coleção
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#171717]">Nome</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded bg-[#F8F8F6] border border-[#E7E7E5] focus:bg-white focus:border-[#4355DB] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#171717]">Descrição</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 rounded bg-[#F8F8F6] border border-[#E7E7E5] focus:bg-white focus:border-[#4355DB] outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditingCollectionId(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Salvar alterações
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCollectionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeletingCollectionId(null)}
            className="fixed inset-0 bg-[#0F0F0F]/50 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-sm bg-white border border-[#E7E7E5] rounded-sm p-6 shadow-2xl z-10 flex flex-col gap-3 animate-in fade-in zoom-in-95">
            <h3 className="font-sans font-bold text-base text-[#171717]">
              Excluir coleção?
            </h3>
            <p className="font-sans text-xs text-[#737373] leading-relaxed">
              A coleção será removida. <strong>As referências associadas continuarão salvas em sua biblioteca.</strong>
            </p>
            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingCollectionId(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onDeleteCollection(deletingCollectionId);
                  setDeletingCollectionId(null);
                }}
                className="bg-[#EF4444] hover:bg-[#DC2626] border-[#EF4444]"
              >
                Confirmar exclusão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
