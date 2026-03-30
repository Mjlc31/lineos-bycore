import React, { useState } from 'react';
import { ChevronDown, Plus, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { clientStatuses, clients as initialClients } from '../data';
import { motion, AnimatePresence } from 'motion/react';

const ClientList = () => {
  const [clients, setClients] = useState(initialClients);
  const [newClientName, setNewClientName] = useState('');
  const [addingToStatus, setAddingToStatus] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<{ id: string, field: string } | null>(null);

  const handleUpdateClient = (id: string, field: string, value: any) => {
    setClients(clients.map(c => c.id === id ? { ...c, [field]: value } : c));
    setEditingClient(null);
  };

  const handleAddClient = (statusId: string) => {
    if (!newClientName.trim()) {
      setAddingToStatus(null);
      return;
    }

    const newClient = {
      id: `client-${Date.now()}`,
      name: newClientName,
      statusId,
      assignees: ['https://i.pravatar.cc/150?img=11'],
      faturamento: '-',
      segmento: '-',
      repositorio: '-',
      ultimaReuniao: '-'
    };

    setClients([...clients, newClient]);
    setNewClientName('');
    setAddingToStatus(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, statusId: string) => {
    if (e.key === 'Enter') {
      handleAddClient(statusId);
    } else if (e.key === 'Escape') {
      setAddingToStatus(null);
      setNewClientName('');
    }
  };

  return (
    <div className="p-6 min-w-[1200px]">
      {/* Table Header */}
      <div className="flex items-center text-xs text-gray-500 font-medium border-b border-[#2b2b2b] pb-2 mb-4 px-4 pr-6">
        <div className="flex-[2] pl-6">Nome</div>
        <div className="flex-1">Responsável</div>
        <div className="flex-1">Faturamento Anual Co...</div>
        <div className="flex-1">Segmento de Atuação</div>
        <div className="flex-1">Repositório de Docum...</div>
        <div className="flex-1">Última Reunião de Suc...</div>
        <div className="flex-1">Status</div>
        <div className="w-10 flex justify-center"><Plus className="w-4 h-4 cursor-pointer hover:text-gray-300" /></div>
      </div>

      <div className="space-y-6">
        {clientStatuses.map(status => {
          const statusClients = clients.filter(c => c.statusId === status.id);
          
          return (
            <div key={status.id} className="flex flex-col">
              {/* Status Header */}
              <div className="flex items-center gap-2 mb-2 group cursor-pointer sticky top-0 bg-[#141414] py-1 z-10">
                <ChevronDown className="w-4 h-4 text-gray-500 hover:text-gray-300 transition-colors" />
                <div 
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-white tracking-wide"
                  style={{ backgroundColor: status.color }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {status.name}
                </div>
                <span className="text-xs text-gray-500 font-medium">{statusClients.length}</span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2 transition-opacity">
                  <Plus 
                    className="w-4 h-4 text-gray-400 hover:text-gray-200" 
                    onClick={(e) => { e.stopPropagation(); setAddingToStatus(status.id); }}
                  />
                  <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                </div>
              </div>

              {/* Clients List */}
              <div className="flex flex-col border-l border-[#2b2b2b] ml-2 pl-4">
                <AnimatePresence>
                  {statusClients.map(client => (
                    <motion.div 
                      key={client.id} 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center py-2 border-b border-[#2b2b2b] hover:bg-[#1e1e1e] group -ml-4 pl-4 pr-2 transition-colors"
                    >
                      <div className="flex-[2] flex items-center gap-3">
                        <div 
                          className="w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 cursor-pointer hover:bg-opacity-20 transition-colors"
                          style={{ borderColor: status.color }}
                          onClick={() => {
                            const currentIndex = clientStatuses.findIndex(s => s.id === client.statusId);
                            const nextStatus = clientStatuses[(currentIndex + 1) % clientStatuses.length];
                            setClients(clients.map(c => c.id === client.id ? { ...c, statusId: nextStatus.id } : c));
                          }}
                        ></div>
                        {editingClient?.id === client.id && editingClient?.field === 'name' ? (
                          <input 
                            type="text"
                            autoFocus
                            defaultValue={client.name}
                            onBlur={(e) => handleUpdateClient(client.id, 'name', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateClient(client.id, 'name', e.currentTarget.value);
                              if (e.key === 'Escape') setEditingClient(null);
                            }}
                            className="bg-transparent border-b border-purple-500 outline-none text-sm text-white w-full"
                          />
                        ) : (
                          <span 
                            className="text-sm text-gray-200 font-medium cursor-pointer hover:text-purple-400 transition-colors truncate"
                            onClick={() => setEditingClient({ id: client.id, field: 'name' })}
                          >
                            {client.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 flex items-center">
                        {client.assignees.map((avatar, i) => (
                          <img key={i} src={avatar} alt="Assignee" className="w-6 h-6 rounded-full border border-[#141414] cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all" />
                        ))}
                      </div>
                      
                      <div className="flex-1 text-sm text-gray-400">
                        {editingClient?.id === client.id && editingClient?.field === 'faturamento' ? (
                          <input 
                            type="text"
                            autoFocus
                            defaultValue={client.faturamento}
                            onBlur={(e) => handleUpdateClient(client.id, 'faturamento', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateClient(client.id, 'faturamento', e.currentTarget.value);
                              if (e.key === 'Escape') setEditingClient(null);
                            }}
                            className="bg-[#1e1e1e] border border-[#333] rounded px-2 py-1 outline-none text-xs text-white w-full"
                          />
                        ) : (
                          <div 
                            className="cursor-pointer hover:text-gray-200 transition-colors w-full h-full min-h-[20px]"
                            onClick={() => setEditingClient({ id: client.id, field: 'faturamento' })}
                          >
                            {client.faturamento || '-'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-sm text-gray-400">
                        {editingClient?.id === client.id && editingClient?.field === 'segmento' ? (
                          <input 
                            type="text"
                            autoFocus
                            defaultValue={client.segmento}
                            onBlur={(e) => handleUpdateClient(client.id, 'segmento', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateClient(client.id, 'segmento', e.currentTarget.value);
                              if (e.key === 'Escape') setEditingClient(null);
                            }}
                            className="bg-[#1e1e1e] border border-[#333] rounded px-2 py-1 outline-none text-xs text-white w-full"
                          />
                        ) : (
                          <div 
                            className="cursor-pointer hover:text-gray-200 transition-colors w-full h-full min-h-[20px]"
                            onClick={() => setEditingClient({ id: client.id, field: 'segmento' })}
                          >
                            {client.segmento || '-'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-sm text-gray-400">
                        {editingClient?.id === client.id && editingClient?.field === 'repositorio' ? (
                          <input 
                            type="text"
                            autoFocus
                            defaultValue={client.repositorio}
                            onBlur={(e) => handleUpdateClient(client.id, 'repositorio', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateClient(client.id, 'repositorio', e.currentTarget.value);
                              if (e.key === 'Escape') setEditingClient(null);
                            }}
                            className="bg-[#1e1e1e] border border-[#333] rounded px-2 py-1 outline-none text-xs text-white w-full"
                          />
                        ) : (
                          <div 
                            className="cursor-pointer hover:text-gray-200 transition-colors w-full h-full min-h-[20px]"
                            onClick={() => setEditingClient({ id: client.id, field: 'repositorio' })}
                          >
                            {client.repositorio || '-'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-sm text-gray-400">
                        {editingClient?.id === client.id && editingClient?.field === 'ultimaReuniao' ? (
                          <input 
                            type="text"
                            autoFocus
                            defaultValue={client.ultimaReuniao}
                            onBlur={(e) => handleUpdateClient(client.id, 'ultimaReuniao', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateClient(client.id, 'ultimaReuniao', e.currentTarget.value);
                              if (e.key === 'Escape') setEditingClient(null);
                            }}
                            className="bg-[#1e1e1e] border border-[#333] rounded px-2 py-1 outline-none text-xs text-white w-full"
                          />
                        ) : (
                          <div 
                            className="cursor-pointer hover:text-gray-200 transition-colors w-full h-full min-h-[20px]"
                            onClick={() => setEditingClient({ id: client.id, field: 'ultimaReuniao' })}
                          >
                            {client.ultimaReuniao || '-'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-sm text-gray-400">{status.name}</div>
                      
                      <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-200" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add Client Input */}
                {addingToStatus === status.id && (
                  <div className="flex items-center py-2 border-b border-[#2b2b2b] -ml-4 pl-4 pr-2">
                    <div className="flex-[2] flex items-center gap-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0"
                        style={{ borderColor: status.color }}
                      ></div>
                      <input 
                        type="text"
                        autoFocus
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, status.id)}
                        onBlur={() => handleAddClient(status.id)}
                        placeholder="Nome do cliente"
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
                      />
                    </div>
                  </div>
                )}

                {/* Add Client Row (if not currently adding) */}
                {addingToStatus !== status.id && (
                  <div 
                    className="flex items-center py-2 text-sm text-gray-500 hover:text-gray-300 cursor-pointer -ml-4 pl-4 group transition-colors"
                    onClick={() => setAddingToStatus(status.id)}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#2b2b2b] flex items-center justify-center mr-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                    </div>
                    Adicionar Client
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientList;
