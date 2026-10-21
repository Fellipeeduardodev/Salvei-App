import React, { useState } from 'react';
import { Project, Reference } from '../../types/reference';
import {
  ArrowLeft,
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  Inbox,
  MinusCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ReferenceCard } from '../../components/references/ReferenceCard';
import { AssociateReferencesModal } from '../../components/references/AssociateReferencesModal';

interface ProjectDetailViewProps {
  project: Project;
  allReferences: Reference[];
  onBack: () => void;
  onEditProject: (id: string, name: string, description?: string) => void;
  onDeleteProject: (id: string) => void;
  onSelectReference: (ref: Reference) => void;
  selectedReferenceId?: string | null;
  onTagClick?: (tag: string) => void;
  onSaveAssociations: (referenceIds: string[]) => void;
  onRemoveReferenceFromProject: (referenceId: string) => void;
  onToggleFavorite?: (id: string, nextFavorite: boolean) => void;
  onQuickEdit?: (ref: Reference) => void;
  onQuickDelete?: (ref: Reference) => void;
  onQuickAssociateProject?: (ref: Reference) => void;
  onQuickAssociateCollection?: (ref: Reference) => void;
  selectedBatchIds?: string[];
  isSelectionModeActive?: boolean;
  onToggleBatchSelect?: (referenceId: string, e?: React.MouseEvent) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  allReferences,
  onBack,
  onEditProject,
  onDeleteProject,
  onSelectReference,
  selectedReferenceId,
  onTagClick,
  onSaveAssociations,
  onRemoveReferenceFromProject,
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
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(project.description || '');
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // References belonging to this project
  const projectReferences = allReferences.filter((r) =>
    r.projectIds?.includes(project.id)
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onEditProject(project.id, editName.trim(), editDescription.trim() || undefined);
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
          <span>Voltar para Projetos</span>
        </button>
      </div>

      {/* Project Header Card */}
      <div className="p-6 bg-white border border-[#E7E7E5] rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[#4355DB] font-mono text-[11px] font-bold uppercase tracking-wider mb-1">
            <Briefcase size={14} />
            <span>PROJETO</span>
          </div>

          <h1 className="font-sans font-bold text-2xl md:text-3xl text-[#171717] tracking-tight">
            {project.name}
          </h1>

          {project.description && (
            <p className="font-sans text-xs md:text-sm text-[#737373] mt-2 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="mt-3 font-mono text-[11px] text-[#A8A8A6]">
            [ {projectReferences.length}{' '}
            {projectReferences.length === 1 ? 'referência associada' : 'referências associadas'} ]
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditName(project.name);
              setEditDescription(project.description || '');
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
            title="Excluir projeto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Grid of References */}
      {projectReferences.length === 0 ? (
        <div className="py-24 bg-white border border-[#E7E7E5] rounded-sm p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#F1F1EF] text-[#737373] flex items-center justify-center mb-3">
            <Inbox size={22} strokeWidth={1.8} />
          </div>
          <h3 className="font-sans font-semibold text-base text-[#171717] mb-1">
            Nenhuma referência neste projeto
          </h3>
          <p className="font-sans text-xs text-[#737373] max-w-sm mb-4">
            Vincule referências já existentes na sua biblioteca para reunir benchmarks e inspirações para esta entrega.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssociateModalOpen(true)}
            iconLeft={<Plus size={14} />}
          >
            Adicionar referências ao projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {projectReferences.map((ref) => (
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
              {/* Quick action to detach reference from this project */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveReferenceFromProject(ref.id);
                }}
                className="absolute top-2 left-2 z-20 px-2 py-1 rounded bg-white/95 text-[#737373] hover:text-[#EF4444] text-[10px] font-mono border border-[#E7E7E5] shadow-xs opacity-0 group-hover/wrapper:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                title="Desvincular deste projeto (não apaga a referência original)"
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
              Editar Projeto
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
              Excluir projeto "{project.name}"?
            </h3>
            <p className="font-sans text-xs text-[#737373] leading-relaxed">
              O projeto será removido. Suas {projectReferences.length} referências{' '}
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
                  onDeleteProject(project.id);
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
        entityType="project"
        entityId={project.id}
        entityName={project.name}
        allReferences={allReferences}
        onSaveAssociations={onSaveAssociations}
      />
    </div>
  );
};
