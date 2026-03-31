import React, { useState } from 'react';
import { Search, Bell, Plus, HelpCircle, LayoutDashboard, CheckSquare, Users, DollarSign, GraduationCap, Calendar, ChevronRight, FileText, Settings, LogOut, Layers } from 'lucide-react';
import { LineOsTab } from './LineOsSidebar';
import { motion, AnimatePresence } from 'motion/react';

const moduleLabels: Record<LineOsTab, { label: string; icon: React.ElementType }> = {
  dashboard:   { label: 'Dashboard Resumo',       icon: LayoutDashboard },
  gestor:      { label: 'Gestor de Tarefas',     icon: Layers },
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
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const closeAll = () => {
    setShowQuickCreate(false);
    setShowNotifications(false);
    setShowUserMenu(false);
  };

  return (
    <>
      {/* Overlay invisível para fechar os menus ao clicar fora */}
      {(showQuickCreate || showNotifications || showUserMenu) && (
        <div className="fixed inset-0 z-[45]" onClick={closeAll} />
      )}

      <div className="h-14 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0 z-[50] gap-4 relative">
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
        <div className="flex items-center gap-1 flex-shrink-0 relative">
          
          {/* Quick Create (+) */}
          <div className="relative">
            <button 
              onClick={() => { closeAll(); setShowQuickCreate(!showQuickCreate); }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/8 hover:text-gray-200 transition-all duration-200 ${showQuickCreate ? 'bg-white/10 text-white' : ''}`}
            >
              <Plus className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showQuickCreate && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[#141414] border border-[#333] rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Criação Rápida</div>
                  <button onClick={() => { closeAll(); alert('Abriria o modal de Tarefa')}} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2b2b2b] hover:text-white flex items-center gap-2 transition-colors"><CheckSquare className="w-4 h-4" /> Nova Tarefa</button>
                  <button onClick={() => { closeAll(); alert('Abriria o modal de Lead')}} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2b2b2b] hover:text-white flex items-center gap-2 transition-colors"><Users className="w-4 h-4" /> Novo Lead</button>
                  <button onClick={() => { closeAll(); alert('Abriria o modal de Mídia')}} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2b2b2b] hover:text-white flex items-center gap-2 transition-colors"><FileText className="w-4 h-4" /> Upload de Mídia</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { closeAll(); setShowNotifications(!showNotifications); }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/8 hover:text-gray-200 transition-all duration-200 relative ${showNotifications ? 'bg-white/10 text-white' : ''}`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0a0a0a] shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[#141414] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Notificações</h3>
                    <span className="text-xs text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">1 nova</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <div className="p-4 hover:bg-[#1a1a1a] transition-colors cursor-pointer border-b border-[#222] flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/20">
                        <Calendar className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium mb-0.5">Reunião em 10 minutos</p>
                        <p className="text-xs text-gray-400">Call de Kickoff com Cliente Novo.</p>
                        <p className="text-[10px] text-gray-500 mt-1">Agora mesmo</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-[#222]">
                    <button className="w-full py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors" onClick={closeAll}>Marcar todas como lidas</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/8 hover:text-gray-200 transition-all duration-200">
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/8 mx-1" />

          {/* User Profile */}
          <div className="relative">
            <div 
              onClick={() => { closeAll(); setShowUserMenu(!showUserMenu); }}
              className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg transition-all duration-200 border border-transparent ${showUserMenu ? 'bg-white/10' : 'hover:bg-white/5 hover:border-white/5'}`}
            >
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
            <AnimatePresence>
              {showUserMenu && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-56 bg-[#141414] border border-[#333] rounded-xl shadow-2xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-[#222]">
                    <p className="text-sm font-semibold text-white">Arthur de Moraes</p>
                    <p className="text-xs text-gray-400">admin@lineos.com</p>
                  </div>
                  <div className="py-1">
                    <button onClick={closeAll} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2b2b2b] hover:text-white flex items-center gap-2 transition-colors"><Settings className="w-4 h-4" /> Configurações</button>
                  </div>
                  <div className="border-t border-[#222] py-1">
                    <button onClick={closeAll} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"><LogOut className="w-4 h-4" /> Sair do LINE OS</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default LineOsTopBar;
