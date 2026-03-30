import React, { useState } from 'react';
import { ChevronDown, Plus, Flag, Calendar as CalendarIcon, MoreHorizontal, CheckCircle2, ArrowUp } from 'lucide-react';
import { statuses } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const ListView = () => {
  const { tasks, setTasks } = useAppContext();
  const [newTaskName, setNewTaskName] = useState('');
  const [addingToStatus, setAddingToStatus] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<{ id: string, field: string } | null>(null);

  const handleUpdateTask = (id: string, field: string, value: any) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    setEditingTask(null);
  };

  const handleAddTask = (statusId: string) => {
    if (!newTaskName.trim()) {
      setAddingToStatus(null);
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      statusId,
      assignees: ['https://i.pravatar.cc/150?img=11'],
      dueDate: 'Hoje',
      priority: 'Normal',
      tags: []
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskName('');
    setAddingToStatus(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, statusId: string) => {
    if (e.key === 'Enter') {
      handleAddTask(statusId);
    } else if (e.key === 'Escape') {
      setAddingToStatus(null);
      setNewTaskName('');
    }
  };

  return (
    <div className="p-6 min-w-[800px]">
      {/* Table Header */}
      <div className="flex items-center text-xs text-gray-500 font-medium border-b border-[#2b2b2b] pb-2 mb-4 px-4 pr-6">
        <div className="flex-1 pl-6">Nome</div>
        <div className="w-32">Responsável</div>
        <div className="w-40 flex items-center gap-1">
          Data de vencimento <ArrowUp className="w-3 h-3 text-purple-500" />
        </div>
        <div className="w-32">Prioridade</div>
        <div className="w-10 flex justify-center"><Plus className="w-4 h-4 cursor-pointer hover:text-gray-300" /></div>
      </div>

      <div className="space-y-6">
        {statuses.map(status => {
          const statusTasks = tasks.filter(t => t.statusId === status.id);
          
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
                <span className="text-xs text-gray-500 font-medium">{statusTasks.length}</span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2 transition-opacity">
                  <Plus 
                    className="w-4 h-4 text-gray-400 hover:text-gray-200" 
                    onClick={(e) => { e.stopPropagation(); setAddingToStatus(status.id); }}
                  />
                  <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-200" />
                </div>
              </div>

              {/* Tasks List */}
              <div className="flex flex-col border-l border-[#2b2b2b] ml-2 pl-4">
                <AnimatePresence>
                  {statusTasks.map(task => (
                    <motion.div 
                      key={task.id} 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center py-2 border-b border-[#2b2b2b] hover:bg-[#1e1e1e] group -ml-4 pl-4 pr-2 transition-colors"
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <div 
                          className="w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 cursor-pointer hover:bg-opacity-20 transition-colors"
                          style={{ borderColor: status.color }}
                          onClick={() => {
                            // Simple toggle to next status for demo
                            const currentIndex = statuses.findIndex(s => s.id === task.statusId);
                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                            setTasks(tasks.map(t => t.id === task.id ? { ...t, statusId: nextStatus.id } : t));
                          }}
                        ></div>
                        {editingTask?.id === task.id && editingTask?.field === 'name' ? (
                          <input 
                            type="text"
                            autoFocus
                            defaultValue={task.name}
                            onBlur={(e) => handleUpdateTask(task.id, 'name', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateTask(task.id, 'name', e.currentTarget.value);
                              if (e.key === 'Escape') setEditingTask(null);
                            }}
                            className="bg-transparent border-b border-purple-500 outline-none text-sm text-white w-full"
                          />
                        ) : (
                          <span 
                            className="text-sm text-gray-200 font-medium cursor-pointer hover:text-purple-400 transition-colors truncate"
                            onClick={() => setEditingTask({ id: task.id, field: 'name' })}
                          >
                            {task.name}
                          </span>
                        )}
                        {task.tags?.map(tag => (
                          <span 
                            key={tag.name} 
                            className="px-1.5 py-0.5 text-[10px] font-medium rounded border"
                            style={{ color: tag.color, backgroundColor: tag.bgColor, borderColor: tag.color + '40' }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      
                      <div className="w-32 flex items-center">
                        {task.assignees.map((avatar, i) => (
                          <img key={i} src={avatar} alt="Assignee" className="w-6 h-6 rounded-full border border-[#141414] cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all" />
                        ))}
                      </div>
                      
                      <div className="w-40 flex items-center text-xs font-medium">
                        {editingTask?.id === task.id && editingTask?.field === 'dueDate' ? (
                          <input 
                            type="text"
                            autoFocus
                            defaultValue={task.dueDate}
                            onBlur={(e) => handleUpdateTask(task.id, 'dueDate', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateTask(task.id, 'dueDate', e.currentTarget.value);
                              if (e.key === 'Escape') setEditingTask(null);
                            }}
                            placeholder="Ex: Amanhã, 10/12"
                            className="bg-[#1e1e1e] border border-[#333] rounded px-2 py-1 outline-none text-xs text-white w-24"
                          />
                        ) : (
                          <div 
                            className="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition-colors w-full h-full"
                            onClick={() => setEditingTask({ id: task.id, field: 'dueDate' })}
                          >
                            {task.dueDate ? (
                              <span className={task.dueDate.includes('atrás') ? 'text-red-400' : 'text-gray-400'}>{task.dueDate}</span>
                            ) : (
                              <CalendarIcon className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-all" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-32 flex items-center relative">
                        {editingTask?.id === task.id && editingTask?.field === 'priority' ? (
                          <select 
                            autoFocus
                            defaultValue={task.priority}
                            onBlur={(e) => handleUpdateTask(task.id, 'priority', e.target.value)}
                            onChange={(e) => handleUpdateTask(task.id, 'priority', e.target.value)}
                            className="bg-[#1e1e1e] border border-[#333] rounded px-2 py-1 outline-none text-xs text-white w-24 appearance-none"
                          >
                            <option value="Urgent">Urgente</option>
                            <option value="High">Alta</option>
                            <option value="Normal">Normal</option>
                            <option value="Low">Baixa</option>
                            <option value="None">Nenhuma</option>
                          </select>
                        ) : (
                          <div 
                            className="cursor-pointer w-full h-full flex items-center"
                            onClick={() => setEditingTask({ id: task.id, field: 'priority' })}
                          >
                            <PriorityIcon priority={task.priority} />
                          </div>
                        )}
                      </div>
                      
                      <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-200" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Add Task Input */}
                {addingToStatus === status.id && (
                  <div className="flex items-center py-2 border-b border-[#2b2b2b] -ml-4 pl-4 pr-2">
                    <div className="flex-1 flex items-center gap-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0"
                        style={{ borderColor: status.color }}
                      ></div>
                      <input 
                        type="text"
                        autoFocus
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, status.id)}
                        onBlur={() => handleAddTask(status.id)}
                        placeholder="Nome da tarefa"
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
                      />
                    </div>
                  </div>
                )}

                {/* Add Task Row (if there are tasks and not currently adding) */}
                {addingToStatus !== status.id && (
                  <div 
                    className="flex items-center py-2 text-sm text-gray-500 hover:text-gray-300 cursor-pointer -ml-4 pl-4 group transition-colors"
                    onClick={() => setAddingToStatus(status.id)}
                  >
                    <Plus className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Adicionar Tarefa
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* New Status Button */}
        <div className="flex items-center py-2 text-sm text-gray-500 hover:text-gray-300 cursor-pointer transition-colors mt-4">
          <Plus className="w-4 h-4 mr-2" />
          Novo status
        </div>
      </div>
    </div>
  );
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  switch (priority) {
    case 'Urgent': return <div className="flex items-center gap-1.5 text-xs text-red-500"><Flag className="w-3.5 h-3.5 fill-red-500" /> Urgente</div>;
    case 'High': return <div className="flex items-center gap-1.5 text-xs text-yellow-500"><Flag className="w-3.5 h-3.5 fill-yellow-500" /> Alta</div>;
    case 'Normal': return <div className="flex items-center gap-1.5 text-xs text-blue-400"><Flag className="w-3.5 h-3.5 fill-blue-400" /> Normal</div>;
    case 'Low': return <div className="flex items-center gap-1.5 text-xs text-gray-400"><Flag className="w-3.5 h-3.5 fill-gray-400" /> Baixa</div>;
    default: return <Flag className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-gray-400 transition-opacity" />;
  }
};

export default ListView;
