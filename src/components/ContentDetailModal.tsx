import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Image as ImageIcon, FileText, CheckCircle2, MessageSquare, Calendar, X, Clock, MonitorPlay, AlignLeft, Download, Music, Send } from 'lucide-react';
import { ContentItem } from '../types';
import { Modal } from './ui/Modal';
import useEscapeKey from '../hooks/useEscapeKey';

interface ContentDetailModalProps {
  content: ContentItem;
  onClose: () => void;
  onApprove?: (id: number | string) => void;
  onRequestChange?: (id: number | string, feedback: string) => void;
  readonly?: boolean;
}

const channelColors: Record<string, string> = {
  instagram: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  tiktok: 'bg-black text-white border-white/20',
  youtube: 'bg-red-500/10 text-red-500 border-red-500/20',
  kwai: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  linkedin: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  facebook: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
};

export const ContentDetailModal = ({ content, onClose, onApprove, onRequestChange, readonly = false }: ContentDetailModalProps) => {
  useEscapeKey(onClose);
  const [feedbackText, setFeedbackText] = useState('');
  const [isRequestingChange, setIsRequestingChange] = useState(false);

  const handleSubmitFeedback = () => {
    if (feedbackText.trim() && onRequestChange) {
      onRequestChange(content.id, feedbackText.trim());
      setIsRequestingChange(false);
      setFeedbackText('');
    }
  };

  const toDisplayDate = (iso?: string) => {
    if (!iso) return 'Não definida';
    if (iso.includes('/')) return iso;
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Detalhes do Conteúdo" maxWidth="max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-6 h-[80vh] overflow-hidden bg-[#0a0a0a] -m-6 p-6 rounded-b-2xl">
        
        {/* Lado Esquerdo: Media Preview */}
        <div className="flex-1 bg-[#111] border border-[#222] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          {content.fileUrl ? (
            <>
              {content.type === 'image' && (
                <img src={content.fileUrl} alt={content.title} className="max-w-full max-h-full object-contain p-4 drop-shadow-2xl" />
              )}
              {content.type === 'video' && (
                <video src={content.fileUrl} controls autoPlay className="w-full h-full object-contain bg-black outline-none" />
              )}
              {content.type === 'audio' && (
                <div className="w-full flex flex-col items-center justify-center py-12 gap-6">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${content.color} flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-pulse`}>
                    <Music className="w-12 h-12 text-white" />
                  </div>
                  <audio src={content.fileUrl} controls autoPlay className="w-[80%] max-w-md outline-none" />
                </div>
              )}
              {content.type === 'pdf' && (
                <iframe src={content.fileUrl} className="w-full h-full bg-white rounded-xl" title={content.title} />
              )}
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <a 
                   href={content.fileUrl} 
                   download={content.title}
                   className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2.5 rounded-xl transition-all shadow-xl border border-white/10"
                   title="Baixar Arquivo"
                 >
                   <Download className="w-5 h-5" />
                 </a>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-20 flex flex-col items-center">
               <FileText className="w-16 h-16 mb-4 opacity-50" />
               <p className="text-lg font-medium text-gray-400 mb-2">Arquivo não disponível</p>
               <p className="text-sm">Esta mídia é apenas um placeholder de demonstração.</p>
            </div>
          )}
        </div>

        {/* Lado Direito: Detalhes e Ações */}
        <div className="w-full lg:w-[400px] flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-2 pb-4">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 border ${
                  content.status === 'PENDENTE' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  content.status === 'REVISÃO'  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-green-500/20 text-green-400 border-green-500/30'
                }`}>
                  {content.status}
                </span>
                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1">
                   {content.type === 'video' && <Play className="w-3 h-3" />}
                   {content.type === 'image' && <ImageIcon className="w-3 h-3" />}
                   {content.type === 'pdf' && <FileText className="w-3 h-3" />}
                   {content.type}
                </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">{content.title}</h2>
          </div>

          {/* Metadados */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-4 space-y-4">
            
            {/* Cliente */}
            {content.clientEmail && !readonly && (
              <div className="flex items-center gap-3 text-sm border-b border-[#222] pb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {content.clientEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Cliente Vinculado</p>
                  <p className="text-gray-200 font-medium">{content.clientEmail}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                 <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                 <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Postagem</p>
                   <p className="text-sm font-medium text-gray-200">{toDisplayDate(content.postDate)}</p>
                 </div>
              </div>
              <div className="flex items-start gap-2.5">
                 <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                 <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Horário</p>
                   <p className="text-sm font-medium text-gray-200">{content.postTime || 'Não definido'}</p>
                 </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-[#222]">
               <MonitorPlay className="w-4 h-4 text-gray-400 mt-0.5" />
               <div className="flex-1">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Canais & Formato</p>
                 <div className="flex flex-wrap gap-1.5 mb-2">
                   {(content.postChannels && content.postChannels.length > 0) ? content.postChannels.map(ch => (
                     <span key={ch} className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${channelColors[ch.toLowerCase()] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                       {ch}
                     </span>
                   )) : (
                     <span className="text-xs text-gray-500 italic">Sem canais definidos</span>
                   )}
                 </div>
                 {content.postFormat && (
                   <p className="text-xs font-medium text-gray-300 bg-[#222] inline-block px-2 py-1 rounded-md">
                     Formato: {content.postFormat}
                   </p>
                 )}
               </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col flex-1 min-h-[150px]">
            <div className="flex items-center gap-2 mb-3">
              <AlignLeft className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Legenda do Post</h3>
            </div>
            <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar flex-1 pr-2">
               {content.caption || <span className="italic text-gray-600">Nenhuma legenda adicionada para este post.</span>}
            </div>
          </div>

          {/* Histórico de Feedbacks */}
          {((content.feedbacks && content.feedbacks.length > 0) || content.feedback) ? (
            <div className="bg-[#141414] border border-[#222] rounded-xl p-4 flex flex-col flex-1 min-h-[150px] max-h-[300px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-yellow-500" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Histórico de Alterações</h3>
              </div>
              <div className="flex flex-col gap-3">
                {content.feedback && (!content.feedbacks || content.feedbacks.length === 0) && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-sm text-gray-200">
                    <span className="text-[10px] font-bold text-yellow-500 block mb-1">Feedback Original</span>
                    {content.feedback}
                  </div>
                )}
                {content.feedbacks?.map(fb => (
                  <div key={fb.id} className={`p-3 rounded-lg text-sm shadow-md ${fb.author === 'cliente' ? 'bg-blue-500/10 border border-blue-500/20 text-gray-200 ml-4' : 'bg-[#222] border border-[#333] text-gray-300 mr-4'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${fb.author === 'cliente' ? 'text-blue-400' : 'text-gray-400'}`}>
                        {fb.author === 'cliente' ? 'Cliente' : 'Agência'}
                      </span>
                      <span className="text-[9px] text-gray-500 font-medium">
                        {new Date(fb.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{fb.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Ações (Aprovar / Alterar) */}
          {!readonly && content.status !== 'APROVADO' && (
            <div className="mt-auto flex flex-col gap-3 pt-2">
              {isRequestingChange ? (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-[#1a1a1a] p-3 rounded-xl border border-yellow-500/30">
                  <textarea
                    autoFocus
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Descreva as alterações necessárias..."
                    className="w-full bg-black/40 border border-[#333] rounded-lg p-2.5 text-sm focus:outline-none focus:border-yellow-500 resize-none h-20 mb-2 text-white"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setIsRequestingChange(false)} className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-400 bg-[#222] hover:bg-[#333]">Cancelar</button>
                    <button onClick={handleSubmitFeedback} className="flex-[2] py-2 rounded-lg text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center gap-1.5">
                      <Send className="w-3 h-3" /> Enviar Pedido
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsRequestingChange(true)}
                    className="py-3 rounded-xl text-sm font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" /> Alteração
                  </button>
                  <button 
                    onClick={() => onApprove && onApprove(content.id)}
                    className="py-3 rounded-xl text-sm font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aprovar
                  </button>
                </div>
              )}
            </div>
          )}
          {!readonly && content.status === 'APROVADO' && (
             <div className="mt-auto py-3 rounded-xl text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Material Aprovado
             </div>
          )}

        </div>
      </div>
    </Modal>
  );
};
