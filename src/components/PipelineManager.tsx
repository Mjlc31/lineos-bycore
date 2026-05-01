/**
 * PipelineManager — Modal para gerenciar etapas e pipelines
 * Ajuste 2: criar/editar/remover etapas
 * Ajuste 3: criar/remover múltiplas pipelines
 */
import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, GripVertical, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CrmColumn } from '../types';
import type { Pipeline } from '../hooks/usePipelines';

const COLOR_OPTIONS = [
  { label: 'Azul',   value: 'bg-blue-500',   hex: '#3b82f6' },
  { label: 'Verde',  value: 'bg-green-500',  hex: '#22c55e' },
  { label: 'Roxo',   value: 'bg-purple-500', hex: '#a855f7' },
  { label: 'Laranja',value: 'bg-orange-500', hex: '#f97316' },
  { label: 'Vermelho',value: 'bg-red-500',   hex: '#ef4444' },
  { label: 'Amarelo',value: 'bg-yellow-500', hex: '#eab308' },
  { label: 'Cyan',   value: 'bg-cyan-500',   hex: '#06b6d4' },
  { label: 'Rosa',   value: 'bg-pink-500',   hex: '#ec4899' },
];

interface Props {
  pipelines: Pipeline[];
  activePipelineId: string;
  onClose: () => void;
  onAddPipeline: (name: string) => void;
  onDeletePipeline: (id: string) => void;
  onSetActive: (id: string) => void;
  onAddColumn: (pipelineId: string, col: Omit<CrmColumn, 'id'>) => void;
  onUpdateColumn: (pipelineId: string, colId: string, updates: Partial<CrmColumn>) => void;
  onRemoveColumn: (pipelineId: string, colId: string) => void;
}

const PipelineManager: React.FC<Props> = ({
  pipelines, activePipelineId, onClose,
  onAddPipeline, onDeletePipeline, onSetActive,
  onAddColumn, onUpdateColumn, onRemoveColumn,
}) => {
  const [selectedPipelineId, setSelectedPipelineId] = useState(activePipelineId);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [showNewPipeline, setShowNewPipeline] = useState(false);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [newColName, setNewColName] = useState('');
  const [newColColor, setNewColColor] = useState('bg-blue-500');
  const [showNewCol, setShowNewCol] = useState(false);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId) ?? pipelines[0];

  const handleAddPipeline = () => {
    if (!newPipelineName.trim()) return;
    onAddPipeline(newPipelineName.trim());
    setNewPipelineName('');
    setShowNewPipeline(false);
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    onAddColumn(selectedPipeline.id, {
      title: newColName.trim(),
      color: newColColor,
      accent: newColColor.replace('bg-', '').replace('-500', ''),
    });
    setNewColName('');
    setNewColColor('bg-blue-500');
    setShowNewCol(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#141414] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2b2b]">
          <h2 className="text-lg font-bold text-white">Gerenciar Pipelines & Etapas</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Pipelines list */}
          <div className="w-48 border-r border-[#2b2b2b] flex flex-col bg-[#0d0d0d]">
            <div className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pipelines</div>
            <div className="flex-1 overflow-y-auto">
              {pipelines.map(p => (
                <div key={p.id}
                  className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors group ${selectedPipelineId === p.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  onClick={() => setSelectedPipelineId(p.id)}>
                  <span className="text-sm font-medium truncate flex-1">{p.name}</span>
                  {pipelines.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); onDeletePipeline(p.id); }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#2b2b2b]">
              {showNewPipeline ? (
                <div className="space-y-2">
                  <input autoFocus value={newPipelineName} onChange={e => setNewPipelineName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddPipeline(); if (e.key === 'Escape') setShowNewPipeline(false); }}
                    placeholder="Nome..." className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50" />
                  <div className="flex gap-1">
                    <button onClick={() => setShowNewPipeline(false)} className="flex-1 py-1 text-xs text-gray-500 hover:text-white">Cancelar</button>
                    <button onClick={handleAddPipeline} className="flex-1 py-1 text-xs bg-primary text-white rounded">Criar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewPipeline(true)} className="w-full flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                  <PlusCircle className="w-3.5 h-3.5" /> Nova Pipeline
                </button>
              )}
            </div>
          </div>

          {/* Right: Columns */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedPipeline?.name}</h3>
                <p className="text-xs text-gray-500">{selectedPipeline?.columns.length} etapas</p>
              </div>
              {selectedPipelineId !== activePipelineId && (
                <button onClick={() => { onSetActive(selectedPipelineId); onClose(); }}
                  className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-red-500 transition-colors">
                  Usar esta pipeline
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {selectedPipeline?.columns.map((col) => (
                <div key={col.id} className="flex items-center gap-3 bg-[#1e1e1e] border border-[#2b2b2b] rounded-xl px-3 py-2.5 group">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                  <div className={`w-3 h-3 rounded-full ${col.color} flex-shrink-0`} />
                  {editingColId === col.id ? (
                    <input autoFocus defaultValue={col.title}
                      onBlur={e => { onUpdateColumn(selectedPipeline.id, col.id, { title: e.target.value }); setEditingColId(null); }}
                      onKeyDown={e => { if (e.key === 'Enter') { onUpdateColumn(selectedPipeline.id, col.id, { title: e.currentTarget.value }); setEditingColId(null); } if (e.key === 'Escape') setEditingColId(null); }}
                      className="flex-1 bg-transparent text-sm text-white focus:outline-none border-b border-primary/50" />
                  ) : (
                    <span className="text-sm text-white flex-1">{col.title}</span>
                  )}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingColId(col.id)} className="p-1 text-gray-500 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <div className="flex gap-1">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c.value} onClick={() => onUpdateColumn(selectedPipeline.id, col.id, { color: c.value, accent: c.value.replace('bg-', '').replace('-500', '') })}
                          title={c.label} className={`w-4 h-4 rounded-full border-2 ${col.color === c.value ? 'border-white scale-125' : 'border-transparent'} transition-transform`}
                          style={{ background: c.hex }} />
                      ))}
                    </div>
                    {selectedPipeline.columns.length > 1 && (
                      <button onClick={() => onRemoveColumn(selectedPipeline.id, col.id)} className="p-1 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add column */}
            <div className="mt-3 pt-3 border-t border-[#2b2b2b]">
              {showNewCol ? (
                <div className="space-y-2">
                  <input autoFocus value={newColName} onChange={e => setNewColName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') setShowNewCol(false); }}
                    placeholder="Nome da etapa..." className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" />
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 flex-1">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c.value} onClick={() => setNewColColor(c.value)} title={c.label}
                          className={`w-5 h-5 rounded-full border-2 transition-transform ${newColColor === c.value ? 'border-white scale-125' : 'border-transparent'}`}
                          style={{ background: c.hex }} />
                      ))}
                    </div>
                    <button onClick={() => setShowNewCol(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-white">Cancelar</button>
                    <button onClick={handleAddColumn} className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg">Adicionar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewCol(true)} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#333] rounded-xl text-sm text-gray-500 hover:text-white hover:border-[#555] transition-colors">
                  <Plus className="w-4 h-4" /> Adicionar Etapa
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PipelineManager;
