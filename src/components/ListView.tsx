import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Plus, Flag, Calendar as CalendarIcon, MoreHorizontal, CheckCircle2, ArrowUp, Trash2, Edit3, ArrowRightLeft, Copy, ListTodo, Clock, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './Toast';
import { Task } from '../types';
import { TaskModal } from './ui/TaskModal';

interface ListViewProps {
  filteredTasks: Task[];
  searchQuery: string;
  filterPriority: string | null;
  groupBy?: 'status' | 'assignee';
}

const ListView = ({ filteredTasks, searchQuery, filterPriority, groupBy = 'status' }: ListViewProps) => {
  const { tasks, setTasks, taskStatuses, addTask, deleteTask, updateTask, addTaskStatus } = useAppContext();
  const { showToast, ToastContainer } = useToast();
  const [newTaskName, setNewTaskName] = useState('');
  const [addingToStatus, setAddingToStatus] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{ id: string; field: string } | null>(null);
  const [collapsedStatuses, setCollapsedStatuses] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [moveMenuTaskId, setMoveMenuTaskId] = useState<string | null>(null);
  const [addingNewStatus, setAddingNewStatus] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
        setMoveMenuTaskId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleCollapse = useCallback((statusId: string) => {
    setCollapsedStatuses(prev => {
      const next = new Set(prev);
      if (next.has(statusId)) next.delete(statusId);
      else next.add(statusId);
      return next;
    });
  }, []);

  const handleUpdateTask = useCallback((id: string, field: string, value: any) => {
    updateTask(id, { [field]: value });
    setEditingTask(null);
  }, [updateTask]);

  const handleAddTask = useCallback((statusId: string) => {
    if (!newTaskName.trim()) {
      setAddingToStatus(null);
      return;
    }
    addTask({
      name: newTaskName,
      statusId,
      assignees: ['https://i.pravatar.cc/150?img=11'],
      dueDate: 'Hoje',
      priority: 'Normal' as any,
    });
    setNewTaskName('');
    // Keep adding status open for rapid entry like Linear
  }, [newTaskName, addTask]);

  const handleDeleteTask = useCallback((taskId: string, taskName: string) => {
    const deletedTask = tasks.find(t => t.id === taskId);
    deleteTask(taskId);
    setOpenMenuId(null);
    setTimeout(() => {
      showToast(`"${taskName}" removida`, () => {
        if (deletedTask) setTasks(prev => [...prev, deletedTask]);
      });
    }, 0);
  }, [tasks, deleteTask, setTasks, showToast]);

  const handleDuplicateTask = useCallback((task: Task) => {
    addTask({
      name: `${task.name} (cópia)`,
      statusId: task.statusId,
      assignees: task.assignees,
      dueDate: task.dueDate,
      priority: task.priority as any,
      tags: task.tags,
    });
    setOpenMenuId(null);
    setTimeout(() => showToast('Tarefa duplicada'), 0);
  }, [addTask, showToast]);

  const handleMoveTask = useCallback((taskId: string, newStatusId: string) => {
    updateTask(taskId, { statusId: newStatusId });
    setOpenMenuId(null);
    setMoveMenuTaskId(null);
    setTimeout(() => showToast('Tarefa movida'), 0);
  }, [updateTask, showToast]);

  const handleAddStatus = useCallback(() => {
    if (!newStatusName.trim()) {
      setAddingNewStatus(false);
      return;
    }
    const colors = ['#e8384f', '#f2c744', '#fd7120', '#20c997', '#3b82f6', '#8b5cf6', '#ec4899'];
    const color = colors[taskStatuses.length % colors.length];
    addTaskStatus({ name: newStatusName.toUpperCase(), color });
    setNewStatusName('');
    setAddingNewStatus(false);
    setTimeout(() => showToast(`Status "${newStatusName}" criado`), 0);
  }, [newStatusName, taskStatuses.length, addTaskStatus, showToast]);

  const handleDragStart = (taskId: string) => { dragItem.current = taskId; };
  const handleDragOver = (e: React.DragEvent, groupId: string) => { e.preventDefault(); setDragOverId(groupId); };
  const handleDragLeave = () => { setDragOverId(null); };
  const handleDrop = (groupId: string) => {
    if (dragItem.current && groupBy === 'status') {
      updateTask(dragItem.current, { statusId: groupId });
    }
    dragItem.current = null;
    setDragOverId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, statusId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask(statusId);
    }
    else if (e.key === 'Escape') { 
      setAddingToStatus(null); 
      setNewTaskName(''); 
    }
  };

  const assigneesGroups = React.useMemo(() => {
    const avatars = new Set<string>();
    tasks.forEach(t => t.assignees.forEach(a => avatars.add(a)));
    return Array.from(avatars).map((avatar, idx) => ({
      id: avatar,
      name: `Responsável ${idx + 1}`,
      color: '#3b82f6',
      avatar
    }));
  }, [tasks]);

  const groups = groupBy === 'assignee' 
    ? [...assigneesGroups, { id: 'unassigned', name: 'Não atribuído', color: '#6b7280', avatar: '' }]
    : taskStatuses;

  const isFiltering = !!searchQuery || !!filterPriority;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a]">
      {/* Header Fixo da Tabela */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 pt-6 pb-3 px-8 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[800px]">
        <div className="w-[40%] flex items-center pl-8">Tarefa</div>
        <div className="w-[15%]">Responsável</div>
        <div className="w-[20%] flex items-center gap-1 group cursor-pointer hover:text-gray-300 transition-colors">
          Vencimento <ArrowUp className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="w-[15%]">Prioridade</div>
        <div className="w-[10%] flex justify-center">
          <Plus className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-12 pt-4 min-w-[800px]">
        {/* Filter indicator */}
        {isFiltering && (
          <div className="mb-6 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 text-sm text-primary/90 font-medium">
            <span>Mostrando {filteredTasks.length} de {tasks.length} tarefas</span>
            {searchQuery && <span className="bg-primary/20 px-2 py-1 rounded-md text-xs">Busca: "{searchQuery}"</span>}
            {filterPriority && <span className="bg-primary/20 px-2 py-1 rounded-md text-xs">Prioridade: {filterPriority}</span>}
          </div>
        )}

        <div className="space-y-8">
          {groups.map((group: any) => {
            const groupTasks = groupBy === 'assignee' 
              ? filteredTasks.filter(t => group.id === 'unassigned' ? t.assignees.length === 0 : t.assignees.includes(group.id))
              : filteredTasks.filter(t => t.statusId === group.id);
              
            const isCollapsed = collapsedStatuses.has(group.id);
            if (isFiltering && groupTasks.length === 0) return null;
            const isDragOver = dragOverId === group.id;

            return (
              <div 
                key={group.id} 
                className={`flex flex-col transition-all duration-200 rounded-xl ${isDragOver ? 'bg-white/5 ring-1 ring-primary/40 p-2 -mx-2' : ''}`}
                onDragOver={(e) => handleDragOver(e, group.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(group.id)}
              >
                {/* Status Header */}
                <div
                  className="flex items-center gap-3 mb-2 group cursor-pointer sticky top-12 bg-[#0a0a0a] py-2 z-10 w-max"
                  onClick={() => toggleCollapse(group.id)}
                >
                  <div className="p-1 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-white">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/5 shadow-sm" style={{ backgroundColor: group.color + '15' }}>
                    {groupBy === 'assignee' && group.avatar ? (
                      <img src={group.avatar} className="w-4 h-4 rounded-full border border-white/10" alt="Avatar" />
                    ) : (
                      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: group.color, backgroundColor: group.color }} />
                    )}
                    <span className="text-xs font-bold tracking-wide" style={{ color: group.color }}>{group.name}</span>
                  </div>
                  
                  <span className="text-xs text-gray-500 font-medium ml-1">{groupTasks.length}</span>
                  
                  <div className="opacity-0 group-hover:opacity-100 flex items-center ml-2 transition-opacity">
                    {groupBy === 'status' && (
                      <button
                        className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setAddingToStatus(group.id); if(isCollapsed) toggleCollapse(group.id); }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tasks List */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      key={`tasks-${group.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col border-l-2 ml-2 pl-4 overflow-hidden"
                      style={{ borderColor: group.color + '30' }}
                    >
                      {groupTasks.map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                          onMouseEnter={() => setHoveredTaskId(task.id)}
                          onMouseLeave={() => setHoveredTaskId(null)}
                          className={`flex items-center py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] group/row -ml-4 pl-4 pr-2 transition-all relative cursor-grab active:cursor-grabbing
                            ${hoveredTaskId === task.id ? 'bg-white/[0.02]' : ''}
                          `}
                        >
                          {/* Drag Handle Indicator */}
                          <div className={`absolute left-0 w-4 h-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity -ml-3`}>
                             <GripVertical className="w-3.5 h-3.5 text-gray-600" />
                          </div>

                          <div className="w-[40%] flex items-center gap-3">
                            {/* Checkbox Linear Style */}
                            <div
                              className="w-4 h-4 rounded-[4px] border border-gray-600 flex-shrink-0 cursor-pointer hover:border-white transition-colors flex items-center justify-center group/status"
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = taskStatuses.findIndex(s => s.id === task.statusId);
                                const nextStatus = taskStatuses[(currentIndex + 1) % taskStatuses.length];
                                updateTask(task.id, { statusId: nextStatus.id });
                              }}
                            >
                               <CheckCircle2 className="w-3 h-3 opacity-0 group-hover/status:opacity-100 text-gray-400" />
                            </div>

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
                                className="bg-primary/10 border border-primary/50 outline-none text-[13px] text-white w-full h-7 font-medium px-2 rounded-md shadow-[0_0_0_2px_rgba(59,130,246,0.1)] transition-all"
                              />
                            ) : (
                              <span
                                className="text-[13px] text-gray-200 font-medium cursor-pointer hover:text-white transition-colors truncate flex-1"
                                onClick={() => setSelectedTask(task)}
                              >
                                {task.name}
                              </span>
                            )}
                            
                            <div className="flex items-center gap-2">
                              {task.subtasks && task.subtasks.length > 0 && (
                                <span className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-white/5">
                                  <ListTodo className="w-3 h-3 text-gray-500" />
                                  {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                                </span>
                              )}
                              {task.isTimerRunning && (
                                <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                                  <Clock className="w-3 h-3" />
                                  Gravando
                                </span>
                              )}
                              {task.tags?.slice(0, 2).map(tag => (
                                <span
                                  key={tag.name}
                                  className="px-1.5 py-0.5 text-[9px] font-bold tracking-wide rounded border"
                                  style={{ color: tag.color, backgroundColor: tag.bgColor, borderColor: tag.color + '40' }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {task.tags && task.tags.length > 2 && (
                                <span className="px-1 py-0.5 text-[9px] text-gray-500 bg-white/5 rounded">+{task.tags.length - 2}</span>
                              )}
                            </div>
                          </div>

                          <div className="w-[15%] flex items-center">
                            {task.assignees.map((avatar, i) => (
                              <img key={i} src={avatar} alt="Assignee" className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] cursor-pointer hover:scale-110 transition-transform -ml-1 first:ml-0 shadow-sm" />
                            ))}
                            {hoveredTaskId === task.id && (
                               <div className="w-6 h-6 rounded-full border border-dashed border-gray-600 flex items-center justify-center -ml-1 bg-[#0a0a0a] cursor-pointer hover:border-white transition-colors hover:text-white text-gray-500">
                                  <Plus className="w-3 h-3" />
                               </div>
                            )}
                          </div>

                          <div className="w-[20%] flex items-center text-[12px] font-medium">
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
                                placeholder="Ex: Amanhã"
                                className="bg-primary/10 border border-primary/50 text-white rounded-md px-2 py-1 outline-none text-[12px] w-28 font-medium shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
                              />
                            ) : (
                              <div
                                className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors w-full py-1"
                                onClick={() => setEditingTask({ id: task.id, field: 'dueDate' })}
                              >
                                {task.dueDate ? (
                                  <span className={`px-2 py-0.5 rounded-md ${task.dueDate.includes('atrás') ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-gray-400 hover:bg-white/5'}`}>{task.dueDate}</span>
                                ) : (
                                  <span className="text-gray-600 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 border border-dashed border-gray-700 px-2 py-0.5 rounded-md hover:border-gray-500 hover:text-gray-400">
                                    <CalendarIcon className="w-3 h-3" /> Setar data
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="w-[15%] flex items-center relative">
                            {editingTask?.id === task.id && editingTask?.field === 'priority' ? (
                              <select
                                autoFocus
                                defaultValue={task.priority}
                                onBlur={(e) => handleUpdateTask(task.id, 'priority', e.target.value)}
                                onChange={(e) => handleUpdateTask(task.id, 'priority', e.target.value)}
                                className="bg-primary/10 border border-primary/50 rounded-md px-2 py-1 outline-none text-xs text-white w-28 appearance-none shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
                              >
                                <option value="Urgent">Urgente</option>
                                <option value="High">Alta</option>
                                <option value="Normal">Normal</option>
                                <option value="Low">Baixa</option>
                                <option value="None">Nenhuma</option>
                              </select>
                            ) : (
                              <div
                                className="cursor-pointer py-1 px-2 rounded-md hover:bg-white/5 transition-colors"
                                onClick={() => setEditingTask({ id: task.id, field: 'priority' })}
                              >
                                <PriorityIcon priority={task.priority} />
                              </div>
                            )}
                          </div>

                          {/* Context Menu */}
                          <div className="w-[10%] flex justify-center relative" ref={openMenuId === task.id ? menuRef : undefined}>
                            <button
                              className={`transition-opacity p-1.5 rounded-md hover:bg-white/10 hover:text-white ${openMenuId === task.id ? 'opacity-100 text-white bg-white/10' : 'opacity-0 text-gray-500 group-hover/row:opacity-100'}`}
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === task.id ? null : task.id); setMoveMenuTaskId(null); }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {openMenuId === task.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-8 top-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 w-48 py-1.5 overflow-hidden backdrop-blur-xl"
                                >
                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    onClick={() => { setEditingTask({ id: task.id, field: 'name' }); setOpenMenuId(null); }}
                                  >
                                    <Edit3 className="w-4 h-4 text-gray-500" /> Renomear
                                  </button>
                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    onClick={() => handleDuplicateTask(task)}
                                  >
                                    <Copy className="w-4 h-4 text-gray-500" /> Duplicar
                                  </button>
                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    onClick={() => setMoveMenuTaskId(moveMenuTaskId === task.id ? null : task.id)}
                                  >
                                    <ArrowRightLeft className="w-4 h-4 text-gray-500" /> Mover para...
                                  </button>

                                  {/* Move submenu */}
                                  <AnimatePresence>
                                    {moveMenuTaskId === task.id && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-white/5 bg-black/20"
                                      >
                                        {taskStatuses.filter(s => s.id !== task.statusId).map(s => (
                                          <button
                                            key={s.id}
                                            className="w-full flex items-center gap-3 px-6 py-2 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                                            onClick={() => handleMoveTask(task.id, s.id)}
                                          >
                                            <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ color: s.color, backgroundColor: s.color }} />
                                            {s.name}
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  <div className="border-t border-white/5 my-1" />
                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                    onClick={() => handleDeleteTask(task.id, task.name)}
                                  >
                                    <Trash2 className="w-4 h-4" /> Deletar
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      ))}

                      {/* Add Task Input */}
                      {addingToStatus === group.id && (
                        <div className="flex items-center py-2.5 border-b border-white/[0.03] -ml-4 pl-4 pr-2 bg-white/[0.01]">
                          <div className="w-[40%] flex items-center gap-3">
                            <div className="w-4 h-4 rounded-[4px] border border-gray-700 flex-shrink-0" />
                            <input
                              type="text"
                              autoFocus
                              value={newTaskName}
                              onChange={(e) => setNewTaskName(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, group.id)}
                              onBlur={() => { if(newTaskName.trim()) handleAddTask(group.id); else setAddingToStatus(null); }}
                              placeholder="Nome da tarefa... (Enter para salvar)"
                              className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder-gray-600 font-medium"
                            />
                          </div>
                        </div>
                      )}

                      {/* Add Task Row (Inline Button) */}
                      {addingToStatus !== group.id && (
                        <div
                          className="flex items-center py-2.5 text-[13px] font-medium text-gray-500 hover:text-gray-300 cursor-pointer -ml-4 pl-4 group transition-colors hover:bg-white/[0.02]"
                          onClick={() => setAddingToStatus(group.id)}
                        >
                          <Plus className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                          Adicionar tarefa...
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* No results */}
          {isFiltering && filteredTasks.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <div className="text-base font-bold text-gray-300">Nenhuma tarefa encontrada</div>
              <div className="text-sm mt-1">Tente ajustar seus filtros ou busca.</div>
            </motion.div>
          )}

          {/* New Status */}
          {!isFiltering && (
            addingNewStatus ? (
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="text"
                  autoFocus
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddStatus();
                    if (e.key === 'Escape') { setAddingNewStatus(false); setNewStatusName(''); }
                  }}
                  onBlur={() => handleAddStatus()}
                  placeholder="Nome do novo status..."
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none text-sm text-white placeholder-gray-600 w-64 focus:border-primary/50 transition-colors shadow-sm"
                />
              </div>
            ) : (
              <div
                className="flex items-center py-2 text-sm font-medium text-gray-500 hover:text-white cursor-pointer transition-colors mt-6 w-max px-2 hover:bg-white/5 rounded-md"
                onClick={() => setAddingNewStatus(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo status
              </div>
            )
          )}
        </div>
      </div>

      <ToastContainer />

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={filteredTasks.find(t => t.id === selectedTask.id) || selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onRelatedTaskClick={(taskId) => {
            const rt = tasks.find(t => t.id === taskId);
            if (rt) setSelectedTask(rt);
          }}
        />
      )}
    </div>
  );
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  switch (priority) {
    case 'Urgent': return <div className="flex items-center gap-2 text-xs font-bold text-red-500"><Flag className="w-3.5 h-3.5 fill-red-500" /> Urgente</div>;
    case 'High': return <div className="flex items-center gap-2 text-xs font-bold text-yellow-500"><Flag className="w-3.5 h-3.5 fill-yellow-500" /> Alta</div>;
    case 'Normal': return <div className="flex items-center gap-2 text-xs font-bold text-blue-400"><Flag className="w-3.5 h-3.5 fill-blue-400" /> Normal</div>;
    case 'Low': return <div className="flex items-center gap-2 text-xs font-bold text-gray-400"><Flag className="w-3.5 h-3.5 fill-gray-400" /> Baixa</div>;
    default: return (
       <div className="flex items-center gap-2 text-xs font-medium text-gray-600 opacity-0 group-hover/row:opacity-100 transition-opacity">
         <Flag className="w-3.5 h-3.5 border border-dashed border-gray-600 rounded-[2px]" /> 
         Setar
       </div>
    );
  }
};

export default ListView;
