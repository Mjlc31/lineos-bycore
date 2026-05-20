import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronDown, Plus, Tag as TagIcon, User, Calendar,
  Flag, FileText, Link2, AlertCircle, Zap
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Priority, Tag } from '../../types';

const PRIORITIES: { value: Priority; label: string; color: string; icon: string }[] = [
  { value: 'Urgent', label: 'Urgente',  color: 'text-red-400 bg-red-500/10 border-red-500/30',    icon: '🔴' },
  { value: 'High',   label: 'Alta',     color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', icon: '🟠' },
  { value: 'Normal', label: 'Normal',   color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',  icon: '🔵' },
  { value: 'Low',    label: 'Baixa',    color: 'text-gray-400 bg-white/5 border-white/10',         icon: '⚪' },
  { value: 'None',   label: 'Nenhuma',  color: 'text-gray-600 bg-transparent border-transparent',  icon: '—' },
];

const TAG_PRESETS: Tag[] = [
  { name: 'design',     color: '#a855f7', bgColor: 'rgba(168,85,247,0.15)' },
  { name: 'copy',       color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)' },
  { name: 'vídeo',      color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)'  },
  { name: 'estratégia', color: '#06b6d4', bgColor: 'rgba(6,182,212,0.15)'  },
  { name: 'alteração',  color: '#20c997', bgColor: 'rgba(32,201,151,0.15)' },
  { name: 'standby',    color: '#ff7070', bgColor: 'rgba(255,112,112,0.15)'},
  { name: 'urgente',    color: '#f43f5e', bgColor: 'rgba(244,63,94,0.15)'  },
  { name: 'revisão',    color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.15)' },
];

const TEAM_MEMBERS = [
  { name: 'Arthur',  avatar: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Lucas',   avatar: 'https://i.pravatar.cc/150?img=33' },
  { name: 'Camila',  avatar: 'https://i.pravatar.cc/150?img=44' },
  { name: 'Rafael',  avatar: 'https://i.pravatar.cc/150?img=52' },
  { name: 'Mariana', avatar: 'https://i.pravatar.cc/150?img=47' },
];

interface Props {
  onClose: () => void;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
    {children}
  </label>
);

export const CreateTaskModal = ({ onClose }: Props) => {
  const { taskStatuses, addTask, tasks } = useAppContext();

  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId]     = useState(taskStatuses[0]?.id || 's1');
  const [priority, setPriority]     = useState<Priority>('Normal');
  const [dueDate, setDueDate]       = useState('');
  const [assignees, setAssignees]   = useState<string[]>([]);
  const [tags, setTags]             = useState<Tag[]>([]);
  const [customTag, setCustomTag]   = useState('');
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [relatedInput, setRelatedInput] = useState('');
  const [showRelated, setShowRelated] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState('');
  const [client, setClient]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStatus = taskStatuses.find(s => s.id === statusId);
  const selectedPriority = PRIORITIES.find(p => p.value === priority)!;

  const toggleAssignee = (avatar: string) => {
    setAssignees(prev =>
      prev.includes(avatar) ? prev.filter(a => a !== avatar) : [...prev, avatar]
    );
  };

  const toggleTag = (tag: Tag) => {
    setTags(prev =>
      prev.find(t => t.name === tag.name) ? prev.filter(t => t.name !== tag.name) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (!customTag.trim()) return;
    const colors = ['#a855f7','#f59e0b','#06b6d4','#20c997'];
    const color = colors[tags.length % colors.length];
    toggleTag({ name: customTag.trim().toLowerCase(), color, bgColor: color + '26' });
    setCustomTag('');
  };

  const searchableTasks = tasks.filter(t =>
    t.id !== undefined &&
    !relatedIds.includes(t.id) &&
    relatedInput.length > 0 &&
    t.name.toLowerCase().includes(relatedInput.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    addTask({
      name: name.trim(),
      description,
      statusId,
      priority,
      dueDate,
      assignees: assignees.length > 0 ? assignees : ['https://i.pravatar.cc/150?img=11'],
      tags,
      relatedTaskIds: relatedIds,
      subtasks: [],
      timeSpent: 0,
      isTimerRunning: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.08] shadow-2xl custom-scrollbar"
        style={{ background: '#141414' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06] sticky top-0 bg-[#141414] z-10">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-white">Nova Tarefa</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Nome */}
          <div>
            <SectionLabel>Nome da Tarefa *</SectionLabel>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(); }}
              placeholder="Ex: [KiDelícia] Criar banner Black Friday..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 placeholder-gray-600 transition-all font-medium"
            />
          </div>

          {/* Status + Prioridade + Data + Horas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <SectionLabel>Status</SectionLabel>
              <div className="relative">
                <select
                  value={statusId}
                  onChange={e => setStatusId(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 appearance-none cursor-pointer pr-8"
                >
                  {taskStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                {currentStatus && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none" style={{ backgroundColor: currentStatus.color }} />
                )}
              </div>
            </div>

            {/* Prioridade */}
            <div>
              <SectionLabel>Prioridade</SectionLabel>
              <div className="grid grid-cols-5 gap-1">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    title={p.label}
                    className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${
                      priority === p.value ? p.color : 'bg-white/[0.03] border-white/5 text-gray-600 hover:border-white/10'
                    }`}
                  >
                    {p.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Data de Entrega */}
            <div>
              <SectionLabel><Calendar className="w-3 h-3 inline mr-1" />Data de Entrega</SectionLabel>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 [color-scheme:dark] cursor-pointer"
              />
            </div>

            {/* Horas estimadas */}
            <div>
              <SectionLabel><Flag className="w-3 h-3 inline mr-1" />Horas Estimadas</SectionLabel>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours}
                  onChange={e => setEstimatedHours(e.target.value)}
                  placeholder="Ex: 4"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 placeholder-gray-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">h</span>
              </div>
            </div>
          </div>

          {/* Responsáveis */}
          <div>
            <SectionLabel><User className="w-3 h-3 inline mr-1" />Responsáveis</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {TEAM_MEMBERS.map(m => {
                const selected = assignees.includes(m.avatar);
                return (
                  <button
                    key={m.name}
                    onClick={() => toggleAssignee(m.avatar)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                      selected
                        ? 'border-primary/50 bg-primary/10 text-white'
                        : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-gray-300'
                    }`}
                  >
                    <img src={m.avatar} className="w-5 h-5 rounded-full" />
                    {m.name}
                    {selected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cliente */}
          <div>
            <SectionLabel>Cliente / Conta</SectionLabel>
            <input
              type="text"
              value={client}
              onChange={e => setClient(e.target.value)}
              placeholder="Ex: KiDelícia, TechCorp..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 placeholder-gray-600 transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <SectionLabel><TagIcon className="w-3 h-3 inline mr-1" />Tags</SectionLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {TAG_PRESETS.map(tag => {
                const selected = tags.find(t => t.name === tag.name);
                return (
                  <button
                    key={tag.name}
                    onClick={() => toggleTag(tag)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                    style={{
                      color: tag.color,
                      borderColor: selected ? tag.color : 'rgba(255,255,255,0.08)',
                      background: selected ? tag.bgColor : 'transparent',
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustomTag(); }}
                placeholder="+ Tag personalizada..."
                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary/50 placeholder-gray-600"
              />
              <button onClick={addCustomTag} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <span key={t.name} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: t.color, background: t.bgColor }}>
                    {t.name}
                    <button onClick={() => setTags(prev => prev.filter(x => x.name !== t.name))} className="opacity-60 hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Descrição */}
          <div>
            <SectionLabel><FileText className="w-3 h-3 inline mr-1" />Descrição / Briefing</SectionLabel>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Descreva o objetivo da tarefa, requisitos, referências..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 placeholder-gray-600 resize-none transition-all"
            />
          </div>

          {/* Tarefas Relacionadas */}
          <div>
            <SectionLabel><Link2 className="w-3 h-3 inline mr-1" />Tarefas Relacionadas</SectionLabel>
            {relatedIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {relatedIds.map(id => {
                  const t = tasks.find(x => x.id === id);
                  return t ? (
                    <span key={id} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300">
                      <Link2 className="w-3 h-3 text-gray-500" />
                      {t.name.slice(0, 30)}{t.name.length > 30 ? '…' : ''}
                      <button onClick={() => setRelatedIds(prev => prev.filter(x => x !== id))} className="text-gray-600 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
            <div className="relative">
              <input
                value={relatedInput}
                onChange={e => { setRelatedInput(e.target.value); setShowRelated(true); }}
                onFocus={() => setShowRelated(true)}
                placeholder="Buscar tarefa para vincular..."
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 placeholder-gray-600"
              />
              <AnimatePresence>
                {showRelated && searchableTasks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full mt-1 left-0 right-0 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl z-30 overflow-hidden"
                  >
                    {searchableTasks.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setRelatedIds(prev => [...prev, t.id]); setRelatedInput(''); setShowRelated(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left"
                      >
                        <Link2 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        {t.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Preview seleções */}
          {(priority !== 'Normal' || assignees.length > 0 || dueDate || estimatedHours) && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center">
              <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">Resumo:</span>
              {currentStatus && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded text-white" style={{ background: currentStatus.color + '33', color: currentStatus.color }}>
                  {currentStatus.name}
                </span>
              )}
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${selectedPriority.color}`}>
                {selectedPriority.icon} {selectedPriority.label}
              </span>
              {assignees.length > 0 && (
                <span className="text-[11px] text-gray-400">{assignees.length} responsável{assignees.length > 1 ? 'is' : ''}</span>
              )}
              {dueDate && <span className="text-[11px] text-gray-400">📅 {new Date(dueDate).toLocaleDateString('pt-BR')}</span>}
              {estimatedHours && <span className="text-[11px] text-gray-400">⏱ {estimatedHours}h estimadas</span>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] sticky bottom-0 bg-[#141414]">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
            <AlertCircle className="w-3.5 h-3.5" />
            Enter para criar rapidamente
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-xl">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || isSubmitting}
              className="px-6 py-2 text-sm font-bold bg-primary hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
              Criar Tarefa
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
