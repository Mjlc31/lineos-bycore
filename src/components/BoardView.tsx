import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Plus, MoreHorizontal, Flag, GripVertical, CalendarDays, ListTodo, MessageSquare, Trash2, Eye, X, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Task } from '../types';
import { TaskModal } from './ui/TaskModal';
import {
  DndContext, closestCorners, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay, DragStartEvent, DragOverEvent, DragEndEvent, useDroppable
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityConfig: Record<string, { color: string; label: string; gradient: string }> = {
  Urgent: { color: '#ef4444', label: 'Urgente', gradient: 'from-red-500/20 to-transparent' },
  High:   { color: '#eab308', label: 'Alta',    gradient: 'from-yellow-500/20 to-transparent' },
  Normal: { color: '#3b82f6', label: 'Normal',  gradient: 'from-blue-500/20 to-transparent' },
  Low:    { color: '#9ca3af', label: 'Baixa',   gradient: 'from-gray-500/10 to-transparent' },
  None:   { color: 'transparent', label: '',    gradient: '' },
};

// ─── Funções utilitárias de data ───────────────────────────────────────────────
function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  if (dateStr.includes('atrás')) return true;
  try {
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d < new Date();
  } catch { return false; }
}

function formatDateRelative(dateStr?: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('atrás') || dateStr.includes('/') || dateStr.includes('mai') || dateStr.includes('jun')) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d atrás`;
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    if (diff < 7) return `${diff}d`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch { return dateStr; }
}

// ─── Avatar placeholder inteligente ──────────────────────────────────────────
function AvatarInitials({ name, src }: { name?: string; src: string }) {
  const [error, setError] = useState(false);
  if (!error && src && !src.includes('pravatar')) {
    return <img src={src} alt={name || 'A'} className="w-6 h-6 rounded-full object-cover border-2 border-[#141414]" onError={() => setError(true)} />;
  }
  const initials = (name || src.split('img=')[1] || 'U').toString().substring(0, 2).toUpperCase();
  const colors = ['#E31837', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];
  const colorIdx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div
      className="w-6 h-6 rounded-full border-2 border-[#141414] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
      style={{ backgroundColor: colors[colorIdx] }}
    >
      {initials.charAt(0)}
    </div>
  );
}

// ─── Column Context Menu ───────────────────────────────────────────────────────
function ColumnMenu({ onClose, onAddTask }: { onClose: () => void; onAddTask: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.12 }}
      className="absolute right-0 top-8 z-50 w-44 bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
    >
      <button onClick={() => { onAddTask(); onClose(); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
        <Plus className="w-3.5 h-3.5" /> Adicionar tarefa
      </button>
      <button onClick={onClose} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
        <Eye className="w-3.5 h-3.5" /> Ver todas
      </button>
      <div className="border-t border-white/5 my-1" />
      <button onClick={onClose} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
        <Trash2 className="w-3.5 h-3.5" /> Remover coluna
      </button>
    </motion.div>
  );
}

// ─── Droppable Column ─────────────────────────────────────────────────────────
const DroppableColumn = ({ id, children, isOver }: any) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[300px] max-w-[320px] w-[320px] flex-shrink-0 rounded-2xl transition-all duration-300 ${
        isOver
          ? 'bg-white/[0.04] ring-1 ring-primary/40 scale-[1.01]'
          : 'bg-white/[0.015] hover:bg-white/[0.025]'
      } border border-white/5`}
    >
      {children}
    </div>
  );
};

