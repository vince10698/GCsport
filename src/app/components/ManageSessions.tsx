import { useState } from 'react';
import { ArrowLeft, EllipsisVertical, Pencil, Copy, Trash2, Clock, Dumbbell, Flame, Plus } from 'lucide-react';
import type { Program } from '../types/program';

interface ManageSessionsProps {
  programs: Program[];
  onBack: () => void;
  onCreate: () => void;
  onEdit: (programId: number) => void;
  onDuplicate: (programId: number) => void;
  onDelete: (programId: number) => void;
}

export function ManageSessions({ 
  programs, 
  onBack,
  onCreate,
  onEdit, 
  onDuplicate, 
  onDelete
}: ManageSessionsProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleMenuToggle = (programId: number) => {
    setOpenMenuId(openMenuId === programId ? null : programId);
  };

  const handleDelete = (programId: number) => {
    setDeleteConfirmId(programId);
    setOpenMenuId(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmId !== null) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-12 pb-8 px-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-zinc-800/50 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </button>
              <h1 className="text-zinc-100">Mes sessions</h1>
            </div>
            <button
              onClick={onCreate}
              className="p-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
          <p className="text-zinc-400">Gérer vos programmes d'entraînement</p>
        </header>

        {/* Sessions list */}
        <main className="flex-1 px-6 pb-8">
          <div className="flex flex-col gap-3">
            {programs.map((program) => (
              <div
                key={program.id}
                className={`bg-zinc-800/40 backdrop-blur-xl rounded-2xl border border-zinc-700/30 relative cursor-pointer ${openMenuId === program.id ? 'z-30' : 'z-0'}`}
              >
                {/* Subtle glass shine */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-zinc-100 mb-2 truncate">{program.name}</h3>
                      <div className="flex items-center gap-3 text-zinc-400 flex-wrap text-sm">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-orange-400">{program.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Dumbbell className="w-3.5 h-3.5" />
                          <span>{program.exerciseCount} exercices</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" />
                          <span>~{program.calories} kcal</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuToggle(program.id);
                        }}
                        className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors"
                      >
                        <EllipsisVertical className="w-4 h-4 text-zinc-400" />
                      </button>

                      {/* Context menu */}
                      {openMenuId === program.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(program.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-700/50 transition-colors text-left"
                            >
                              <Pencil className="w-4 h-4 text-zinc-400" />
                              <span className="text-sm text-zinc-200">Éditer</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(program.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-700/50 transition-colors text-left"
                            >
                              <Copy className="w-4 h-4 text-zinc-400" />
                              <span className="text-sm text-zinc-200">Dupliquer</span>
                            </button>
                            <div className="h-px bg-zinc-700 my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(program.id);
                              }}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-left"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-red-400">Supprimer</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {programs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-400">Aucune session créée</p>
                <p className="text-zinc-500 text-sm mt-1">Créez votre première session personnalisée</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl text-zinc-100 mb-2">Supprimer la session ?</h2>
              <p className="text-zinc-400 mb-6">
                Cette action est irréversible. Tous les exercices et circuits de cette session seront perdus.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  <span className="text-zinc-200">Annuler</span>
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                >
                  <span className="text-white font-medium">Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}