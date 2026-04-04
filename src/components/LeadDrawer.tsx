import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Building2, Mail, Phone, Calendar,
  DollarSign, TagIcon, AlignLeft, Activity
} from 'lucide-react';
import { Lead } from '../types';
import useEscapeKey from '../hooks/useEscapeKey';

interface LeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUpdate: (id: string, updates: Partial<Lead>) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  isOpen, onClose, lead, onUpdate
}) => {
  useEscapeKey(onClose);

  // Local state for editing
  const [formData, setFormData] = useState<Partial<Lead>>({});

  // Sync when lead opens
  useEffect(() => {
    if (lead) {
      setFormData({
        title: lead.title || '',
        value: lead.value || 0,
        contactName: lead.contactName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || '',
        notes: lead.notes || '',
        tags: lead.tags || [],
      });
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleChange = (field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onUpdate(lead.id, { [field]: value });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      const newTags = [...(formData.tags || []), newTag];
      setFormData(prev => ({ ...prev, tags: newTags }));
      onUpdate(lead.id, { tags: newTags });
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = (formData.tags || []).filter(t => t !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: newTags }));
    onUpdate(lead.id, { tags: newTags });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 w-full max-w-md h-full bg-[#0a0a0a] border-l border-[#222] shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="bg-transparent text-lg font-bold text-white focus:outline-none focus:border-b border-blue-500 placeholder-gray-600"
                placeholder="Nome da Empresa/Lead..."
              />
              <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <DollarSign className="w-3 h-3" />
                <input
                  type="number"
                  value={formData.value || ''}
                  onChange={(e) => handleChange('value', parseFloat(e.target.value))}
                  className="bg-transparent font-medium focus:outline-none w-24"
                />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {/* Contato Section */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              Informações de Contato
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-lg p-3">
                <div className="text-gray-500"><Building2 className="w-4 h-4" /></div>
                <input
                  type="text"
                  value={formData.contactName || ''}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  placeholder="Nome do Contato (ex: João Silva)"
                  className="bg-transparent flex-1 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-lg p-3">
                <div className="text-gray-500"><Mail className="w-4 h-4" /></div>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Email"
                  className="bg-transparent flex-1 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-lg p-3">
                <div className="text-gray-500"><Phone className="w-4 h-4" /></div>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Telefone"
                  className="bg-transparent flex-1 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Tags / Meta Section */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TagIcon className="w-3.5 h-3.5" /> Tags & Segmentação
            </h3>
            <div className="bg-[#141414] border border-[#222] rounded-lg p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Origem do Lead</label>
                <select
                  value={formData.source || ''}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Inbound">Inbound (Site)</option>
                  <option value="Outbound">Outbound</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Evento">Evento</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.tags || []).map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md flex items-center gap-1"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-blue-300">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Adicione tag e aperte Enter..."
                  onKeyDown={handleAddTag}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Notes Section */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5" /> Anotações Rápidas
            </h3>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Adicione o contexto da negociação aqui..."
              className="w-full bg-[#141414] border border-[#222] rounded-lg p-4 text-sm text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
            />
          </section>

          {/* Activity Section */}
          <section className="pb-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Histórico
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#333] before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#333] bg-[#0a0a0a] text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#141414] p-4 rounded-xl border border-[#222] shadow">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-white text-sm">Lead Criado</div>
                    <time className="font-medium text-xs text-gray-500">{lead.date}</time>
                  </div>
                  <div className="text-xs text-gray-400">Pipeline de Início</div>
                </div>
              </div>

              {/* Fake History for aesthetics if empty */}
              {(lead.activities || []).map((act, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#333] bg-[#0a0a0a] text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Activity className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#141414] p-4 rounded-xl border border-[#222] shadow">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-white text-sm">{act.content}</div>
                      <time className="font-medium text-xs text-gray-500">{act.date}</time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </motion.div>
    </>
  );
};
