import React, { useState } from 'react';
import { Collection, Reference } from '../../types/reference';
import {
  ArrowLeft,
  Layers,
  Plus,
  Edit3,
  Trash2,
  Inbox,
  MinusCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ReferenceCard } from '../../components/references/ReferenceCard';
import { AssociateReferencesModal } from '../../components/references/AssociateReferencesModal';

interface CollectionDetailViewProps {
  collection: Collection;
  allReferences: Reference[];
  onBack: () => void;
  onEditCollection: (id: string, name: string, description?: string) => void;
  onDeleteCollection: (id: string) => void;
  onSelectReference: (ref: Reference) => void;
  selectedReferenceId?: string | null;
  onTagClick?: (tag: string) => void;
  onSaveAssociations: (referenceIds: string[]) => void;
  onRemoveReferenceFromCollection: (referenceId: string) => void;
  onToggleFavorite?: (id: string, nextFavorite: boolean) => void;
  onQuickEdit?: (ref: Reference) => void;
  onQuickDelete?: (ref: Reference) => void;
  onQuickAssociateProject?: (ref: Reference) => void;
  onQuickAssociateCollection?: (ref: Reference) => void;
  selectedBatchIds?: string[];
  isSelectionModeActive?: boolean;
  onToggleBatchSelect?: (referenceId: string, e?: React.MouseEvent) => void;
}

export const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  collection,
  allReferences,
  onBack,
  onEditCollection,
  onDeleteCollection,
  onSelectReference,
  selectedReferenceId,
  onTagClick,
  onSaveAssociations,
  onRemoveReferenceFromCollection,
  onToggleFavorite,
  onQuickEdit,
  onQuickDelete,
  onQuickAssociateProject,
  onQuickAssociateCollection,
  selectedBatchIds = [],
  isSelectionModeActive = false,
  onToggleBatchSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [editDescription, setEditDescription] = useState(collection.description || '');
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // References belonging to this collection
  const collectionReferences = allReferences.filter((r) =>
    r.collectionIds?.includes(collection.id)
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onEditCollection(collection.id, editName.trim(), editDescription.trim() || undefined);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb / Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Voltar para Coleções</span>
        </button>
      </div>

      {/* Collection Header Card */}
      <div className="p-6 bg-white border border-[#E7E7E5] rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[#4355DB] font-mono text-[11px] font-bold uppercase tracking-wider mb-1">
            <Layers size={14} />
            <span>COLEÇÃO TEMÁTICA</span>
          </div>

          <h1 className="font-sans font-bold text-2xl md:text-3xl text-[#171717] tracking-tight">
            {collection.name}
          </h1>

          {collection.description && (
            <p className="font-sans text-xs md:text-sm text-[#737373] mt-2 max-w-2xl leading-relaxed">
              {collection.description}
            </p>
          )}

          <div className="mt-3 font-mono text-[11px] text-[#A8A8A6]">
            [ {collectionReferences.length}{' '}
            {collectionReferences.length === 1 ? 'referência curada' : 'referências curadas'} ]
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditName(collection.name);
              setEditDescription(collection.description || '');
              setIsEditing(true);
            }}
            iconLeft={<Edit3 size={13} />}
          >
            Editar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssociateModalOpen(true)}
            iconLeft={<Plus size={13} strokeWidth={2.5} />}
          >
            Gerenciar referências
          </Button>

          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="p-2 rounded text-[#A8A8A6] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer ml-1"
            title="Excluir coleção"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Grid of References */}
      {collectionReferences.length === 0 ? (
        <div className="py-24 bg-white border border-[#E7E7E5] rounded-sm p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#F1F1EF] text-[#737373] flex items-center justify-center mb-3">
            <Inbox size={22} strokeWidth={1.8} />
          </div>
          <h3 className="font-sans font-semibold text-base text-[#171717] mb-1">
            Nenhuma referência vinculada a esta coleção
          </h3>
          <p className="font-sans text-xs text-[#737373] max-w-sm mb-4">
            Curadorias reúnem materiais com afinidade de layout, tipografia ou estilo para consulta rápida e contínua.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssociateModalOpen(true)}
            iconLeft={<Plus size={14} />}
          >
            Adicionar referências à coleção
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {collectionReferences.map((ref) => (
            <div key={ref.id} className="relative group/wrapper">
              <ReferenceCard
                reference={ref}
                isSelected={selectedReferenceId === ref.id}
                isChecked={selectedBatchIds.includes(ref.id)}
                isSelectionModeActive={isSelectionModeActive}
                onToggleSelect={onToggleBatchSelect}
                onClick={() => onSelectReference(ref)}
                onTagClick={onTagClick}
                onToggleFavorite={onToggleFavorite}
                onQuickEdit={onQuickEdit}
                onQuickDelete={onQuickDelete}
                onQuickAssociateProject={onQuickAssociateProject}
                onQuickAssociateCollection={onQuickAssociateCollection}
              />
              {/* Quick action to detach reference from this collection */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveReferenceFromCollection(ref.id);
                }}
                className="absolute top-2 left-2 z-20 px-2 py-1 rounded bg-white/95 text-[#737373] hover:text-[#EF4444] text-[10px] font-mono border border-[#E7E7E5] shadow-xs opacity-0 group-hover/wrapper:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                title="Desvincular desta coleção (não apaga a referência original)"
              >
                <MinusCircle size={11} />
                <span>Desvincular</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsEditing(false)}
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
                onClick={() => setIsEditing(false)}
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
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsConfirmingDelete(false)}
            className="fixed inset-0 bg-[#0F0F0F]/50 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-sm bg-white border border-[#E7E7E5] rounded-sm p-6 shadow-2xl z-10 flex flex-col gap-3 animate-in fade-in zoom-in-95">
            <h3 className="font-sans font-bold text-base text-[#171717]">
              Excluir coleção "{collection.name}"?
            </h3>
            <p className="font-sans text-xs text-[#737373] leading-relaxed">
              A coleção será removida. Suas {collectionReferences.length} referências{' '}
              <strong>continuarão preservadas na biblioteca.</strong>
            </p>
            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onDeleteCollection(collection.id);
                  onBack();
                }}
                className="bg-[#EF4444] hover:bg-[#DC2626] border-[#EF4444]"
              >
                Confirmar exclusão
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Associate References Modal */}
      <AssociateReferencesModal
        isOpen={isAssociateModalOpen}
        onClose={() => setIsAssociateModalOpen(false)}
        entityType="collection"
        entityId={collection.id}
        entityName={collection.name}
        allReferences={allReferences}
        onSaveAssociations={onSaveAssociations}
      />
    </div>
  );
};
