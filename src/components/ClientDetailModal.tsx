import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X, Building2, Calendar, DollarSign, Briefcase, 
  Sparkles, MoreHorizontal, Link, Paperclip, Share2, Search,
  Clock, Tag, Network, Users, ChevronRight, PlayCircle, Plus,
  AlignLeft, History, Lock, Maximize2, Flag, CheckCircle2, ChevronDown
} from 'lucide-react';
import { Client } from '../types';
import useEscapeKey from '../hooks/useEscapeKey';
import { useAppContext } from '../context/AppContext';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onUpdate: (id: string, updates: Partial<Client>) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen, onClose, client, onUpdate
}) => {
  useEscapeKey(onClose, isOpen);

  const { clientStatuses, addClientComment, loadClientComments } = useAppContext();
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'activity' | 'comments'>('comments');

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        faturamento: client.faturamento || '',
        segmento: client.segmento || '',
        repositorio: client.repositorio || '',
        ultimaReuniao: client.ultimaReuniao || '',
        statusId: client.statusId || '',
        priority: client.priority || 'None',
        estimatedTime: client.estimatedTime || 0,
        trackedTime: client.trackedTime || 0,
        description: client.description || '',
        assignees: client.assignees || [],
        tags: client.tags || [],
        startDate: client.startDate || '',
        dueDate: client.dueDate || '',
      });
      loadClientComments(client.id);
    }
  }, [client, loadClientComments]);

  if (!isOpen || !client) return null;

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await addClientComment(client.id, {
      authorName: 'Você', // Ideal seria pegar o nome do usuário logado do useAuth
      authorAvatar: 'https://i.pravatar.cc/150?img=11',
      content: newComment.trim(),
    });
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleChange = (field: keyof Client, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Log activity automatically for certain fields
    if (field !== 'activities' && field !== 'comments') {
      const fieldNames: Record<string, string> = {
        statusId: 'Status', priority: 'Prioridade', assignees: 'Responsáveis', 
        name: 'Nome', description: 'Descrição'
      };
      const fname = fieldNames[field as string] || field;
      const newActivity = {
        id: `act-${Date.now()}`,
        type: 'system',
        description: `Atualizou o campo ${fname}`,
        createdAt: new Date().toISOString()
      };
      
      const updatedActivities = [newActivity, ...(formData.activities || [])];
      setFormData(prev => ({ ...prev, activities: updatedActivities }));
      onUpdate(client.id, { [field]: value, activities: updatedActivities });
    } else {
      onUpdate(client.id, { [field]: value });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const currentStatus = clientStatuses.find(s => s.id === formData.statusId) || clientStatuses[0];

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-[1400px] h-[92vh] bg-[#1a1a1a] border border-[#2b2b2b] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Breadcrumb Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#2b2b2b] bg-[#111]">
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 cursor-pointer transition-colors">
               <div className="w-4 h-4 bg-red-500/20 rounded flex items-center justify-center text-red-400 text-[10px]">E</div>
               Espaço da equipe
            </div>
            <span className="text-gray-600">/</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 cursor-pointer transition-colors">
               <Building2 className="w-3.5 h-3.5" />
               Clientes
            </div>
            <span className="text-gray-600">/</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-gray-300 transition-colors">
               <span className="w-3 h-3 bg-red-500 rounded-sm inline-block" /> {formData.name || 'Sem título'}
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-[11px] font-medium text-gray-400">
            <span className="hidden md:inline">Criada em mai 23</span>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-md transition-colors border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Pergunte à IA
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/5 rounded-md transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Compartilhar
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded-md transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#333] mx-1" />
            <button className="p-1.5 hover:bg-white/5 rounded-md transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-md transition-colors hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Split View */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Pane - Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111111] flex flex-col">
            <div className="px-10 py-8 max-w-4xl">
              
              {/* Type and ID */}
              <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-500 mb-4">
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded border border-white/5">
                  <Building2 className="w-3.5 h-3.5" /> Client
                </div>
                <span>{client.id.split('-')[0]}</span>
                <button className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" /> Pergunte à IA
                </button>
              </div>

              {/* Title Input */}
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Sem título"
                className="w-full bg-transparent text-3xl font-bold text-gray-100 placeholder-gray-600 focus:outline-none mb-6"
              />

              {/* Brain Banner */}
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg p-3 mb-8 cursor-text">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-gray-400">Peça ao Brain para <span className="text-gray-200">Escrever uma descrição</span>, Gerar subtarefas ou encontrar clientes semelhantes</span>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 text-[13px]">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                      Status
                    </div>
                    <div className="flex-1 relative">
                      <button 
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90" 
                        style={{ backgroundColor: currentStatus?.color || '#555' }}
                      >
                        {currentStatus?.name || 'NEW CLIENT'} <ChevronDown className="w-3 h-3 opacity-50" />
                      </button>
                      
                      {isStatusDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)} />
                          <div className="absolute top-full mt-1 left-0 w-48 bg-[#222] border border-[#333] rounded-md shadow-xl z-50 py-1 flex flex-col gap-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                            {clientStatuses.map(s => (
                              <div 
                                key={s.id} 
                                onClick={() => { handleChange('statusId', s.id); setIsStatusDropdownOpen(false); }} 
                                className="px-3 py-2 hover:bg-white/5 cursor-pointer text-xs font-medium text-gray-300 flex items-center gap-2 transition-colors"
                              >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.name}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Calendar className="w-3.5 h-3.5" /></span>
                      Datas
                    </div>
                    <div className="flex-1 flex items-center gap-2 text-gray-500 font-medium">
                      <input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="bg-transparent text-gray-200 hover:bg-white/5 px-2 py-1 rounded transition-colors focus:outline-none w-[110px]"
                      />
                      <ChevronRight className="w-3 h-3" />
                      <input
                        type="date"
                        value={formData.dueDate || ''}
                        onChange={(e) => handleChange('dueDate', e.target.value)}
                        className="bg-transparent text-gray-200 hover:bg-white/5 px-2 py-1 rounded transition-colors focus:outline-none w-[110px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Clock className="w-3.5 h-3.5" /></span>
                      Tempo estimado
                    </div>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        value={formData.estimatedTime || ''}
                        onChange={(e) => handleChange('estimatedTime', parseInt(e.target.value) || 0)}
                        placeholder="Em horas"
                        className="bg-transparent text-gray-200 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 transition-colors focus:outline-none w-24"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Tag className="w-3.5 h-3.5" /></span>
                      Etiquetas
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={(formData.tags || []).map((t: any) => t.name || t).join(', ')}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newTags = val.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name, color: '#4b5563', bgColor: '#1f2937' }));
                          handleChange('tags', newTags);
                        }}
                        placeholder="Tag 1, Tag 2"
                        className="w-full bg-transparent text-gray-200 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 transition-colors focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Users className="w-3.5 h-3.5" /></span>
                      Responsáveis
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={(formData.assignees || []).join(', ')}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleChange('assignees', val.split(',').map(s => s.trim()).filter(Boolean));
                        }}
                        placeholder="URL de avatar"
                        className="w-full bg-transparent text-gray-200 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 transition-colors focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Flag className="w-3.5 h-3.5" /></span>
                      Prioridade
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 -ml-2">
                      <select
                        value={formData.priority || 'None'}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        className="bg-transparent text-gray-300 font-medium hover:bg-white/5 px-2 py-1 rounded cursor-pointer transition-colors focus:outline-none appearance-none"
                      >
                        <option value="None" className="bg-[#1a1a1a]">Sem prioridade</option>
                        <option value="Low" className="bg-[#1a1a1a]">Baixa</option>
                        <option value="Normal" className="bg-[#1a1a1a]">Normal</option>
                        <option value="High" className="bg-[#1a1a1a]">Alta</option>
                        <option value="Urgent" className="bg-[#1a1a1a]">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><PlayCircle className="w-3.5 h-3.5" /></span>
                      Tempo rastreado
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 -ml-2">
                      <input 
                        type="number" 
                        value={formData.trackedTime || ''}
                        onChange={(e) => handleChange('trackedTime', parseInt(e.target.value) || 0)}
                        placeholder="Em horas"
                        className="bg-transparent text-gray-400 font-medium hover:bg-white/5 px-2 py-1 rounded transition-colors focus:outline-none w-24"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Network className="w-3.5 h-3.5" /></span>
                      Relacionamentos
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={(formData.relatedTaskIds || []).join(', ')}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleChange('relatedTaskIds', val.split(',').map(s => s.trim()).filter(Boolean));
                        }}
                        placeholder="Adicionar ID de relação"
                        className="w-full bg-transparent text-gray-200 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 transition-colors focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-10">
                <div className="flex items-center gap-2 text-gray-500 mb-3 hover:text-gray-300 cursor-pointer transition-colors">
                  <AlignLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Descrição do Cliente</span>
                </div>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Adicione uma descrição, observações gerais ou contexto do cliente..."
                  className="w-full bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#444] resize-y min-h-[100px] transition-colors"
                />
              </div>

              {/* Campos Customizados */}
              <div className="mb-10">
                <h3 className="text-sm font-bold text-gray-200 mb-4">Campos</h3>
                <div className="flex flex-col border border-[#2b2b2b] rounded-lg bg-[#1a1a1a] overflow-hidden">
                  
                  <div className="flex items-center border-b border-[#2b2b2b] hover:bg-white/5 transition-colors">
                    <div className="w-[240px] px-4 py-3 flex items-center gap-2 text-xs font-medium text-gray-400 border-r border-[#2b2b2b]">
                      <DollarSign className="w-3.5 h-3.5" /> Faturamento Anual Cont...
                    </div>
                    <div className="flex-1 px-4">
                      <input 
                        type="text" 
                        value={formData.faturamento || ''}
                        onChange={(e) => handleChange('faturamento', e.target.value)}
                        placeholder="-"
                        className="w-full bg-transparent text-xs text-gray-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center border-b border-[#2b2b2b] hover:bg-white/5 transition-colors">
                    <div className="w-[240px] px-4 py-3 flex items-center gap-2 text-xs font-medium text-gray-400 border-r border-[#2b2b2b]">
                      <Link className="w-3.5 h-3.5" /> Repositório de Docume...
                    </div>
                    <div className="flex-1 px-4">
                      <input 
                        type="text" 
                        value={formData.repositorio || ''}
                        onChange={(e) => handleChange('repositorio', e.target.value)}
                        placeholder="-"
                        className="w-full bg-transparent text-xs text-gray-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center border-b border-[#2b2b2b] hover:bg-white/5 transition-colors">
                    <div className="w-[240px] px-4 py-3 flex items-center gap-2 text-xs font-medium text-gray-400 border-r border-[#2b2b2b]">
                      <Briefcase className="w-3.5 h-3.5" /> Segmento de Atuaçã...
                    </div>
                    <div className="flex-1 px-4">
                      <input 
                        type="text" 
                        value={formData.segmento || ''}
                        onChange={(e) => handleChange('segmento', e.target.value)}
                        placeholder="-"
                        className="w-full bg-transparent text-xs text-gray-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center hover:bg-white/5 transition-colors">
                    <div className="w-[240px] px-4 py-3 flex items-center gap-2 text-xs font-medium text-gray-400 border-r border-[#2b2b2b]">
                      <Calendar className="w-3.5 h-3.5" /> Última Reunião de Suce...
                    </div>
                    <div className="flex-1 px-4">
                      <input 
                        type="text" 
                        value={formData.ultimaReuniao || ''}
                        onChange={(e) => handleChange('ultimaReuniao', e.target.value)}
                        placeholder="-"
                        className="w-full bg-transparent text-xs text-gray-200 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Subtarefas */}
              <div>
                <h3 className="text-sm font-bold text-gray-200 mb-4">Adicionar Tarefas / Subtarefas Relacionadas</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Ex: Tarefa XYZ, Novo projeto..."
                    className="flex-1 bg-transparent text-sm text-gray-200 hover:bg-white/5 px-3 py-2 rounded border border-transparent focus:border-[#444] transition-colors focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                        const newTasks = [...(formData.relatedTaskIds || []), e.currentTarget.value.trim()];
                        handleChange('relatedTaskIds', newTasks);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 px-3 py-2 rounded border border-[#333] transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
                
                {/* Lista de Tarefas Relacionadas */}
                {formData.relatedTaskIds && formData.relatedTaskIds.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {formData.relatedTaskIds.map((taskId, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#1a1a1a] border border-[#2b2b2b] px-3 py-2 rounded-lg">
                        <span className="text-xs text-gray-300 font-medium">{taskId}</span>
                        <button 
                          onClick={() => {
                            const newTasks = formData.relatedTaskIds!.filter((_, i) => i !== idx);
                            handleChange('relatedTaskIds', newTasks);
                          }}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Pane - Activity */}
          <div className="w-[420px] bg-[#141414] border-l border-[#2b2b2b] flex flex-col flex-shrink-0">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#2b2b2b] flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-200">Atividade</h3>
              <div className="flex items-center gap-3 text-gray-500">
                <Search className="w-4 h-4 hover:text-gray-300 cursor-pointer transition-colors" />
                <div className="w-px h-4 bg-[#333]" />
                <button 
                  onClick={() => setActiveRightTab('activity')}
                  className={`text-[11px] font-medium px-2 py-1 rounded transition-colors ${activeRightTab === 'activity' ? 'bg-white/10 text-gray-200' : 'hover:bg-white/5 text-gray-500'}`}
                >
                  Histórico
                </button>
                <button 
                  onClick={() => setActiveRightTab('comments')}
                  className={`text-[11px] font-medium px-2 py-1 rounded transition-colors ${activeRightTab === 'comments' ? 'bg-white/10 text-gray-200' : 'hover:bg-white/5 text-gray-500'}`}
                >
                  Comentários
                </button>
              </div>
            </div>

            {/* Content Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              <div className="flex flex-col gap-6 relative">
                {/* Timeline Line */}
                <div className="absolute left-3 top-2 bottom-0 w-px bg-[#2b2b2b] -z-10" />

                {activeRightTab === 'comments' && (
                  (client.comments || []).length === 0 ? (
                    <div className="text-center text-gray-500 text-xs mt-4 bg-[#141414] py-2">Nenhum comentário ainda.</div>
                  ) : (
                    (client.comments || []).map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <img 
                          src={comment.authorAvatar} 
                          alt={comment.authorName}
                          className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 z-10 border border-[#333]" 
                        />
                        <div className="flex-1 bg-[#1a1a1a] p-3 rounded-lg border border-[#2b2b2b]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-gray-200 text-[12px]">{comment.authorName}</span>
                            <span className="text-[10px] text-gray-500">
                              {new Date(comment.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="text-[13px] text-gray-400 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeRightTab === 'activity' && (
                  (formData.activities || []).length === 0 ? (
                    <div className="text-center text-gray-500 text-xs mt-4 bg-[#141414] py-2">Nenhuma atividade recente.</div>
                  ) : (
                    (formData.activities || []).map((act: any) => (
                      <div key={act.id} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center flex-shrink-0 mt-0.5 z-10">
                          <History className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="flex-1 mt-1">
                          <p className="text-[13px] text-gray-300">{act.description}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(act.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>

            {/* Comment Input (only visible if comments tab is active) */}
            {activeRightTab === 'comments' && (
            <div className="p-4 border-t border-[#2b2b2b] bg-[#141414]">
              <div className="bg-[#1a1a1a] border border-[#333] rounded-xl focus-within:border-[#555] transition-colors">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                  placeholder="Escreva um comentário..."
                  className="w-full bg-transparent text-[13px] text-gray-200 placeholder-gray-500 p-3 pb-1 resize-none focus:outline-none min-h-[60px]"
                />
                <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] rounded-b-xl border-t border-[#2b2b2b]">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded transition-colors"><Plus className="w-4 h-4" /></button>
                    <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-[11px] font-medium text-gray-400">Comentário</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </div>
                    <button className="p-1 text-gray-500 hover:text-purple-400 transition-colors ml-1"><Sparkles className="w-3.5 h-3.5" /></button>
                    <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors"><Paperclip className="w-3.5 h-3.5" /></button>
                    <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors">@</button>
                    <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors">😎</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"><Lock className="w-3.5 h-3.5" /></button>
                    <button 
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      <PlayCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
