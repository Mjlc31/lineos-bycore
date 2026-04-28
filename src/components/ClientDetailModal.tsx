import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X, Building2, Folder, Calendar, DollarSign, Users, Briefcase
} from 'lucide-react';
import { Client } from '../types';
import useEscapeKey from '../hooks/useEscapeKey';

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

  const [formData, setFormData] = useState<Partial<Client>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        faturamento: client.faturamento || '',
        segmento: client.segmento || '',
        repositorio: client.repositorio || '',
        ultimaReuniao: client.ultimaReuniao || '',
      });
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleChange = (field: keyof Client, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onUpdate(client.id, { [field]: value });
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
        className="w-full max-w-2xl bg-[#141414] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2b2b2b]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Building2 className="w-6 h-6 text-purple-500 shadow-inner" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <input
                   type="text"
                   value={formData.name || ''}
                   onChange={(e) => handleChange('name', e.target.value)}
                   className="bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b border-purple-500 placeholder-gray-600 w-80"
                   placeholder="Nome do Cliente..."
                 />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-[#1e1e1e] hover:bg-[#2b2b2b] rounded-lg transition-colors border border-[#333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-[#0a0a0a] flex-1">
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Informações Comerciais
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Faturamento Anual</label>
                <div className="flex items-center gap-3 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 focus-within:border-primary/50 transition-colors">
                  <div className="text-gray-500"><DollarSign className="w-4 h-4" /></div>
                  <input
                    type="text"
                    value={formData.faturamento || ''}
                    onChange={(e) => handleChange('faturamento', e.target.value)}
                    placeholder="Ex: R$ 50.000"
                    className="bg-transparent flex-1 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Segmento de Atuação</label>
                <div className="flex items-center gap-3 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 focus-within:border-primary/50 transition-colors">
                  <div className="text-gray-500"><Briefcase className="w-4 h-4" /></div>
                  <input
                    type="text"
                    value={formData.segmento || ''}
                    onChange={(e) => handleChange('segmento', e.target.value)}
                    placeholder="Ex: Tecnologia"
                    className="bg-transparent flex-1 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Repositório de Documentos</label>
                <div className="flex items-center gap-3 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 focus-within:border-primary/50 transition-colors">
                  <div className="text-gray-500"><Folder className="w-4 h-4" /></div>
                  <input
                    type="text"
                    value={formData.repositorio || ''}
                    onChange={(e) => handleChange('repositorio', e.target.value)}
                    placeholder="Ex: Google Drive"
                    className="bg-transparent flex-1 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Última Reunião de Sucesso</label>
                <div className="flex items-center gap-3 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 focus-within:border-primary/50 transition-colors">
                  <div className="text-gray-500"><Calendar className="w-4 h-4" /></div>
                  <input
                    type="text"
                    value={formData.ultimaReuniao || ''}
                    onChange={(e) => handleChange('ultimaReuniao', e.target.value)}
                    placeholder="Ex: 10/11/2026"
                    className="bg-transparent flex-1 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};
