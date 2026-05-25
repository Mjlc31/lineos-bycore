import React, { useState, useMemo, useEffect } from 'react';
import {
  Home, CheckSquare, MoreHorizontal, Plus, Search,
  ChevronDown, ChevronRight, Folder as FolderIcon, List, BarChart3, Dna
} from 'lucide-react';
import { ViewType, Client } from '../types';
import { useAppContext } from '../context/AppContext';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onOpenClientDetails?: (client: Client) => void;
  selectedLocation?: { type: 'space' | 'folder' | 'list', id: string } | null;
  onSelectLocation?: (location: { type: 'space' | 'folder' | 'list', id: string } | null) => void;
}

const Sidebar = ({ currentView, onViewChange, onOpenClientDetails, selectedLocation, onSelectLocation }: SidebarProps) => {
  const { tasks, clients, spaces, folders, lists, addSpace, addFolder, addList } = useAppContext();
  const { profile } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Controlar quais espaços/pastas estão abertos
  const [openSpaces, setOpenSpaces] = useState<Record<string, boolean>>({});
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const toggleSpace = (id: string) => setOpenSpaces(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFolder = (id: string) => setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));

  // Inicializar todos os espaços e pastas como abertos
  useEffect(() => {
    if (spaces.length > 0 && Object.keys(openSpaces).length === 0) {
      const initial: Record<string, boolean> = {};
      spaces.forEach(s => initial[s.id] = true);
      setOpenSpaces(initial);
    }
    if (folders.length > 0 && Object.keys(openFolders).length === 0) {
      const initial: Record<string, boolean> = {};
      folders.forEach(f => initial[f.id] = true);
      setOpenFolders(initial);
    }
  }, [spaces, folders]);

  const handleSelectLocation = (type: 'space' | 'folder' | 'list', id: string) => {
    if (onSelectLocation) {
      onSelectLocation({ type, id });
      onViewChange('tasks'); // Redireciona para visualização de tarefas
    }
  };

  const taskCount = tasks.length;

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    return clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [clients, searchQuery]);

  return (
    <div className="w-[260px] bg-[#0d0d0d] border-r border-[#222] flex flex-col h-full overflow-y-auto flex-shrink-0 custom-scrollbar">
      {/* Workspace Header */}
      <div 
        className="p-4 flex items-center justify-between hover:bg-[#2b2b2b] cursor-pointer transition-colors"
        onClick={() => onViewChange('overview')}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {(profile?.fullName || 'A')[0].toUpperCase()}
          </div>
          <span className="font-medium text-sm truncate text-gray-200">{profile?.fullName ? `${profile.fullName}'s Workspace` : 'LINE OS Workspace'}</span>
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 text-sm text-gray-400 border border-white/5 focus-within:border-primary/30 transition-colors">
          <Search className="w-4 h-4 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar"
            className="bg-transparent border-none outline-none text-sm text-gray-200 w-full placeholder-gray-500"
          />
          {!searchQuery && (
            <span className="ml-auto text-[10px] font-medium bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333333] flex-shrink-0">Ctrl K</span>
          )}
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-gray-300 flex-shrink-0">✕</button>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <div className="px-2 py-2 space-y-0.5">
        <NavItem icon={<Home className="w-4 h-4" />} label="Início" onClick={() => onViewChange('overview')} active={currentView === 'overview'} />
        <NavItem
          icon={<CheckSquare className="w-4 h-4" />}
          label="Tudo (Everything)"
          badge={taskCount}
          onClick={() => {
            if (onSelectLocation) onSelectLocation(null);
            onViewChange('tasks');
          }}
          active={(currentView === 'tasks' || currentView === 'board' || currentView === 'calendar') && !selectedLocation}
        />
        <NavItem icon={<BarChart3 className="w-4 h-4" />} label="Dashboard" onClick={() => onViewChange('task-dashboard')} active={currentView === 'task-dashboard'} />
        <NavItem icon={<FolderIcon className="w-4 h-4" />} label="CRM Clientes" onClick={() => onViewChange('client-database')} active={currentView === 'client-database' || currentView === 'clients'} />
        <NavItem icon={<Dna className="w-4 h-4" />} label="DNA dos Clientes" onClick={() => onViewChange('dna-clientes')} active={currentView === 'dna-clientes'} />
      </div>

      {/* Spaces */}
      <div className="mt-4 px-2 flex-1 pb-4">
        <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 group cursor-pointer hover:text-gray-300 transition-colors">
          <span>Espaços</span>
          <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
            const name = window.prompt('Nome do novo Espaço:');
            if (name) {
              await addSpace({ name, iconText: name[0].toUpperCase(), color: '#E31837' });
              showToast(`Espaço "${name}" criado!`);
            }
          }} />
        </div>
        
        <div className="mt-1 space-y-0.5">
          {spaces.map(space => (
            <div key={space.id} className="mt-2">
              <div
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${selectedLocation?.type === 'space' && selectedLocation.id === space.id ? 'bg-[#2b2b2b]' : 'hover:bg-white/5'}`}
                onClick={(e) => {
                  // Se clicou direto no espaço, filtra as tarefas
                  handleSelectLocation('space', space.id);
                }}
              >
                <div onClick={(e) => { e.stopPropagation(); toggleSpace(space.id); }} className="p-0.5 hover:bg-white/10 rounded">
                  {openSpaces[space.id] ? (
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-500" />
                  )}
                </div>
                <div 
                  className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: space.color || '#E31837' }}
                >
                  {space.icon || space.name[0]}
                </div>
                <span className={`text-sm font-medium ${selectedLocation?.type === 'space' && selectedLocation.id === space.id ? 'text-white' : 'text-gray-200'}`}>{space.name}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <MoreHorizontal className="w-3 h-3 text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); showToast('Configurações do Espaço'); }} />
                  <Plus className="w-3 h-3 text-gray-400 hover:text-white" onClick={async (e) => { 
                    e.stopPropagation(); 
                    const nome = window.prompt('Nome da nova pasta:');
                    if (nome) {
                      await addFolder({ spaceId: space.id, name: nome });
                      showToast(`Pasta "${nome}" criada com sucesso!`);
                      setOpenSpaces(prev => ({...prev, [space.id]: true}));
                    }
                  }} />
                  <List className="w-3 h-3 text-gray-400 hover:text-white" onClick={async (e) => {
                    e.stopPropagation();
                    const nome = window.prompt('Nome da nova Lista solta:');
                    if (nome) {
                      await addList({ spaceId: space.id, name: nome, color: '#3b82f6' });
                      showToast(`Lista "${nome}" criada!`);
                      setOpenSpaces(prev => ({...prev, [space.id]: true}));
                    }
                  }} />
                </div>
              </div>

              {openSpaces[space.id] && (
                <div className="ml-6 pl-2 border-l border-[#333333] mt-1 space-y-0.5">
                  {/* Pastas deste espaço */}
                  {folders.filter(f => f.spaceId === space.id).map(folder => (
                    <div key={folder.id}>
                      <div 
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${selectedLocation?.type === 'folder' && selectedLocation.id === folder.id ? 'bg-[#2b2b2b]' : 'hover:bg-white/5'}`}
                        onClick={() => handleSelectLocation('folder', folder.id)}
                      >
                        <button onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }} className="p-0.5 hover:bg-white/10 rounded text-gray-400">
                          {openFolders[folder.id] ? (
                            <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        <div className="flex items-center gap-2 flex-1">
                          <FolderIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={`text-sm font-medium ${selectedLocation?.type === 'folder' && selectedLocation.id === folder.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{folder.name}</span>
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <Plus className="w-3 h-3 text-gray-400 hover:text-white" onClick={async (e) => { 
                            e.stopPropagation(); 
                            const nome = window.prompt('Nome da nova lista:');
                            if (nome) {
                              await addList({ spaceId: space.id, folderId: folder.id, name: nome, color: '#10b981' });
                              showToast(`Lista "${nome}" criada com sucesso!`);
                              setOpenFolders(prev => ({...prev, [folder.id]: true}));
                            }
                          }} />
                        </div>
                      </div>

                      {openFolders[folder.id] && (
                        <div className="ml-5 pl-2 border-l border-[#2a2a2a] mt-0.5 space-y-0.5">
                          {/* Listas desta pasta */}
                          {lists.filter(l => l.folderId === folder.id).map(list => (
                            <button
                              key={list.id}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-left ${selectedLocation?.type === 'list' && selectedLocation.id === list.id ? 'bg-[#2b2b2b] text-white' : 'text-gray-400 hover:bg-[#2b2b2b] hover:text-gray-200'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectLocation('list', list.id);
                              }}
                            >
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: list.color || '#3b82f6' }} />
                              <span className="text-sm font-medium truncate flex-1">{list.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Listas soltas no espaço (sem pasta) */}
                  {lists.filter(l => l.spaceId === space.id && !l.folderId).map(list => (
                    <button
                      key={list.id}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-left ${selectedLocation?.type === 'list' && selectedLocation.id === list.id ? 'bg-[#2b2b2b] text-white' : 'text-gray-400 hover:bg-[#2b2b2b] hover:text-gray-200'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectLocation('list', list.id);
                      }}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: list.color || '#3b82f6' }} />
                      <span className="text-sm font-medium truncate flex-1">{list.name}</span>
                    </button>
                  ))}
                  
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

const NavItem = ({ icon, label, active, badge, onClick }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
      active ? 'bg-[#2b2b2b] text-white' : 'text-gray-400 hover:bg-[#2b2b2b] hover:text-gray-200'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="ml-auto text-[10px] text-gray-500 bg-[#2b2b2b] px-1.5 py-0.5 rounded-full font-medium">{badge}</span>
    )}
  </div>
);

export default Sidebar;
