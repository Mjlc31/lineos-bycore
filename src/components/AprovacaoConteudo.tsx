import React, { useState, useCallback } from 'react';
import { Play, Image as ImageIcon, FileText, CheckCircle2, MessageSquare, Calendar, X, Plus, Upload, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import useEscapeKey from '../hooks/useEscapeKey';
import { useToast } from './Toast';
import { ContentType, ContentStatus, ContentItem } from '../types';
import { Modal } from './ui/Modal';

// ─── Helpers de Data ──────────────────────────────────────────────────────────
const toDisplayDate = (iso: string) => {
  if (!iso) return '';
  if (iso.includes('/')) return iso;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// ─── Feedback Modal ───────────────────────────────────────────────────────────
interface FeedbackModalProps {
  onConfirm: (text: string) => void;
  onClose: () => void;
  existing?: string | null;
}

const FeedbackModal = ({ onConfirm, onClose, existing }: FeedbackModalProps) => {
  const [text, setText] = useState(existing ?? '');
  useEscapeKey(onClose);

  return (
    <Modal isOpen={true} onClose={onClose} title="Solicitar Alteração" maxWidth="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-2">Descreva as alterações necessárias:</label>
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none placeholder-gray-600"
            placeholder="Ex: Aumentar o logo, trocar a cor do fundo..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { if (text.trim()) { onConfirm(text.trim()); } }}
            disabled={!text.trim()}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 disabled:opacity-40 disabled:from-yellow-800 disabled:to-yellow-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Enviar Feedback
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Novo Conteúdo Modal ──────────────────────────────────────────────────────
const colorMap: Record<ContentType, { color: string; textColor: string; thumbnail: string }> = {
  video: { color: 'from-red-900/80 to-black', textColor: 'text-red-500', thumbnail: 'N' },
  image: { color: 'from-pink-600/80 to-orange-500/80', textColor: 'text-white', thumbnail: 'img' },
  pdf:   { color: 'bg-gradient-to-br from-gray-300 to-gray-500', textColor: 'text-gray-900', thumbnail: 'pdf' },
};

const NovoConteudoModal = ({ onAdd, onClose }: { onAdd: (item: Omit<ContentItem, 'id'>) => void; onClose: () => void }) => {
  const [form, setForm] = useState({ title: '', type: 'video' as ContentType, date: new Date().toISOString().split('T')[0] });
  useEscapeKey(onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    const meta = colorMap[form.type];
    onAdd({
      title: form.title,
      type: form.type,
      status: 'PENDENTE',
      date: form.date,
      feedback: null,
      ...meta,
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Adicionar Mídia" maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Título do Material</label>
            <input
              type="text"
              required
              autoFocus
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Ex: Campanha Institucional - Feed"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Formato</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as ContentType })}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="video">Vídeo</option>
                <option value="image">Imagem</option>
                <option value="pdf">Documento (PDF)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data de Entrega</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" /> Fazer Upload
            </button>
          </div>
        </form>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AprovacaoConteudo = () => {
  const { contentItems: contents, setContentItems: setContents, addContentItem } = useAppContext();
  const [filter, setFilter] = useState<'TODOS' | ContentStatus>('TODOS');
  const [feedbackTarget, setFeedbackTarget] = useState<number | string | null>(null);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const handleApprove = (id: number | string) => {
    setContents(prev => prev.map(c => c.id === id ? { ...c, status: 'APROVADO' as ContentStatus, feedback: null } : c));
  };

  const handleRequestChange = (id: number | string) => {
    setFeedbackTarget(id);
  };

  const handleFeedbackConfirm = (text: string) => {
    if (feedbackTarget === null) return;
    setContents(prev => prev.map(c => c.id === feedbackTarget ? { ...c, status: 'REVISÃO' as ContentStatus, feedback: text } : c));
    setFeedbackTarget(null);
  };

  const handleAddContent = (item: Omit<ContentItem, 'id'>) => {
    addContentItem(item);
    setShowNovoModal(false);
  };

  const handleDelete = useCallback((id: number | string) => {
    const deleted = contents.find((c) => c.id === id);
    if (!deleted) return;
    setContents((prev) => prev.filter((c) => c.id !== id));
    showToast(`"${deleted.title}" removido.`, () => {
      setContents((prev) => {
        const exists = prev.find((c) => c.id === id);
        if (exists) return prev;
        return [deleted, ...prev];
      });
    });
  }, [contents, setContents, showToast]);


  const filteredContents = contents.filter(c => filter === 'TODOS' || c.status === filter);

  const counts = {
    TODOS: contents.length,
    PENDENTE: contents.filter(c => c.status === 'PENDENTE').length,
    'REVISÃO': contents.filter(c => c.status === 'REVISÃO').length,
    APROVADO: contents.filter(c => c.status === 'APROVADO').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 h-full overflow-auto bg-[#0a0a0a] text-white"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Aprovação de Conteúdo</h1>
            <p className="text-gray-400 text-sm">Revise e aprove as mídias produzidas pela equipe.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#141414] p-1 rounded-lg border border-[#222]">
              {(['TODOS', 'PENDENTE', 'REVISÃO', 'APROVADO'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded transition-all ${filter === f ? 'bg-[#2a2a2a] shadow-sm text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {f} <span className="ml-1 text-[10px] font-mono opacity-60">({counts[f]})</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNovoModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <Upload className="w-4 h-4" /> Adicionar Mídia
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredContents.map((content) => (
              <motion.div
                key={content.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden flex flex-col group hover:border-[#333] transition-colors relative"
              >
                {/* Header Thumb */}
                <div className={`relative h-[220px] ${content.color} flex items-center justify-center overflow-hidden border-b border-[#222]`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors border border-white/20 shadow-xl">
                      <Play className="w-5 h-5 fill-white" /> Visualizar Arquivo
                    </button>
                  </div>

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex gap-2 z-20">
                    <div className="bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 text-white border border-white/10">
                      {content.type === 'video' && <Play className="w-3 h-3" />}
                      {content.type === 'image' && <ImageIcon className="w-3 h-3" />}
                      {content.type === 'pdf' && <FileText className="w-3 h-3" />}
                      {content.type}
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <div className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 border ${
                      content.status === 'PENDENTE' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      content.status === 'REVISÃO'  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-green-500/20 text-green-500 border-green-500/30'
                    }`}>
                      {content.status}
                    </div>
                  </div>

                  {/* Thumbnail Previews */}
                  {content.thumbnail === 'N' && <span className={`text-7xl font-bold ${content.textColor} drop-shadow-2xl`}>N</span>}
                  {content.thumbnail === 'img' && (
                    <div className={`w-20 h-20 border-[6px] border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm ${content.textColor}`}>
                      <ImageIcon className="w-8 h-8 opacity-80" />
                    </div>
                  )}
                  {content.thumbnail === 'pdf' && (
                    <div className="w-24 h-32 bg-white/90 shadow-2xl rounded-md flex flex-col p-3 border border-gray-300 transform -rotate-2">
                       <div className="w-1/2 h-2.5 bg-red-500 rounded-sm mb-4"></div>
                       <div className="space-y-2">
                         <div className="w-full h-1.5 bg-gray-300 rounded"></div>
                         <div className="w-full h-1.5 bg-gray-300 rounded"></div>
                         <div className="w-3/4 h-1.5 bg-gray-300 rounded"></div>
                       </div>
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col relative">
                  {/* Delete Button (visible on hover) */}
                  <button
                    onClick={() => handleDelete(content.id)}
                    className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400"
                    title="Excluir Mídia"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>

                  <h3 className="font-semibold text-[15px] mb-2 text-white pr-6 leading-snug">{content.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-5 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Entregue em {toDisplayDate(content.date)}
                  </p>

                  {content.feedback && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3.5 mb-5">
                      <p className="text-[11px] font-bold text-yellow-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        <MessageSquare className="w-3.5 h-3.5" /> Feedback Solicitado
                      </p>
                      <p className="text-sm text-gray-300 italic leading-relaxed">"{content.feedback}"</p>
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    {content.status === 'APROVADO' ? (
                      <button disabled className="w-full py-2.5 rounded-lg text-sm font-medium bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Aprovado pelo Cliente
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleApprove(content.id)}
                          className="py-2.5 rounded-lg text-sm font-medium text-green-500 border border-green-500/20 hover:bg-green-500/10 flex items-center justify-center gap-2 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Aprovar
                        </button>
                        <button
                          onClick={() => handleRequestChange(content.id)}
                          className="py-2.5 rounded-lg text-sm font-medium text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/10 flex items-center justify-center gap-2 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" /> Alteração
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredContents.length === 0 && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="col-span-full py-24 text-center text-gray-500 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#222] flex items-center justify-center mb-4">
                 <ImageIcon className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-400 mb-1">Nenhum conteúdo encontrado</h3>
              <p className="text-sm">Não há itens para o filtro selecionado.</p>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {feedbackTarget !== null && (
          <FeedbackModal
            onConfirm={handleFeedbackConfirm}
            onClose={() => setFeedbackTarget(null)}
            existing={contents.find(c => c.id === feedbackTarget)?.feedback}
          />
        )}
        {showNovoModal && (
          <NovoConteudoModal onAdd={handleAddContent} onClose={() => setShowNovoModal(false)} />
        )}
      </AnimatePresence>
      <ToastContainer />
    </motion.div>
  );
};

export default AprovacaoConteudo;
