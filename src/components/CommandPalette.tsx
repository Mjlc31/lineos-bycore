import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutDashboard, CheckSquare, Users, DollarSign, GraduationCap, Calendar, ArrowRight, Command, Layers } from 'lucide-react';
import { LineOsTab } from './LineOsSidebar';
import { useAppContext } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: LineOsTab) => void;
  activeTab: LineOsTab;
}

const modules = [
  { id: 'dashboard' as LineOsTab, label: 'Dashboard Geral', description: 'Visão 360 e indicadores em tempo real', icon: LayoutDashboard, category: 'Módulos' },
  { id: 'gestor' as LineOsTab, label: 'Gestor de Tarefas', description: 'Gerencie tarefas e conteúdos por status', icon: Layers, category: 'Módulos' },
  { id: 'aprovacao' as LineOsTab, label: 'Aprovação de Conteúdo', description: 'Revise e aprove mídias da equipe', icon: CheckSquare, category: 'Módulos' },
  { id: 'crm' as LineOsTab, label: 'CRM & Vendas', description: 'Pipeline de vendas e leads', icon: Users, category: 'Módulos' },
  { id: 'financeiro' as LineOsTab, label: 'Financeiro & DRE', description: 'Fluxo de caixa e saúde financeira', icon: DollarSign, category: 'Módulos' },
  { id: 'academy' as LineOsTab, label: 'LINE Academy', description: 'Base de conhecimento e treinamentos', icon: GraduationCap, category: 'Módulos' },
  { id: 'agendamento' as LineOsTab, label: 'Agendamento', description: 'Reuniões com clientes e equipe', icon: Calendar, category: 'Módulos' },
];

const CommandPalette = ({ isOpen, onClose, onNavigate, activeTab }: Props) => {
  const { leads, transactions, meetings, tasks } = useAppContext();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Garantir estritamente que são arrays válidos
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeMeetings = Array.isArray(meetings) ? meetings : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Mapear dados para o formato de busca com tratamento de erro
  let searchItems: any[] = [...modules];
  try {
    searchItems = [
      ...modules,
      ...safeTasks.map(t => ({ id: 'gestor' as LineOsTab, label: t?.name || 'Tarefa', description: `Em: ${t?.statusId || 'Backlog'}`, icon: CheckSquare, category: 'Tarefas' })),
      ...safeLeads.map(l => ({ id: 'crm' as LineOsTab, label: l?.title || 'Lead', description: `Lead em ${l?.columnId} • R$ ${(Number(l?.value) || 0).toLocaleString()}`, icon: Users, category: 'Leads (CRM)' })),
      ...safeTransactions.map(t => ({ id: 'financeiro' as LineOsTab, label: t?.title || 'Transação', description: `${t?.category || ''} • R$ ${Math.abs(Number(t?.amount) || 0).toLocaleString()}`, icon: DollarSign, category: 'Financeiro' })),
      ...safeMeetings.map(m => ({ id: 'agendamento' as LineOsTab, label: m?.title || 'Reunião', description: `${m?.date || ''} • ${m?.time || ''} • ${m?.client || ''}`, icon: Calendar, category: 'Agendamento' })),
    ];
  } catch (error) {
    console.error("Erro ao mapear items no CommandPalette:", error);
  }

  const filtered = searchItems.filter(
    (item) =>
      (item?.label || '').toLowerCase().includes(query.toLowerCase()) ||
      (item?.description || '').toLowerCase().includes(query.toLowerCase()) ||
      (item?.category || '').toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10); // Limitar a 10 resultados

  // Group by category, ignorando nulos
  const categories = Array.from(new Set(filtered.map(i => i?.category).filter(Boolean)));

  // Focus input when open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onNavigate(filtered[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filtered, selectedIndex, onNavigate, onClose]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-xl px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-[640px] bg-[#121212]/95 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 px-5 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-transparent">
              <Search className="w-6 h-6 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pesquisar tarefas, leads, reuniões ou módulos..."
                className="flex-1 bg-transparent text-xl font-medium text-white placeholder-gray-500 outline-none"
              />
              <kbd className="hidden sm:inline-block text-[10px] text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md font-mono tracking-widest shadow-sm">ESC</kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <Search className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Nenhum resultado para "{query}"</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category}>
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-600 bg-white/[0.01]">
                      {category}
                    </div>
                    {filtered
                      .filter(i => i.category === category)
                      .map((item) => {
                        const Icon = item.icon;
                        const globalIdx = filtered.indexOf(item);
                        const isSelected = globalIdx === selectedIndex;
                        return (
                          <button
                            key={`${item.category}-${item.label}-${globalIdx}`}
                            onClick={() => { onNavigate(item.id); onClose(); }}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={`w-full flex items-center gap-3.5 px-4 py-3 text-left transition-all relative outline-none ${isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                              }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="active-indicator"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${isSelected ? 'scale-105' : 'scale-100'} ${item.category === 'Módulos' ? 'bg-gradient-to-tr from-primary to-orange-500 shadow-lg shadow-primary/20' : 'bg-[#222] border border-[#333]'
                              }`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[15px] font-semibold text-gray-100 flex items-center gap-2">
                                {item.label}
                                {item.id === activeTab && item.category === 'Módulos' && (
                                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold tracking-wide">ATIVO</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate mt-0.5 font-medium">{item.description}</div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-2 text-gray-400">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Abrir</span>
                                <ArrowRight className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-6 text-[10px] font-medium text-gray-500">
              <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 font-sans">↑↓</kbd> Navegar</span>
              <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 font-sans">↵</kbd> Selecionar</span>
              <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 font-sans">ESC</kbd> Fechar</span>
              <div className="ml-auto flex items-center gap-1.5 opacity-40">
                <Command className="w-3.5 h-3.5" />
                <span className="tracking-widest">LINE OS CORE</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
