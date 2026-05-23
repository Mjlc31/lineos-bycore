import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X, ChevronDown, CheckCircle2, User, Calendar, Flag, Tag as TagIcon,
  Link2, Maximize2, Sparkles, Folder, PlayCircle, Clock
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Priority, Tag } from '../../types';
import useEscapeKey from '../../hooks/useEscapeKey';

const PRIORITIES: { value: Priority; label: string; color: string; icon: string }[] = [
  { value: 'Urgent', label: 'Urgente',  color: 'text-red-400 bg-red-500/10',    icon: '🔴' },
  { value: 'High',   label: 'Alta',     color: 'text-orange-400 bg-orange-500/10', icon: '🟠' },
  { value: 'Normal', label: 'Normal',   color: 'text-blue-400 bg-blue-500/10',  icon: '🔵' },
  { value: 'Low',    label: 'Baixa',    color: 'text-gray-400 bg-white/5',         icon: '⚪' },
  { value: 'None',   label: 'Nenhuma',  color: 'text-gray-600 bg-transparent',  icon: '—' },
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

export const CreateTaskModal = ({ onClose }: Props) => {
  const { taskStatuses, addTask } = useAppContext();
  useEscapeKey(onClose);

  const [activeTab, setActiveTab] = useState<'tarefa' | 'doc' | 'lembrete' | 'quadro'>('tarefa');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState(taskStatuses[0]?.id || 's1');
  const [priority, setPriority] = useState<Priority>('Normal');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const currentStatus = taskStatuses.find(s => s.id === statusId);
  const currentPriority = PRIORITIES.find(p => p.value === priority);

  const toggleAssignee = (avatar: string) => {
    setAssignees(prev => prev.includes(avatar) ? prev.filter(a => a !== avatar) : [...prev, avatar]);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    addTask({
      name: name.trim(),
      description,
      statusId,
      priority,
      dueDate,
      assignees: assignees.length > 0 ? assignees : ['https://i.pravatar.cc/150?img=11'],
      tags: [],
      relatedTaskIds: [],
      subtasks: [],
      timeSpent: 0,
      isTimerRunning: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop invisível para fechar */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Flutuante */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[800px] bg-[#1e1e1e] border border-[#333] shadow-2xl rounded-xl flex flex-col overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* Abas Superiores */}
        <div className="flex items-center px-4 pt-3 gap-6 border-b border-[#333] bg-[#141414]">
          <Tab active={activeTab === 'tarefa'} onClick={() => setActiveTab('tarefa')}>Tarefa</Tab>
          <Tab active={activeTab === 'doc'} onClick={() => setActiveTab('doc')}>Documento</Tab>
          <Tab active={activeTab === 'lembrete'} onClick={() => setActiveTab('lembrete')}>Lembrete</Tab>
          <Tab active={activeTab === 'quadro'} onClick={() => setActiveTab('quadro')}>Quadro branco</Tab>

          <div className="flex-1" />
          <button className="p-1.5 text-gray-500 hover:text-gray-300 rounded mb-2"><Maximize2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white rounded mb-2"><X className="w-5 h-5" /></button>
        </div>

        {/* Localização da Tarefa */}
        <div className="px-6 py-3 flex items-center gap-2 text-[11px] text-gray-400 font-medium bg-[#141414]">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-colors border border-transparent hover:border-white/10">
            <Folder className="w-3.5 h-3.5 text-blue-400" />
            Em: LINE OS / Workspace
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50 cursor-pointer" />
        </div>

        {/* Corpo principal */}
        <div className="flex-1 flex flex-col p-6">
          {/* Input de Título Gigante */}
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="Nome da Tarefa ou digite '/' para comandos"
            className="w-full bg-transparent text-2xl font-bold text-white placeholder-[#555] outline-none mb-6"
          />

          {/* Botões de Propriedades em Linha */}
          <div className="flex items-center gap-2 mb-6 flex-wrap relative">
            
            {/* Status Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-[#333] hover:border-[#555] transition-colors text-xs font-bold text-gray-300"
              >
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: currentStatus?.color || '#555' }} />
                {currentStatus?.name?.toUpperCase() || 'STATUS'}
              </button>
              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2b2b2b] border border-[#444] rounded-lg shadow-xl z-50 w-48 py-1">
                  {taskStatuses.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setStatusId(s.id); setShowStatusMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Responsáveis */}
            <div className="relative">
              <button 
                onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-transparent hover:bg-white/5 hover:border-[#333] transition-colors text-xs font-medium text-gray-400"
              >
                {assignees.length === 0 ? (
                  <><User className="w-3.5 h-3.5 border border-dashed rounded-full" /> Responsável</>
                ) : (
                  <div className="flex -space-x-1">
                    {assignees.map(a => <img key={a} src={a} className="w-5 h-5 rounded-full border border-[#1e1e1e]" />)}
                  </div>
                )}
              </button>
              {showAssigneeMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2b2b2b] border border-[#444] rounded-lg shadow-xl z-50 w-48 py-1">
                  {TEAM_MEMBERS.map(m => (
                    <button
                      key={m.name}
                      onClick={() => toggleAssignee(m.avatar)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <img src={m.avatar} className="w-5 h-5 rounded-full" />
                        {m.name}
                      </div>
                      {assignees.includes(m.avatar) && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Data de Vencimento */}
            <div className="relative">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-transparent hover:bg-white/5 hover:border-[#333] transition-colors text-xs font-medium text-gray-400 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 border border-dashed rounded-sm" /> 
                {dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'Datas'}
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>

            {/* Prioridade */}
            <div className="relative">
              <button 
                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border border-transparent hover:bg-white/5 hover:border-[#333] transition-colors text-xs font-medium ${priority === 'None' ? 'text-gray-400' : currentPriority?.color}`}
              >
                <Flag className="w-3.5 h-3.5" /> 
                {priority === 'None' ? 'Prioridade' : currentPriority?.label}
              </button>
              {showPriorityMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#2b2b2b] border border-[#444] rounded-lg shadow-xl z-50 w-36 py-1">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      onClick={() => { setPriority(p.value); setShowPriorityMenu(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/10 transition-colors ${p.color}`}
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-[#333] mx-1" />

            {/* Botão extra / Custom Fields genéricos */}
            <button className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 hover:bg-white/5 rounded transition-colors border border-transparent hover:border-[#333]">
              <TagIcon className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 hover:bg-white/5 rounded transition-colors border border-transparent hover:border-[#333]">
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Textarea Descrição */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Pressione '/' para comandos"
            className="flex-1 w-full bg-transparent text-[13px] text-gray-300 placeholder-[#555] outline-none resize-none"
          />

          <div className="flex items-center gap-2 mb-2">
            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
              <Sparkles className="w-3.5 h-3.5" /> IA
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#333] bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#222] border border-[#333] rounded text-xs text-gray-400 cursor-pointer hover:bg-[#2b2b2b] transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Em Fazer
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">Cancelar</button>
            <div className="flex items-center rounded-lg overflow-hidden shadow-lg shadow-primary/20">
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold disabled:opacity-50 transition-colors border-r border-primary/20"
              >
                Criar Tarefa
              </button>
              <button className="px-2 py-2.5 bg-primary hover:bg-primary/90 text-white transition-colors">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

const Tab = ({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
      active ? 'border-primary text-gray-100' : 'border-transparent text-gray-500 hover:text-gray-300'
    }`}
  >
    {children}
  </button>
);
