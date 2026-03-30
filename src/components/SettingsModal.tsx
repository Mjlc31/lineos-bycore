import React from 'react';
import { X, Box, Eye, Edit3, Disc, CheckCircle2, Sparkles, LayoutList } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl w-[600px] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 pb-2">
          <div>
            <h2 className="text-xl font-semibold text-white">Configurações da lista</h2>
            <p className="text-sm text-gray-400 mt-1">Escolha entre nossas configurações sugeridas ou comece com uma lista em branco.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#2b2b2b] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 pt-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-400 mb-2">
            Configurações de IA sugeridas para <span className="text-white flex items-center gap-1"><LayoutList className="w-4 h-4" /> Clientes</span>
          </div>

          {/* Option 1 */}
          <div className="flex items-start gap-4 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
            <div className="mt-0.5"><Box className="w-5 h-5 text-purple-400" /></div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">Tipo de tarefa padrão</h3>
              <p className="text-sm text-gray-400">Client</p>
            </div>
            <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div>
          </div>

          {/* Option 2 */}
          <div className="flex items-start gap-4 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
            <div className="mt-0.5"><Eye className="w-5 h-5 text-purple-400" /></div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">Visualizações padrão</h3>
              <p className="text-sm text-gray-400">List (Client List), Board (Client Pipeline), Table (Client Database)</p>
            </div>
            <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div>
          </div>

          {/* Option 3 */}
          <div className="flex items-start gap-4 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
            <div className="mt-0.5"><Edit3 className="w-5 h-5 text-purple-400" /></div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">Campos personalizados</h3>
              <p className="text-sm text-gray-400">Faturamento Anual Contratado, Última Reunião De Sucesso, Índice De Saúde Do Cliente, Repositório De Documentação, Segmento De Atuação</p>
            </div>
            <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div>
          </div>

          {/* Option 4 */}
          <div className="flex items-start gap-4 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
            <div className="mt-0.5"><Disc className="w-5 h-5 text-purple-400" /></div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">Status</h3>
              <p className="text-sm text-gray-400 flex items-center gap-1 flex-wrap">
                <span className="text-red-500">New Client</span> → <span className="text-blue-500">Contacted</span> → <span className="text-yellow-500">Negotiating</span> → <span className="text-green-500">Onboarding</span> → <span className="text-purple-500">Active Client</span> → <span className="text-gray-500">Churned/Lost</span>
              </p>
            </div>
            <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
        </div>

        <div className="p-6 pt-2 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Não, obrigado
          </button>
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
