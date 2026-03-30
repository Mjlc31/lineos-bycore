import React, { useState } from 'react';
import { Play, Image as ImageIcon, FileText, CheckCircle2, MessageSquare, Calendar, X, Plus, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ContentStatus = 'PENDENTE' | 'REVISÃO' | 'APROVADO';
type ContentType = 'video' | 'image' | 'pdf';

interface ContentItem {
  id: number;
  title: string;
  type: ContentType;
  status: ContentStatus;
  date: string;
  feedback: string | null;
  thumbnail: string;
  color: string;
  textColor: string;
}

const initialContent: ContentItem[] = [
  {
    id: 1,
    title: 'Campanha Black Friday - Vídeo Principal',
    type: 'video',
    status: 'PENDENTE',
    date: '10/11/2023',
    feedback: null,
    thumbnail: 'N',
    color: 'from-red-900 to-black',
    textColor: 'text-red-600'
  },
  {
    id: 2,
    title: 'Carrossel Instagram - Lançamento Produto X',
    type: 'image',
    status: 'REVISÃO',
    date: '09/11/2023',
    feedback: 'Aumentar o logo na segunda imagem e trocar a cor de fundo para um tom mais escuro.',
    thumbnail: 'img',
    color: 'from-pink-600 to-orange-500',
    textColor: 'text-white'
  },
  {
    id: 3,
    title: 'Apresentação Comercial Q4',
    type: 'pdf',
    status: 'APROVADO',
    date: '05/11/2023',
    feedback: null,
    thumbnail: 'pdf',
    color: 'bg-gray-200',
    textColor: 'text-gray-800'
  }
];

// ─── Feedback Modal ───────────────────────────────────────────────────────────
interface FeedbackModalProps {
  onConfirm: (text: string) => void;
  onClose: () => void;
  existing?: string | null;
}

const FeedbackModal = ({ onConfirm, onClose, existing }: FeedbackModalProps) => {
  const [text, setText] = useState(existing ?? '');
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#141414] border border-[#333] rounded-xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-yellow-500" /> Solicitar Alteração
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
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
        <div className="p-4 pt-0 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { if (text.trim()) { onConfirm(text.trim()); } }}
            disabled={!text.trim()}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Enviar Feedback
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Novo Conteúdo Modal ──────────────────────────────────────────────────────
const NovoConteudoModal = ({ onAdd, onClose }: { onAdd: (item: ContentItem) => void; onClose: () => void }) => {
  const [form, setForm] = useState({ title: '', type: 'video' as ContentType, date: '' });

  const colorMap: Record<ContentType, { color: string; textColor: string; thumbnail: string }> = {
    video: { color: 'from-red-900 to-black', textColor: 'text-red-600', thumbnail: 'N' },
    image: { color: 'from-pink-600 to-orange-500', textColor: 'text-white', thumbnail: 'img' },
    pdf:   { color: 'bg-gray-200', textColor: 'text-gray-800', thumbnail: 'pdf' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const meta = colorMap[form.type];
    onAdd({
      id: Date.now(),
      title: form.title,
      type: form.type,
      status: 'PENDENTE',
      date: form.date || new Date().toLocaleDateString('pt-BR'),
      feedback: null,
      ...meta,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#141414] border border-[#333] rounded-xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-400" /> Novo Conteúdo
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Título</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Ex: Campanha de Natal - Vídeo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as ContentType })}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="video">Vídeo</option>
                <option value="image">Imagem</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data</label>
              <input
                type="text"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

import { useAppContext } from '../context/AppContext';

// ─── Main Component ───────────────────────────────────────────────────────────
const AprovacaoConteudo = () => {
  const { contentItems: contents, setContentItems: setContents } = useAppContext();
  const [filter, setFilter] = useState<'TODOS' | ContentStatus>('TODOS');
  const [feedbackTarget, setFeedbackTarget] = useState<number | null>(null);
  const [showNovoModal, setShowNovoModal] = useState(false);

  const handleApprove = (id: number) => {
    setContents(prev => prev.map(c => c.id === id ? { ...c, status: 'APROVADO' as ContentStatus, feedback: null } : c));
  };

  const handleRequestChange = (id: number) => {
    setFeedbackTarget(id);
  };

  const handleFeedbackConfirm = (text: string) => {
    if (feedbackTarget === null) return;
    setContents(prev => prev.map(c => c.id === feedbackTarget ? { ...c, status: 'REVISÃO' as ContentStatus, feedback: text } : c));
    setFeedbackTarget(null);
  };

  const handleAddContent = (item: ContentItem) => {
    setContents(prev => [item, ...prev]);
    setShowNovoModal(false);
  };

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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Aprovação de Conteúdo</h1>
            <p className="text-gray-400 text-sm">Revise e aprove as mídias produzidas pela equipe LINE.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#141414] p-1 rounded-lg border border-[#222]">
              {(['TODOS', 'PENDENTE', 'REVISÃO', 'APROVADO'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded transition-all ${filter === f ? 'bg-[#2a2a2a] shadow-sm text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {f} <span className="ml-1 text-xs opacity-60">({counts[f]})</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNovoModal(true)}
              className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Novo Conteúdo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredContents.map((content) => (
              <motion.div
                key={content.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden flex flex-col group hover:border-[#333] transition-colors"
              >
                <div className={`relative h-48 ${content.type !== 'pdf' ? 'bg-gradient-to-br' : ''} ${content.color} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-white/30 transition-colors">
                      <Play className="w-4 h-4 fill-white" /> Visualizar
                    </button>
                  </div>

                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center gap-1.5 z-20 text-white">
                    {content.type === 'video' && <Play className="w-3 h-3" />}
                    {content.type === 'image' && <ImageIcon className="w-3 h-3" />}
                    {content.type === 'pdf' && <FileText className="w-3 h-3" />}
                    {content.type.toUpperCase()}
                  </div>

                  <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium z-20 ${
                    content.status === 'PENDENTE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    content.status === 'REVISÃO'  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-green-500/20 text-green-500 border border-green-500/30'
                  }`}>
                    {content.status}
                  </div>

                  {content.thumbnail === 'N' && <span className={`text-6xl font-bold ${content.textColor} drop-shadow-lg`}>N</span>}
                  {content.thumbnail === 'img' && (
                    <div className="w-16 h-16 border-4 border-white rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 border-4 border-white rounded-full"></div>
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                  {content.thumbnail === 'pdf' && (
                    <div className="w-24 h-32 bg-white shadow-lg rounded flex flex-col p-3">
                      <div className="w-1/2 h-2 bg-gray-300 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="w-full h-1 bg-gray-200 rounded"></div>
                        <div className="w-full h-1 bg-gray-200 rounded"></div>
                        <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold mb-2 text-white">{content.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                    <Calendar className="w-3 h-3" /> {content.date}
                  </p>

                  {content.feedback && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium text-yellow-400 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Feedback Solicitado:
                      </p>
                      <p className="text-xs text-gray-400 italic">"{content.feedback}"</p>
                    </div>
                  )}

                  <div className="mt-auto">
                    {content.status === 'APROVADO' ? (
                      <button className="w-full py-2 rounded-lg text-sm font-medium bg-green-500/10 text-green-500 border border-green-500/30 flex items-center justify-center gap-1.5 cursor-default">
                        <CheckCircle2 className="w-4 h-4" /> Aprovado pelo Cliente
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleApprove(content.id)}
                          className="py-2 rounded-lg text-sm font-medium text-green-500 border border-green-500/30 hover:bg-green-500/10 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Aprovar
                        </button>
                        <button
                          onClick={() => handleRequestChange(content.id)}
                          className="py-2 rounded-lg text-sm font-medium text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10 flex items-center justify-center gap-1.5 transition-colors"
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
            <div className="col-span-3 py-20 text-center text-gray-500 flex flex-col items-center">
              <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
              <p>Nenhum conteúdo encontrado para este filtro.</p>
            </div>
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
    </motion.div>
  );
};

export default AprovacaoConteudo;
