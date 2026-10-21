import React, { useState } from 'react';
import { Project, Reference } from '../../types/reference';
import { Briefcase, Plus, Calendar, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ProjectsListViewProps {
  projects: Project[];
  references: Reference[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, description?: string) => void;
  onEditProject: (id: string, name: string, description?: string) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({
  projects,
  references,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Editing state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete confirmation
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewName('');
    setNewDescription('');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProject(newName.trim(), newDescription.trim() || undefined);
    setIsCreating(false);
  };

  const handleStartEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditName(project.name);
    setEditDescription(project.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectId || !editName.trim()) return;
    onEditProject(editingProjectId, editName.trim(), editDescription.trim() || undefined);
    setEditingProjectId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-[#171717] tracking-tight">
            Projetos
          </h1>
          <p className="font-sans text-xs md:text-sm text-[#737373] mt-0.5">
            Organize referências direcionadas a produtos, sprints e entregáveis de clientes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleStartCreate}
          iconLeft={<Plus size={14} strokeWidth={2.5} />}
          className="self-start sm:self-auto cursor-pointer"
        >
          Novo projeto
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
              Criar Novo Projeto
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
            placeholder="Nome do projeto (ex: Redesign App Mobile, Dashboard 2026)"
            autoFocus
            required
            className="w-full text-sm font-semibold text-[#171717] px-3 py-2 rounded bg-[#F8F8F6] border border-[#E7E7E5] focus:bg-white focus:border-[#4355DB] outline-none"
          />

          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Descrição ou contexto opcional..."
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
              Criar projeto
            </Button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="py-20 bg-white border border-[#E7E7E5] rounded-sm p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#F1F1EF] text-[#737373] flex items-center justify-center mb-3">
            <Briefcase size={22} strokeWidth={1.8} />
          </div>
          <h3 className="font-sans font-semibold text-base text-[#171717] mb-1">
            Nenhum projeto criado ainda
          </h3>
          <p className="font-sans text-xs text-[#737373] max-w-sm mb-4">
            Projetos permitem agrupar referências de diferentes domínios e mídias em torno de entregas específicas.
          </p>
          <Button variant="primary" size="sm" onClick={handleStartCreate}>
            Criar primeiro projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const count = references.filter((r) => r.projectIds?.includes(project.id)).length;
            const formattedDate = new Date(project.updatedAt || project.createdAt).toLocaleDateString(
              'pt-BR',
              { day: '2-digit', month: '2-digit', year: 'numeric' }
            );

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="group relative bg-white border border-[#E7E7E5] hover:border-[#D4D4D0] rounded-sm p-5 cursor-pointer transition-all duration-150 flex flex-col justify-between h-48 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB]"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectProject(project.id);
                  }
                }}
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-center justify-between text-[#737373] mb-2">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#A8A8A6] uppercase tracking-wider">
                      <Briefcase size={13} className="text-[#4355DB]" />
                      <span>PROJETO</span>
                    </div>

                    {/* Actions menu */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(project, e)}
                        className="p-1 rounded text-[#A8A8A6] hover:text-[#171717] hover:bg-[#F1F1EF] transition-colors cursor-pointer"
                        title="Editar nome e descrição"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProjectId(project.id);
                        }}
                        className="p-1 rounded text-[#A8A8A6] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                        title="Excluir projeto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-sans font-bold text-base text-[#171717] group-hover:text-[#4355DB] transition-colors truncate">
                    {project.name}
                  </h3>
                  <p className="font-sans text-xs text-[#737373] mt-1.5 line-clamp-2 leading-relaxed">
                    {project.description || 'Nenhuma descrição fornecida.'}
                  </p>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E7E7E5]/60 text-[#A8A8A6] font-mono text-[11px]">
                  <span className="font-semibold text-[#171717] tabular-nums">
                    [ {count} {count === 1 ? 'referência' : 'referências'} ]
                  </span>
                  <span className="flex items-center gap-1 text-[10px]">
                    <Calendar size={11} /> {formattedDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Project Dialog */}
      {editingProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setEditingProjectId(null)}
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
                onClick={() => setEditingProjectId(null)}
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
      {deletingProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeletingProjectId(null)}
            className="fixed inset-0 bg-[#0F0F0F]/50 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-sm bg-white border border-[#E7E7E5] rounded-sm p-6 shadow-2xl z-10 flex flex-col gap-3 animate-in fade-in zoom-in-95">
            <h3 className="font-sans font-bold text-base text-[#171717]">
              Excluir projeto?
            </h3>
            <p className="font-sans text-xs text-[#737373] leading-relaxed">
              O projeto será removido junto com seus vínculos. <strong>Nenhuma referência da sua biblioteca será excluída.</strong>
            </p>
            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingProjectId(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onDeleteProject(deletingProjectId);
                  setDeletingProjectId(null);
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
