import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Video, Send, FileText, Upload } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';

interface PosGravacaoModalProps {
  onClose: () => void;
  onSend: (data: any) => void;
}

export const PosGravacaoModal = ({ onClose, onSend }: PosGravacaoModalProps) => {
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    client: '',
    equipment: '',
    notes: '',
    whatsappNumber: ''
  });

  useEscapeKey(onClose, true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    
    // Deeplink para o WhatsApp do grupo ou cliente
    const message = `*Registro de Gravação*\n\n*Projeto:* ${form.title}\n*Data:* ${form.date}\n*Cliente:* ${form.client}\n*Equipamentos:* ${form.equipment}\n*Observações:* ${form.notes}`;
    const cleanNumber = form.whatsappNumber.replace(/\D/g, '');
    
    if (cleanNumber) {
       window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    onSend(form);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl bg-[#141414] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#2b2b2b]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-blue-500" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight">Formulário Pós-Gravação</h2>
               <p className="text-sm text-gray-500 mt-0.5">Registre a diária de captação e notifique a equipe.</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-[#1e1e1e] hover:bg-[#2b2b2b] rounded-lg transition-colors border border-[#333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-500 transition-colors">Projeto / Título</label>
                <input
                  type="text" required autoFocus
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Nome do Job"
                />
              </div>
              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-500 transition-colors">Data da Captação</label>
                <input
                  type="date" required
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-500 transition-colors">Cliente</label>
              <input
                type="text"
                value={form.client}
                onChange={e => setForm({ ...form, client: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Nome do Cliente"
              />
            </div>
            
            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-500 transition-colors">Equipamentos Utilizados</label>
              <input
                type="text"
                value={form.equipment}
                onChange={e => setForm({ ...form, equipment: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ex: Sony A7III, Lente 24-70, Microfone Lapela..."
              />
            </div>

            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-500 transition-colors">Observações e Intercorrências</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
                placeholder="Algum problema com arquivo? Bateria? Comentários relevantes..."
              />
            </div>
            
            <div className="group p-4 bg-[#0a0a0a] border border-[#2b2b2b] rounded-xl">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-500 transition-colors">Disparar Relatório (WhatsApp)</label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={e => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Número ou Grupo (ex: 5511999999999)"
              />
              <p className="text-[10px] text-gray-500 mt-2">Um link de envio automático via WhatsApp será aberto com o resumo.</p>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-[#2b2b2b] bg-[#141414] flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white bg-[#1e1e1e] border border-[#333] hover:bg-[#2b2b2b] rounded-xl transition-all">
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit} className="flex-[2] py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 rounded-xl transition-all flex justify-center items-center gap-2">
            Registrar e Notificar
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
