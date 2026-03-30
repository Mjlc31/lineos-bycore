import React from 'react';
import { List, LayoutGrid, Calendar, Plus, Filter, Users, Search, Settings, Share2, Sparkles, Zap, Phone, ChevronDown, AlignLeft, Table, CheckCircle2 } from 'lucide-react';
import { ViewType } from '../types';

interface TopBarProps {
  currentView: ViewType;
  onOpenSettings: () => void;
}

const TopBar = ({ currentView, onOpenSettings }: TopBarProps) => {
  return (
    <div className="flex flex-col border-b border-[#2b2b2b] bg-[#141414] flex-shrink-0">
      {/* Breadcrumbs & Actions */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          {currentView === 'overview' && (
            <>
              <span className="text-gray-400 hover:underline cursor-pointer">Space</span>
              <ChevronDown className="w-3 h-3 text-gray-500 ml-1 cursor-pointer" />
            </>
          )}
          {currentView === 'tasks' && (
            <>
              <span className="text-gray-400 hover:underline cursor-pointer">Demandas dos clientes</span>
              <span className="text-gray-600">/</span>
              <span className="text-gray-400 hover:underline cursor-pointer flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#3a2a2a] flex items-center justify-center text-[10px]">💼</span>
                Clientes Line
              </span>
              <span className="text-gray-600">/</span>
              <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#2a2a2a] flex items-center justify-center text-[10px]">📝</span>
                Pão de Queijo KiDelícia
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500 ml-1 cursor-pointer" />
            </>
          )}
          {currentView === 'clients' && (
            <>
              <span className="text-gray-400 hover:underline cursor-pointer flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#3a2a2a] flex items-center justify-center text-[10px] text-red-500">E</span>
                Espaço da equipe
              </span>
              <span className="text-gray-600">/</span>
              <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                Clientes
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500 ml-1 cursor-pointer" />
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1 hover:text-gray-200 cursor-pointer transition-colors">
            <Phone className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 hover:text-gray-200 cursor-pointer transition-colors">
            <Users className="w-4 h-4" />
            <span>Agentes</span>
          </div>
          {currentView === 'tasks' && (
            <div className="flex items-center gap-1 hover:text-gray-200 cursor-pointer transition-colors">
              <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>3</span>
            </div>
          )}
          {currentView === 'clients' && (
            <div className="flex items-center gap-1 hover:text-gray-200 cursor-pointer transition-colors">
              <Zap className="w-4 h-4 text-purple-500 fill-purple-500" />
              <span>2</span>
            </div>
          )}
          <div className="flex items-center gap-1 hover:text-gray-200 cursor-pointer transition-colors">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Pergunte à IA</span>
          </div>
          <div className="flex items-center gap-1 hover:text-gray-200 cursor-pointer transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </div>
        </div>
      </div>

      {/* Views Tabs */}
      <div className="flex items-center px-6 gap-1 border-b border-[#2b2b2b]">
        <div className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:bg-[#2b2b2b] rounded-t-md cursor-pointer transition-colors">
          <Plus className="w-4 h-4" />
          <span>Adicionar canal</span>
        </div>
        <div className="w-px h-4 bg-[#333333] mx-1"></div>
        
        {currentView === 'overview' && (
          <>
            <Tab icon={<AlignLeft className="w-4 h-4" />} label="Overview" active />
            <Tab icon={<List className="w-4 h-4" />} label="Lista" />
            <Tab icon={<LayoutGrid className="w-4 h-4" />} label="Quadro" />
          </>
        )}
        
        {currentView === 'tasks' && (
          <>
            <Tab icon={<List className="w-4 h-4" />} label="Lista" active />
            <Tab icon={<LayoutGrid className="w-4 h-4" />} label="Quadro" />
            <Tab icon={<Calendar className="w-4 h-4" />} label="Calendário" />
          </>
        )}

        {currentView === 'clients' && (
          <>
            <Tab icon={<Calendar className="w-4 h-4 text-orange-500" />} label="Calendário" />
            <Tab icon={<AlignLeft className="w-4 h-4 text-purple-500" />} label="Gantt" />
            <Tab icon={<LayoutGrid className="w-4 h-4 text-blue-500" />} label="Client Pipeline" />
            <Tab icon={<List className="w-4 h-4" />} label="Client List" active />
            <Tab icon={<Table className="w-4 h-4 text-green-500" />} label="Client Database" />
          </>
        )}

        <div className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:bg-[#2b2b2b] rounded-t-md cursor-pointer transition-colors">
          <Plus className="w-4 h-4" />
          <span>Visualização</span>
        </div>
      </div>

      {/* Sub-bar (Filters, Search, etc.) */}
      {currentView !== 'overview' && (
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#2b2b2b] hover:bg-[#333333] rounded text-gray-300 transition-colors border border-transparent hover:border-[#444]">
              <Filter className="w-3 h-3" />
              {currentView === 'clients' ? 'Grupo: Status' : 'Status'}
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#2b2b2b] hover:bg-[#333333] rounded text-gray-300 transition-colors border border-transparent hover:border-[#444]">
              <List className="w-3 h-3" />
              {currentView === 'clients' ? 'Subtarefas' : 'Expandidas'}
            </button>
            {currentView === 'clients' && (
              <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#2b2b2b] hover:bg-[#333333] rounded text-gray-300 transition-colors border border-transparent hover:border-[#444]">
                <Table className="w-3 h-3" />
                Colunas
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {currentView === 'clients' && (
              <>
                <div className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 cursor-pointer">
                  <Filter className="w-3 h-3" /> Filtro
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 cursor-pointer">
                  <CheckCircle2 className="w-3 h-3 text-purple-500" /> Fechado
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 cursor-pointer">
                  <Users className="w-3 h-3" /> Responsável
                  <div className="w-4 h-4 rounded-full bg-gray-600 text-white flex items-center justify-center text-[10px]">A</div>
                </div>
              </>
            )}
            {currentView === 'tasks' && (
              <>
                <Filter className="w-4 h-4 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" />
                <Users className="w-4 h-4 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" />
              </>
            )}
            
            <Search className="w-4 h-4 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" />
            <Settings className="w-4 h-4 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" />
            
            {currentView === 'clients' && (
              <button onClick={onOpenSettings} className="flex items-center gap-1 text-xs text-gray-300 hover:text-white border border-[#444] px-2 py-1 rounded">
                <Settings className="w-3 h-3" /> Personalizar
              </button>
            )}

            <div className="flex items-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium px-3 py-1.5 rounded-l flex items-center gap-1 transition-colors border-r border-purple-800">
                {currentView === 'clients' ? 'Add Client' : (
                  <>
                    <Plus className="w-3 h-3" /> Tarefa
                  </>
                )}
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-1.5 py-1.5 rounded-r transition-colors">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Tab = ({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer border-b-2 ${active ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:bg-[#2b2b2b] hover:text-gray-200'} rounded-t-md transition-all`}>
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

export default TopBar;
