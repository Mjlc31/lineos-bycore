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

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        faturamento: client.faturamento || '',
        segmento: client.segmento || '',
        repositorio: client.repositorio || '',
        ultimaReuniao: client.ultimaReuniao || '',
        statusId: client.statusId || '',
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
    onUpdate(client.id, { [field]: value });
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
                    <div className="flex-1">
                      <button className="flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: currentStatus?.color || '#555' }}>
                        {currentStatus?.name || 'NEW CLIENT'} <ChevronDown className="w-3 h-3 opacity-50" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Calendar className="w-3.5 h-3.5" /></span>
                      Datas
                    </div>
                    <div className="flex-1 flex items-center gap-2 text-gray-500 font-medium cursor-pointer hover:bg-white/5 px-2 py-1 rounded -ml-2 transition-colors">
                      Início <ChevronRight className="w-3 h-3" /> Vencimento
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Clock className="w-3.5 h-3.5" /></span>
                      Tempo estimado
                    </div>
                    <div className="flex-1 text-gray-600 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 cursor-pointer transition-colors">
                      Vazio
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Tag className="w-3.5 h-3.5" /></span>
                      Etiquetas
                    </div>
                    <div className="flex-1 text-gray-600 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 cursor-pointer transition-colors">
                      Vazio
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
                    <div className="flex-1 flex items-center gap-2 text-gray-600 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 cursor-pointer transition-colors">
                      Vazio
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Flag className="w-3.5 h-3.5" /></span>
                      Prioridade
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 text-gray-400 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 cursor-pointer transition-colors">
                      <Flag className="w-3.5 h-3.5 text-gray-500" fill="currentColor" /> Baixa
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><PlayCircle className="w-3.5 h-3.5" /></span>
                      Tempo rastreado
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 text-gray-400 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 cursor-pointer transition-colors">
                      <PlayCircle className="w-3.5 h-3.5" /> Adicionar hora
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-[120px] flex items-center gap-2 text-gray-400">
                      <span className="w-4 flex justify-center"><Network className="w-3.5 h-3.5" /></span>
                      Relacionamentos
                    </div>
                    <div className="flex-1 text-gray-600 font-medium hover:bg-white/5 px-2 py-1 rounded -ml-2 cursor-pointer transition-colors">
                      Vazio
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-10">
                <div className="flex items-center gap-2 text-gray-500 mb-3 hover:text-gray-300 cursor-pointer transition-colors">
                  <AlignLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Adicionar descrição</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg p-2.5 w-max hover:border-[#444] cursor-pointer transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-semibold text-gray-300">Escrever com IA</span>
                </div>
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
                <h3 className="text-sm font-bold text-gray-200 mb-4">Adicionar subtarefa</h3>
                <button className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 px-2 py-1.5 rounded transition-colors -ml-2">
                  <Plus className="w-3.5 h-3.5" /> Add Client
                </button>
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
                <History className="w-4 h-4 hover:text-gray-300 cursor-pointer transition-colors" />
                <div className="w-px h-4 bg-[#333]" />
                <span className="text-[11px] font-medium border border-[#333] rounded px-1.5 hover:bg-white/5 cursor-pointer">
                  Atividade
                </span>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              <div className="flex flex-col gap-6 relative">
                {/* Timeline Line */}
                <div className="absolute left-3 top-2 bottom-0 w-px bg-[#2b2b2b] -z-10" />

                {(client.comments || []).length === 0 ? (
                  <div className="text-center text-gray-500 text-xs mt-4">Nenhum comentário ainda.</div>
                ) : (
                  (client.comments || []).map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <img 
                        src={comment.authorAvatar} 
                        alt={comment.authorName}
                        className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 z-10 border border-[#333]" 
                      />
                      <div className="flex-1">
                        <p className="text-[13px] text-gray-300">
                          <span className="font-semibold text-gray-200">{comment.authorName}</span>
                        </p>
                        <p className="text-[13px] text-gray-400 mt-1 whitespace-pre-wrap">{comment.content}</p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment Input */}
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
          </div>
        </div>
      </motion.div>
    </div>
  );
};