// ─── Task Card Content ────────────────────────────────────────────────────────
const TaskCardContent = ({ task, isOverlay = false }: { task: Task; isOverlay?: boolean }) => {
  const { rhTeam } = useAppContext();
  const prio = priorityConfig[task.priority] || priorityConfig.None;
  const overdueFlag = isOverdue(task.dueDate);
  const subtasksDone = task.subtasks?.filter(s => s.completed).length ?? 0;
  const subtasksTotal = task.subtasks?.length ?? 0;
  const subtaskPct = subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0;

  return (
    <>
      {/* Priority stripe */}
      {task.priority !== 'None' && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
          style={{ backgroundColor: prio.color }}
        />
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-3 pl-1">
        <h4 className="text-[13px] text-gray-200 font-semibold leading-snug group-hover:text-white transition-colors line-clamp-2">
          {task.name}
        </h4>
        <GripVertical className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 mt-0.5" />
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 pl-1">
          {task.tags.map(tag => (
            <span
              key={tag.name}
              className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md border"
              style={{ color: tag.color, backgroundColor: tag.bgColor, borderColor: tag.color + '30' }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Subtask progress bar */}
      {subtasksTotal > 0 && (
        <div className="mb-3 pl-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
              <ListTodo className="w-3 h-3" /> {subtasksDone}/{subtasksTotal} subtarefas
            </span>
            <span className="text-[10px] text-gray-500">{Math.round(subtaskPct)}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${subtaskPct}%`,
                background: subtaskPct === 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom row: meta info */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/5 pl-1">
        <div className="flex items-center gap-2.5 text-[11px] text-gray-500">
          {/* Comments count */}
          <div className="flex items-center gap-1 hover:text-gray-300 transition-colors">
            <MessageSquare className="w-3 h-3" />
            <span>{task.comments?.length ?? 0}</span>
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md transition-colors ${
              overdueFlag
                ? 'text-red-400 bg-red-500/10 ring-1 ring-red-500/20'
                : 'text-gray-400 bg-white/5'
            }`}>
              {overdueFlag ? <Zap className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
              {formatDateRelative(task.dueDate)}
            </div>
          )}
        </div>

        {/* Assignees + Priority */}
        <div className="flex items-center gap-2">
          {task.priority !== 'None' && (
            <div
              className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/5"
              style={{ color: prio.color }}
            >
              <Flag className="w-2.5 h-2.5" style={{ fill: prio.color }} />
              {prio.label}
            </div>
          )}
          <div className="flex -space-x-1.5">
            {(task.assignees || []).slice(0, 3).map((avatar, i) => {
              const member = rhTeam.find(rh =>
                (rh.avatar || '') === avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rh.name)}&background=3b82f6&color=fff` === avatar
              );
              return (
                <div key={i} className="hover:scale-110 hover:z-10 transition-transform cursor-pointer">
                  <AvatarInitials name={member?.name} src={avatar} />
                </div>
              );
            })}
            {(task.assignees?.length ?? 0) > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-[#141414] bg-white/10 flex items-center justify-center text-[9px] font-bold text-white">
                +{(task.assignees?.length ?? 0) - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Sortable Task Wrapper ────────────────────────────────────────────────────
const SortableTask = ({ task, onClick }: { task: Task; onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    opacity: isDragging ? 0.25 : 1,
    zIndex: isDragging ? 999 : 1,
    touchAction: 'none',
  };
  const overdueFlag = isOverdue(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`relative bg-[#141414] border rounded-xl p-4 transition-all duration-200 group overflow-hidden ${
        isDragging
          ? 'cursor-grabbing shadow-inner'
          : `cursor-grab border-white/5 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 ${
              overdueFlag ? 'hover:border-red-500/30' : 'hover:border-white/15'
            }`
      }`}
    >
      <TaskCardContent task={task} />
    </div>
  );
};

// ─── BoardView Props ──────────────────────────────────────────────────────────
interface BoardViewProps {
  filteredTasks: Task[];
  searchQuery: string;
  filterPriority: string | null;
  groupBy?: 'status' | 'assignee';
}

// ─── Main Component ───────────────────────────────────────────────────────────
const BoardView = ({ filteredTasks, searchQuery, filterPriority, groupBy = 'status' }: BoardViewProps) => {
  const { tasks, setTasks, taskStatuses, addTask, updateTask, rhTeam } = useAppContext();
  const [newTaskName, setNewTaskName] = useState('');
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openMenuColumn, setOpenMenuColumn] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const isFiltering = !!searchQuery || !!filterPriority;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const assigneesGroups = useMemo(() => {
    const avatars = new Set<string>();
    tasks.forEach(t => { if (t.assignees) t.assignees.forEach(a => avatars.add(a)); });
    return rhTeam
      .filter(rh => {
        const uAvatar = rh.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rh.name)}&background=3b82f6&color=fff`;
        return avatars.has(uAvatar);
      })
      .map(rh => {
        const uAvatar = rh.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rh.name)}&background=3b82f6&color=fff`;
        return { id: uAvatar, name: rh.name, color: '#3b82f6', avatar: uAvatar };
      });
  }, [tasks, rhTeam]);

  const groups = groupBy === 'assignee'
    ? [...assigneesGroups, { id: 'unassigned', name: 'Não atribuído', color: '#6b7280', avatar: '' }]
    : taskStatuses;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) { setOverColumnId(null); return; }
    const overId = over.id as string;
    const isOverAColumn = groups.find((g: any) => g.id === overId);
    if (isOverAColumn) {
      setOverColumnId(overId);
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        setOverColumnId(groupBy === 'status' ? overTask.statusId : (overTask.assignees?.[0] || 'unassigned'));
      }
    }
  }, [groups, tasks, groupBy]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;
    const activeTaskId = active.id as string;
    const overId = over.id as string;
    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (!activeTask) return;
    let targetColumnId = '';
    const isOverColumn = groups.find((g: any) => g.id === overId);
    if (isOverColumn) {
      targetColumnId = overId;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) targetColumnId = groupBy === 'status' ? overTask.statusId : (overTask.assignees?.[0] || 'unassigned');
    }
    if (targetColumnId && activeTask.statusId !== targetColumnId && groupBy === 'status') {
      updateTask(activeTaskId, { statusId: targetColumnId });
      setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, statusId: targetColumnId } : t));
    } else if (targetColumnId && groupBy === 'assignee') {
      const firstAssignee = activeTask.assignees?.[0] || 'unassigned';
      if (firstAssignee !== targetColumnId) {
        const newAssignees = targetColumnId === 'unassigned' ? [] : [targetColumnId];
        updateTask(activeTaskId, { assignees: newAssignees });
        setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, assignees: newAssignees } : t));
      }
    }
  }, [tasks, groups, groupBy, updateTask, setTasks]);

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  const quickAddTask = useCallback((statusId: string) => {
    if (!newTaskName.trim()) { setAddingToColumn(null); return; }
    const newTask: Omit<Task, 'id'> = {
      name: newTaskName,
      statusId,
      assignees: [],
      dueDate: '',
      priority: 'Normal' as any,
      subtasks: [],
      comments: [],
      attachments: [],
      description: '',
    };
    addTask(newTask);
    setNewTaskName('');
    setAddingToColumn(null);
  }, [newTaskName, addTask]);

  return (
    <div className="flex gap-5 p-8 h-full overflow-x-auto custom-scrollbar" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 100%)' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {groups.map((group: any) => {
          const columnTasks = groupBy === 'assignee'
            ? filteredTasks.filter(t =>
                group.id === 'unassigned'
                  ? (!t.assignees || t.assignees.length === 0)
                  : (t.assignees && t.assignees.includes(group.id))
              )
            : filteredTasks.filter(t => t.statusId === group.id);

          const isOver = overColumnId === group.id;
          if (isFiltering && columnTasks.length === 0) return null;

          const urgentCount = columnTasks.filter(t => t.priority === 'Urgent').length;

          return (
            <DroppableColumn key={group.id} id={group.id} isOver={isOver}>
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3.5 sticky top-0 bg-transparent z-10 backdrop-blur-sm rounded-t-2xl border-b border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  {groupBy === 'assignee' && group.avatar ? (
                    <AvatarInitials name={group.name} src={group.avatar} />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-md"
                      style={{ backgroundColor: group.color, boxShadow: `0 0 8px ${group.color}60` }}
                    />
                  )}
                  <span className="text-[12px] font-bold tracking-widest uppercase" style={{ color: groupBy === 'status' ? group.color : '#e5e7eb' }}>
                    {group.name}
                  </span>
                  <span className="text-[11px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full font-semibold border border-white/[0.06]">
                    {columnTasks.length}
                  </span>
                  {urgentCount > 0 && (
                    <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full font-bold border border-red-500/20 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" />{urgentCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 relative">
                  {groupBy === 'status' && (
                    <button
                      onClick={() => setAddingToColumn(group.id)}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setOpenMenuColumn(openMenuColumn === group.id ? null : group.id)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {openMenuColumn === group.id && (
                      <ColumnMenu
                        onClose={() => setOpenMenuColumn(null)}
                        onAddTask={() => setAddingToColumn(group.id)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Task list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3 pt-2 space-y-2.5 min-h-[80px]">
                <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {columnTasks.map(task => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      onClick={() => { setSelectedTask(task); setOpenMenuColumn(null); }}
                    />
                  ))}
                </SortableContext>

                {/* Quick-add inline input */}
                <AnimatePresence>
                  {addingToColumn === group.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="bg-[#141414] border border-primary/40 rounded-xl p-4 shadow-[0_0_20px_rgba(227,24,55,0.1)] ring-1 ring-primary/10"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={newTaskName}
                        onChange={e => setNewTaskName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); quickAddTask(group.id); }
                          if (e.key === 'Escape') { setAddingToColumn(null); setNewTaskName(''); }
                        }}
                        onBlur={() => quickAddTask(group.id)}
                        placeholder="Nome da tarefa... (Enter para salvar)"
                        className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder-gray-600 font-medium"
                      />
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-gray-500">↵ salvar · Esc cancelar</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {columnTasks.length === 0 && addingToColumn !== group.id && !isFiltering && (
                  <div className="flex flex-col items-center justify-center py-10 opacity-30">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-2">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">Sem tarefas</p>
                  </div>
                )}
              </div>

              {/* Footer: add button */}
              {addingToColumn !== group.id && groupBy === 'status' && (
                <button
                  onClick={() => setAddingToColumn(group.id)}
                  className="flex items-center gap-2 px-4 py-3 text-[12px] font-medium text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all mx-2 mb-2 rounded-xl border border-transparent hover:border-white/5 group/add"
                >
                  <Plus className="w-3.5 h-3.5 group-hover/add:rotate-90 transition-transform duration-200" />
                  Adicionar tarefa
                </button>
              )}
            </DroppableColumn>
          );
        })}

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeTask ? (
            <div className="bg-[#1c1c1c] border border-primary/50 rounded-xl p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_0_2px_#E31837] rotate-2 scale-105 w-[300px] cursor-grabbing backdrop-blur-md">
              <TaskCardContent task={activeTask} isOverlay={true} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskModal
          task={filteredTasks.find(t => t.id === selectedTask.id) || selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onRelatedTaskClick={taskId => {
            const rt = tasks.find(t => t.id === taskId);
            if (rt) setSelectedTask(rt);
          }}
        />
      )}
    </div>
  );
};

export default BoardView;
