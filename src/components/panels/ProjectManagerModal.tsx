import React, { useEffect, useState, useRef } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { db } from '../../services/db';
import { ProjectRecord } from '../../types/project';
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Upload,
  Calendar,
  X,
  Sparkles,
  Check,
} from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const currentProjectId = useStudioStore((s) => s.currentProjectId);
  const loadProject = useStudioStore((s) => s.loadProject);
  const createNewProject = useStudioStore((s) => s.createNewProject);
  const saveCurrentProject = useStudioStore((s) => s.saveCurrentProject);

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const records = await db.projects.orderBy('updatedAt').reverse().toArray();
      setProjects(records);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenProject = (p: ProjectRecord) => {
    loadProject(p);
    onClose();
  };

  const handleCreateNew = () => {
    createNewProject('tshirt');
    onClose();
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      await db.projects.delete(id);
      fetchProjects();
    }
  };

  const handleDuplicateProject = async (p: ProjectRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned: ProjectRecord = {
      ...p,
      id: 'project-' + Date.now(),
      name: p.name + ' (Copy)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.projects.add(cloned);
    fetchProjects();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const importedRecord: ProjectRecord = {
          id: 'project-' + Date.now(),
          name: json.name || 'Imported Design',
          thumbnail: '',
          productType: json.productType || 'tshirt',
          garmentColor: json.garmentColor || '#1e212d',
          materialSettings: json.materialSettings,
          canvases: json.canvases || {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await db.projects.add(importedRecord);
        loadProject(importedRecord);
        onClose();
      } catch (err) {
        alert('Invalid project file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-studio-900 border border-studio-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-studio-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/30">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Project Library</h2>
              <p className="text-xs text-slate-400">
                Persistent offline storage powered by IndexedDB.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".threadcraft,.json"
              className="hidden"
              onChange={handleImportFile}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-studio-800 hover:bg-studio-750 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-studio-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import File</span>
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-studio-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="p-6 overflow-y-auto no-scrollbar max-h-[60vh] space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              Loading projects from IndexedDB...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No saved projects yet.</p>
              <button
                onClick={handleCreateNew}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
              >
                Create Your First Design
              </button>
            </div>
          ) : (
            projects.map((proj) => {
              const isCurrent = proj.id === currentProjectId;
              const dateStr = new Date(proj.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={proj.id}
                  onClick={() => handleOpenProject(proj)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-studio-850 border-studio-750 hover:border-studio-600 hover:bg-studio-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Color Swatch Circle */}
                    <div
                      className="w-10 h-10 rounded-xl border border-studio-650 shadow-inner flex items-center justify-center shrink-0"
                      style={{ backgroundColor: proj.garmentColor }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                        <span className="uppercase text-indigo-400 font-semibold">
                          {proj.productType}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDuplicateProject(proj, e)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-studio-750 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(proj.id, e)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
