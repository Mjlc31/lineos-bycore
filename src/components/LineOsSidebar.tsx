import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  DollarSign,
  GraduationCap,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import useLocalStorage from '../hooks/useLocalStorage';

export type LineOsTab =
  | 'dashboard'
  | 'gestor'
  | 'aprovacao'
  | 'crm'
  | 'financeiro'
  | 'academy'
  | 'agendamento';

interface Props {
  activeTab: LineOsTab;
  setActiveTab: (tab: LineOsTab) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'gestor', label: 'Gestor de Tarefas', icon: Layers },
  { id: 'aprovacao', label: 'Aprovação', icon: CheckSquare },
  { id: 'crm', label: 'CRM & Vendas', icon: Users },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'academy', label: 'Academy', icon: GraduationCap },
  { id: 'agendamento', label: 'Agendamento', icon: Calendar },
] as const;

const LineOsSidebar = ({ activeTab, setActiveTab }: Props) => {
  const [isExpanded, setIsExpanded] = useLocalStorage('lineos-sidebar-expanded', false);

  return (
    <motion.div
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-[#222] flex flex-col h-full flex-shrink-0 py-5 z-50 overflow-hidden glass-panel"
    >
      {/* Logo + Toggle */}
      <div className="flex items-center mb-8 px-4 gap-3 flex-shrink-0">
        <div className="relative group cursor-pointer flex-shrink-0" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="absolute inset-0 bg-red-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative w-10 h-10 bg-gradient-to-tr from-red-600 to-[#ff4d4d] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl border border-white/10">
            L
          </div>
        </div>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="flex-1 min-w-0"
          >
            <div className="font-bold text-sm text-white leading-tight truncate">LINE OS</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Plataforma</div>
          </motion.div>
        )}
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsExpanded(false)}
            className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </motion.button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as LineOsTab)}
              title={!isExpanded ? item.label : undefined}
              className={`relative flex items-center gap-3 h-10 rounded-xl transition-all duration-200 group
                ${isExpanded ? 'px-3' : 'justify-center px-0'}
                ${isActive
                  ? 'bg-white/10 text-white shadow-inner border border-white/10'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
                }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              )}
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`}
              />
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium truncate leading-none"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expand toggle (collapsed state) */}
      {!isExpanded && (
        <div className="px-2 mb-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-center h-8 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
            title="Expandir menu"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom */}
      <div className={`flex flex-col gap-1 px-2 ${isExpanded ? '' : ''}`}>
        <button
          title="Configurações"
          className={`flex items-center gap-3 h-10 rounded-xl text-gray-500 hover:bg-white/5 hover:text-gray-200 transition-all duration-200 group
            ${isExpanded ? 'px-3' : 'justify-center'}`}
        >
          <Settings className="w-[18px] h-[18px] group-hover:rotate-90 transition-transform duration-500 flex-shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Configurações</span>}
        </button>
        <button
          title="Sair"
          className={`flex items-center gap-3 h-10 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group
            ${isExpanded ? 'px-3' : 'justify-center'}`}
        >
          <LogOut className="w-[18px] h-[18px] group-hover:-translate-x-0.5 transition-transform duration-300 flex-shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default LineOsSidebar;
