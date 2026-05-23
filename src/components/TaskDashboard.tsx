import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, ChevronRight, Calendar, Sparkles, CheckCircle2, 
  Settings, Inbox, Flag, MoreHorizontal, Plus, Circle, CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { format, isToday, isPast, parseISO, isValid } from 'date-fns';
import { TaskModal } from './ui/TaskModal';

// Prioridades do ClickUp
const PRIORITY_CONFIG: Record<string, { label: string; color: string; flag: string }> = {
  Urgent: { label: 'Urgente', color: '#ef4444', flag: '#ef4444' },
  High:   { label: 'Alta',    color: '#f59e0b', flag: '#f59e0b' },
  Normal: { label: 'Normal',  color: '#3b82f6', flag: '#3b82f6' },
  Low:    { label: 'Baixa',   color: '#6b7280', flag: '#6b7280' },
  None:   { label: '',        color: 'transparent', flag: '#374151' },
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = parseISO(dateStr);
  if (!isValid(d)) return dateStr;
  return format(d, 'M/d/yy'); // format like 4/3/26
};

const isOverdue = (dateStr?: string) => {
  if (!dateStr) return false;
  const d = parseISO(dateStr);
  if (!isValid(d)) return false;
  return isPast(d) && !isToday(d);
};

const isTaskClosed = (statusId: string, statuses: any[]) => {
  if (statusId === 's4') return true;
  const s = statuses.find(st => st.id === statusId);
  return !!s && (s.name.toUpperCase().includes('PRONTO') || s.name.toUpperCase().includes('CONCLU') || s.name.toUpperCase().includes('DONE'));
};

