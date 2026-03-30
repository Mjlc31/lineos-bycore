import React from 'react';
import { Search, Bell, Plus, HelpCircle, LayoutDashboard, CheckSquare, Users, DollarSign, GraduationCap, Calendar, ChevronRight, Command } from 'lucide-react';
import { LineOsTab } from './LineOsSidebar';

const moduleLabels: Record<LineOsTab, { label: string; icon: React.ElementType }> = {
  gestor:      { label: 'Gestor de Tarefas',     icon: LayoutDashboard },
  aprovacao:   { label: 'Aprovação de Conteúdo', icon: CheckSquare },
  crm:         { label: 'CRM & Vendas',          icon: Users },
  financeiro:  { label: 'Financeiro & DRE',      icon: DollarSign },
  academy:     { label: 'LINE Academy',           icon: GraduationCap },
  agendamento: { label: 'Agendamento',            icon: Calendar },
};

interface Props {
  activeTab: LineOsTab;
  onOpenPalette: () => void;
}

const LineOsTopBar = ({ activeTab, onOpenPalette }: Props) => {
  const { label, icon: ActiveIcon } = moduleLabels[activeTab];

  return (
    <div className="h-14 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0 z-40 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-gray-600 font-medium flex-shrink-0">LINE OS</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
        <div className="flex items-center gap-1.5 text-gray-200 font-semibold min-w-0">
          <ActiveIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{label}</span>
        </div>
      </div>

      {/* Search trigger */}
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 text-sm text-gray-500 border border-white/5 hover:border-white/10 hover:bg-white/8 hover:text-gray-300 transition-all duration-200 w-56 flex-shrink-0"
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left text-xs">Pesquisar no LINE OS</span>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <kbd className="text-[9px] font-bold bg-black/40 px-1 py-0.5 rounded border border-white/10">Ctrl</kbd>
          <kbd className="text-[9px] font-bold bg-black/40 px-1 py-0.5 rounded border border-white/10">K</kbd>
        </div>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/8 hover:text-gray-200 transition-all duration-200">
          <Plus className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/8 hover:text-gray-200 transition-all duration-200 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0a0a0a] shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/8 hover:text-gray-200 transition-all duration-200">
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-white/8 mx-1" />

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-all duration-200 border border-transparent hover:border-white/5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-500 to-orange-500 rounded-lg blur opacity-50" />
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-lg border border-white/20">
              A
            </div>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-gray-200 leading-tight">Arthur</span>
            <span className="text-[9px] font-medium text-gray-600 uppercase tracking-wider">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineOsTopBar;
