import React from 'react';
import { Home, Inbox, MessageSquare, CheckSquare, Clock, MoreHorizontal, Plus, Search, ChevronDown, Folder as FolderIcon, LayoutGrid, Users, List } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  return (
    <div className="w-[260px] bg-[#0d0d0d] border-r border-[#222] flex flex-col h-full overflow-y-auto flex-shrink-0 custom-scrollbar">
      {/* Workspace Header */}
      <div className="p-4 flex items-center justify-between hover:bg-[#2b2b2b] cursor-pointer transition-colors">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            A
          </div>
          <span className="font-medium text-sm truncate text-gray-200">Arthur de Moraes's Workspace</span>
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 text-sm text-gray-400 cursor-pointer hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
          <Search className="w-4 h-4" />
          <span>Pesquisar</span>
          <span className="ml-auto text-[10px] font-medium bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333333]">Ctrl K</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="px-2 py-2 space-y-0.5">
        <NavItem icon={<Home className="w-4 h-4" />} label="Início" />
        <NavItem icon={<Inbox className="w-4 h-4" />} label="Caixa de entrada" />
        <NavItem icon={<Clock className="w-4 h-4" />} label="Minhas tarefas" />
      </div>

      {/* Spaces */}
      <div className="mt-4 px-2 flex-1 pb-4">
        <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 group cursor-pointer hover:text-gray-300 transition-colors">
          <span>Espaços</span>
          <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="mt-1 space-y-0.5">
          {/* Active Space 1 */}
          <div className="mt-2">
            <div 
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${currentView === 'overview' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
              onClick={() => onViewChange('overview')}
            >
              <ChevronDown className="w-3 h-3 text-gray-500" />
              <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">S</div>
              <span className="text-sm font-medium text-gray-200">Space</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <MoreHorizontal className="w-3 h-3 text-gray-400 hover:text-white" />
                <Plus className="w-3 h-3 text-gray-400 hover:text-white" />
              </div>
            </div>
            {/* Space Children */}
            <div className="ml-6 pl-2 border-l border-[#333333] mt-1 space-y-0.5">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#2b2b2b] cursor-pointer text-gray-400 hover:text-gray-200 transition-colors">
                <FolderIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">Clientes Line</span>
              </div>
              <div 
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${currentView === 'tasks' ? 'bg-[#2b2b2b] text-gray-200' : 'text-gray-400 hover:bg-[#2b2b2b] hover:text-gray-200'}`}
                onClick={() => onViewChange('tasks')}
              >
                <List className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">Pão de Queijo Ki...</span>
              </div>
            </div>
          </div>

          {/* Active Space 2 */}
          <div className="mt-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#2b2b2b] cursor-pointer group transition-colors">
              <ChevronDown className="w-3 h-3 text-gray-500" />
              <div className="w-5 h-5 rounded bg-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">E</div>
              <span className="text-sm font-medium text-gray-200">Espaço da equipe</span>
            </div>
            {/* Space Children */}
            <div className="ml-6 pl-2 border-l border-[#333333] mt-1 space-y-0.5">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#2b2b2b] cursor-pointer text-gray-400 hover:text-gray-200 transition-colors">
                <FolderIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">Projetos</span>
              </div>
              <div 
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${currentView === 'clients' ? 'bg-[#2b2b2b] text-gray-200' : 'text-gray-400 hover:bg-[#2b2b2b] hover:text-gray-200'}`}
                onClick={() => onViewChange('clients')}
              >
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">Clientes</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${active ? 'bg-[#2b2b2b] text-white' : 'text-gray-400 hover:bg-[#2b2b2b] hover:text-gray-200'}`}>
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const SpaceItem = ({ icon, label, subtext }: { icon: React.ReactNode, label: string, subtext?: string }) => (
  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#2b2b2b] cursor-pointer text-gray-400 hover:text-gray-200 transition-colors">
    {icon}
    <div className="flex flex-col overflow-hidden">
      <span className="text-sm font-medium text-gray-300 truncate">{label}</span>
      {subtext && <span className="text-xs text-gray-500 truncate">{subtext}</span>}
    </div>
  </div>
);

export default Sidebar;