const TaskDashboard = () => {
  const { tasks, taskStatuses, updateTask } = useAppContext();
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'done' | 'delegated'>('pending');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overdue: true,
    today: true,
    next: true,
    unscheduled: false
  });
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const { overdue, today, next, unscheduled, closedTasks } = useMemo(() => {
    const activeTasks = tasks.filter(t => !isTaskClosed(t.statusId, taskStatuses));
    const closed = tasks.filter(t => isTaskClosed(t.statusId, taskStatuses));

    const ov: Task[] = [];
    const td: Task[] = [];
    const nx: Task[] = [];
    const un: Task[] = [];

    activeTasks.forEach(task => {
      if (!task.dueDate) {
        un.push(task);
      } else {
        const d = parseISO(task.dueDate);
        if (!isValid(d)) {
          un.push(task);
        } else if (isToday(d)) {
          td.push(task);
        } else if (isPast(d)) {
          ov.push(task);
        } else {
          nx.push(task);
        }
      }
    });

    // sort arrays by date
    ov.sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    td.sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    nx.sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    return { overdue: ov, today: td, next: nx, unscheduled: un, closedTasks: closed };
  }, [tasks, taskStatuses]);

  // Tarefas Recentes (apenas para o widget)
  const recentTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
  }, [tasks]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const TaskRow = ({ task }: { task: Task }) => {
    const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.None;
    const dateStr = formatDate(task.dueDate);
    const overdueFlag = isOverdue(task.dueDate);

    return (
      <div 
        className="flex items-center group hover:bg-white/[0.03] py-2 px-3 cursor-default border-b border-white/[0.03] last:border-0 transition-all"
      >
        <div className="flex-shrink-0 w-5 mr-3 flex items-center justify-center">
          <Circle 
            className="w-4 h-4 text-gray-600 hover:text-gray-400 cursor-pointer transition-colors" 
            onClick={() => updateTask(task.id, { statusId: taskStatuses.find(s => isTaskClosed(s.id, taskStatuses))?.id || task.statusId })}
          />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p 
            className="text-[13px] font-medium text-gray-300 truncate group-hover:text-white transition-colors cursor-pointer hover:underline underline-offset-2"
            onClick={() => setSelectedTask(task)}
          >
            {task.name}
          </p>
        </div>
        
        {/* Coluna Prioridade */}
        <div className="w-[100px] flex-shrink-0 px-2 flex items-center opacity-100">
          {task.priority !== 'None' ? (
            <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: prio.color }}>
              <Flag className="w-3.5 h-3.5" style={{ fill: prio.color, color: prio.color }} />
              {prio.label}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 opacity-0 group-hover:opacity-100">
              <Flag className="w-3.5 h-3.5" /> Setar
            </div>
          )}
        </div>

        {/* Coluna Data */}
        <div className="w-[110px] flex-shrink-0 px-2 flex items-center justify-end">
          {dateStr ? (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 ${overdueFlag ? 'text-red-400' : 'text-gray-400'}`}>
              {overdueFlag && <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-0.5" />}
              {dateStr}
            </span>
          ) : (
            <span className="text-[11px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Setar
            </span>
          )}
        </div>
      </div>
    );
  };

  const Section = ({ title, count, isExpanded, onToggle, tasks, emptyMessage }: any) => {
    return (
      <div className="flex flex-col">
        <div 
          className="flex items-center gap-2 px-2 py-2 hover:bg-white/[0.04] rounded-md cursor-pointer transition-colors group select-none"
          onClick={onToggle}
        >
          <button className="text-gray-500 group-hover:text-gray-300 transition-colors">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-200 transition-colors">
            {title === 'Pendente' && <span className="w-3 h-3 border border-gray-400 rounded-full flex items-center justify-center opacity-50" />}
            {title}
          </div>
          <span className="text-xs font-medium text-gray-500">{count}</span>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {tasks.length === 0 ? (
                <div className="py-4 px-8 text-xs text-gray-500 font-medium">
                  {emptyMessage || "Nenhuma tarefa."}
                </div>
              ) : (
                <div className="flex flex-col mb-4 pl-4 border-l-2 border-white/5 ml-3 mt-1">
                  {/* Títulos das colunas */}
                  <div className="flex items-center py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <div className="w-5 mr-3" />
                    <div className="flex-1 pr-4">Nome</div>
                    <div className="w-[100px] px-2">Prioridade</div>
                    <div className="w-[110px] px-2 text-right">Data de vencimento</div>
                  </div>
                  
                  {tasks.map((task: Task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const TabButton = ({ active, onClick, children }: any) => (
    <button 
      onClick={onClick}
      className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
        active ? 'border-primary text-gray-100' : 'border-transparent text-gray-500 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );

  const WidgetCard = ({ title, actionIcon, children }: any) => (
    <div className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-xl overflow-hidden flex flex-col hover:border-gray-700 transition-colors h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.02]">
        <h3 className="text-sm font-bold text-gray-200">{title}</h3>
        {actionIcon && <div className="text-gray-500 hover:text-gray-300 cursor-pointer">{actionIcon}</div>}
      </div>
      <div className="flex-1 p-5">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#111111] overflow-y-auto custom-scrollbar text-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">
          {greeting}, {profile?.fullName?.split(' ')[0] || 'Arthur'}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row px-8 pb-12 gap-6 w-full max-w-[1600px]">
        {/* Coluna Esquerda: Recentes e Meu Trabalho */}
        <div className="w-full lg:w-[32%] flex flex-col gap-6">
          
          {/* Recentes */}
          <div className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
            <div className="px-5 py-4 border-b border-white/[0.02]">
              <h2 className="text-sm font-bold text-gray-200">Recentes</h2>
            </div>
            <div className="p-2">
              {recentTasks.map(task => (
                <div key={task.id} 
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] rounded-lg cursor-pointer transition-colors group"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center text-xs">
                    <span className="font-medium text-gray-300 truncate group-hover:text-white transition-colors">{task.name}</span>
                    <span className="text-gray-600 mx-1.5">•</span>
                    <span className="text-gray-500 truncate">em Clientes</span>
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <div className="px-3 py-4 text-xs text-gray-500 text-center">Nenhum item recente.</div>
              )}
            </div>
          </div>

          {/* Meu Trabalho */}
          <div className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-xl overflow-hidden hover:border-gray-700 transition-colors flex-1 flex flex-col">
            <div className="px-5 py-4 border-b border-white/[0.02] flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-200">Meu trabalho</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-6 px-5 pt-2 border-b border-[#2b2b2b]">
              <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>Pendente</TabButton>
              <TabButton active={activeTab === 'done'} onClick={() => setActiveTab('done')}>Feito</TabButton>
              <TabButton active={activeTab === 'delegated'} onClick={() => setActiveTab('delegated')}>Delegado</TabButton>
            </div>

            <div className="p-3 flex-1">
              {activeTab === 'pending' && (
                <div className="flex flex-col gap-1">
                  <Section 
                    title="Hoje" 
                    count={today.length} 
                    isExpanded={expandedSections.today} 
                    onToggle={() => toggleSection('today')}
                    emptyMessage="As tarefas e os lembretes atribuídos a você serão exibidos aqui."
                    tasks={today}
                  />
                  <Section 
                    title="Em atraso" 
                    count={overdue.length} 
                    isExpanded={expandedSections.overdue} 
                    onToggle={() => toggleSection('overdue')}
                    tasks={overdue}
                  />
                  <Section 
                    title="Próximo" 
                    count={next.length} 
                    isExpanded={expandedSections.next} 
                    onToggle={() => toggleSection('next')}
                    tasks={next}
                  />
                  <Section 
                    title="Não programado" 
                    count={unscheduled.length} 
                    isExpanded={expandedSections.unscheduled} 
                    onToggle={() => toggleSection('unscheduled')}
                    tasks={unscheduled}
                  />
                </div>
              )}
              
              {activeTab === 'done' && (
                <div className="py-12 text-center text-sm font-medium text-gray-500">
                  {closedTasks.length === 0 ? "Nenhuma tarefa concluída recentemente." : `${closedTasks.length} tarefas concluídas.`}
                </div>
              )}

              {activeTab === 'delegated' && (
                <div className="py-12 text-center text-sm font-medium text-gray-500">
                  Nenhuma tarefa delegada.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Cards 2x2 */}
        <div className="w-full lg:w-[68%] grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
          {/* Minhas tarefas */}
          <WidgetCard title="Minhas tarefas" actionIcon={<Settings className="w-4 h-4" />}>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-20 mb-5 opacity-40 flex items-center justify-center relative">
                <Inbox className="w-14 h-14 text-gray-400" strokeWidth={1} />
                <div className="absolute bottom-3 right-0 bg-[#1a1a1a] rounded-full p-0.5 border-2 border-[#1a1a1a]">
                  <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-400 text-center max-w-[200px] mb-6">
                A lista pessoal contém todas as suas tarefas. <span className="text-primary hover:underline cursor-pointer">Saiba mais</span>
              </p>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-semibold text-gray-200 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Criar uma tarefa
              </button>
            </div>
          </WidgetCard>

          {/* Agenda */}
          <WidgetCard title="Agenda" actionIcon={<MoreHorizontal className="w-4 h-4" />}>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-5 text-gray-500 opacity-60">
                <CalendarDays className="w-16 h-16" strokeWidth={1} />
              </div>
              <p className="text-xs font-medium text-gray-400 text-center px-4 mb-7 max-w-[280px]">
                Conecte seu calendário para ver os próximos eventos e entrar na sua próxima chamada
              </p>
              
              <div className="flex flex-col gap-3 w-full max-w-[240px]">
                <button className="flex items-center justify-between px-4 py-2.5 bg-[#222] hover:bg-[#2a2a2a] border border-[#333] rounded-lg transition-colors w-full group">
                  <div className="flex items-center gap-2.5 text-[13px] font-semibold text-gray-300 group-hover:text-gray-100 transition-colors">
                    <div className="w-5 h-5 bg-white rounded flex items-center justify-center shadow-sm">
                      <span className="text-blue-500 font-extrabold text-[11px]">G</span>
                    </div>
                    Google Agenda
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">Conectar</span>
                </button>

                <button className="flex items-center justify-between px-4 py-2.5 bg-[#222] hover:bg-[#2a2a2a] border border-[#333] rounded-lg transition-colors w-full group">
                  <div className="flex items-center gap-2.5 text-[13px] font-semibold text-gray-300 group-hover:text-gray-100 transition-colors">
                    <div className="w-5 h-5 bg-[#0078D4] rounded flex items-center justify-center shadow-sm">
                      <span className="text-white font-extrabold text-[11px]">O</span>
                    </div>
                    Microsoft Outlook
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">Conectar</span>
                </button>
              </div>
            </div>
          </WidgetCard>

          {/* Prioridades */}
          <WidgetCard title="Prioridades" actionIcon={<Settings className="w-4 h-4" />}>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 mb-5 opacity-40 flex items-center justify-center relative">
                <div className="w-14 h-14 rounded-full border-2 border-gray-400 flex items-center justify-center relative bg-transparent">
                  <div className="absolute -bottom-1 -right-1 bg-[#1a1a1a] rounded-full p-0.5">
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-400 text-center max-w-[240px] mb-6">
                As Prioridades mantêm as tarefas mais importantes em uma única lista. <span className="text-primary hover:underline cursor-pointer">Saiba mais</span>
              </p>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-semibold text-gray-200 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Criar uma tarefa
              </button>
            </div>
          </WidgetCard>

          {/* StandUp da IA */}
          <WidgetCard title={<div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> StandUp da IA</div>}>
            <div className="flex flex-col items-center justify-center py-14">
              <div className="w-14 h-14 mb-5 relative">
                <div className="w-full h-full bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-500 rounded-2xl animate-pulse opacity-90 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-400 text-center max-w-[260px] mb-7 leading-relaxed">
                Use a IA ClickUp para criar resumos recorrentes das atividades recentes.
              </p>
              <button className="flex items-center gap-1.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-semibold text-gray-200 transition-colors">
                Criar uma recapitulação
              </button>
            </div>
          </WidgetCard>
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default TaskDashboard;
