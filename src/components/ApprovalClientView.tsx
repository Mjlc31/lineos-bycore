import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MessageSquare, Play, FileText, Image as ImageIcon, Music, Calendar } from 'lucide-react';
import { ContentItem } from '../types';
import { useAppContext } from '../context/AppContext';
import { useToast } from './Toast';
import { ContentDetailModal } from './ContentDetailModal';
import { ContentCalendarView } from './ContentCalendarView';

const toDisplayDate = (iso?: string) => {
  if (!iso) return '';
  if (iso.includes('/')) return iso;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const ApprovalClientView = () => {
  const { contentItems, updateContentStatus } = useAppContext(); 
  // O backend já filtra (RLS) os itens pelo email do usuário logado (role=CLIENTE).
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const { showToast, ToastContainer } = useToast();

  const handleApprove = (id: string | number) => {
    updateContentStatus(Number(id), 'APROVADO', null);
    showToast('Pronto! Material aprovado com sucesso.', 'success');
  };

  const submitFeedback = (id: string | number, feedbackText: string) => {
    updateContentStatus(Number(id), 'REVISÃO', feedbackText);
    showToast('Sua solicitação de alteração foi enviada para a equipe.', 'success');
  };

  // Os clientes visualizam preferencialmente o que está Pendente ou em Revisão, mas podem ver aprovados se quiserem.
  const items = contentItems;

  return (
    <div className="h-full bg-[#050507] text-white p-4 sm:p-8 font-sans flex flex-col overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
        {/* Header Public */}
        <div className="text-center mb-10 shrink-0">
           <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Portal de Aprovação</h1>
           <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-6">
             Revise os materiais produzidos pela nossa equipe. Clique em "Detalhes" para aprovar, visualizar em tela cheia ou solicitar alterações.
           </p>
           
           <div className="flex bg-[#141414] p-1 rounded-xl border border-white/5 mx-auto max-w-fit">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#2a2a2a] text-white shadow-md border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Grade de Conteúdos
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'calendar' ? 'bg-[#2a2a2a] text-white shadow-md border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Calendar className="w-4 h-4" /> Visão 360º (Calendário)
              </button>
            </div>
        </div>

        {items.length === 0 ? (
           <div className="bg-[#111] border border-[#222] rounded-2xl p-12 text-center flex flex-col items-center flex-1 justify-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Tudo em dia!</h2>
              <p className="text-gray-400 text-sm">Não há mídias vinculadas ao seu painel no momento.</p>
           </div>
        ) : (
           viewMode === 'grid' ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
               <AnimatePresence mode="popLayout">
                 {items.map(content => (
                   <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={content.id}
                      className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl flex flex-col group hover:border-[#444] transition-all"
                   >
                     {/* Thumbnail Area */}
                     <div className={`relative aspect-video flex items-center justify-center ${content.color} overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                          <button 
                            onClick={() => setViewingContent(content)}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors border border-white/20 shadow-xl"
                          >
                            <Play className="w-5 h-5 fill-white" /> Ver Detalhes
                          </button>
                        </div>

                        {/* Top badges */}
                        <div className="absolute top-3 right-3 flex gap-2 z-20">
                          <div className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 border ${
                            content.status === 'PENDENTE' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            content.status === 'REVISÃO'  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border-green-500/30'
                          }`}>
                            {content.status}
                          </div>
                        </div>

                        {content.fileUrl ? (
                          content.type === 'image' ? (
                            <img src={content.fileUrl} className="w-full h-full object-cover opacity-90 mix-blend-screen" />
                          ) : content.type === 'video' ? (
                            <video src={content.fileUrl} className="w-full h-full object-cover mix-blend-screen opacity-90" autoPlay muted loop />
                          ) : content.type === 'audio' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 backdrop-blur-md relative z-10">
                               <Music className={`w-8 h-8 ${content.textColor} mb-3`} />
                            </div>
                          ) : (
                            <div className="w-24 h-32 bg-white/90 shadow-2xl rounded-md flex flex-col p-3 border border-gray-300 transform -rotate-2 relative z-10">
                              <div className="w-1/2 h-2.5 bg-red-500 rounded-sm mb-4"></div>
                              <div className="space-y-2">
                                <div className="w-full h-1.5 bg-gray-300 rounded"></div>
                                <div className="w-full h-1.5 bg-gray-300 rounded"></div>
                                <div className="w-3/4 h-1.5 bg-gray-300 rounded"></div>
                              </div>
                           </div>
                          )
                        ) : (
                           <div className="flex flex-col items-center justify-center opacity-70 relative z-10">
                              {content.type === 'video' && <Play className="w-10 h-10 mb-2" />}
                              {content.type === 'image' && <ImageIcon className="w-10 h-10 mb-2" />}
                              {content.type === 'pdf' && <FileText className="w-10 h-10 mb-2" />}
                              {content.type === 'audio' && <Music className="w-10 h-10 mb-2" />}
                              <span className="text-xs font-bold uppercase">Mídia de Exemplo</span>
                           </div>
                        )}
                     </div>

                     {/* Info & Actions */}
                     <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-[#141414] to-[#0a0a0a]">
                        <h3 className="text-lg font-bold mb-1 line-clamp-2">{content.title}</h3>
                        
                        <div className="flex items-center gap-3 mb-5 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium bg-[#222] px-2 py-1 rounded">
                            <Calendar className="w-3.5 h-3.5" /> Post: {toDisplayDate(content.postDate)}
                          </span>
                          {content.postChannels && content.postChannels.length > 0 && (
                            <div className="flex gap-1">
                              {content.postChannels.slice(0, 2).map(ch => (
                                <span key={ch} className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-bold uppercase">{ch}</span>
                              ))}
                              {content.postChannels.length > 2 && <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-bold">+{content.postChannels.length - 2}</span>}
                            </div>
                          )}
                        </div>

                        {content.status === 'APROVADO' ? (
                          <div className="mt-auto py-3 rounded-xl text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Aprovado
                          </div>
                        ) : (
                          <div className="mt-auto pt-2 grid grid-cols-2 gap-3">
                             <button 
                               onClick={() => setViewingContent(content)}
                               className="py-3 rounded-xl text-sm font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 flex items-center justify-center gap-2 transition-colors"
                             >
                                <MessageSquare className="w-4 h-4" /> Detalhes
                             </button>
                             <button 
                               onClick={() => handleApprove(content.id)}
                               className="py-3 rounded-xl text-sm font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center justify-center gap-2 transition-colors"
                             >
                                <CheckCircle2 className="w-4 h-4" /> Aprovar
                             </button>
                          </div>
                        )}
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
           ) : (
             <div className="flex-1 min-h-[500px]">
               <ContentCalendarView onContentClick={(c) => setViewingContent(c)} />
             </div>
           )
        )}
      </div>

      <AnimatePresence>
        {viewingContent !== null && (
          <ContentDetailModal 
            content={viewingContent} 
            onClose={() => setViewingContent(null)}
            onApprove={(id) => {
              handleApprove(id);
              setViewingContent(null);
            }}
            onRequestChange={(id, txt) => {
              submitFeedback(id, txt);
              setViewingContent(null);
            }}
          />
        )}
      </AnimatePresence>
      <ToastContainer />
    </div>
  );
};

export default ApprovalClientView;
