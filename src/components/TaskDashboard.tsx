import React, { useMemo } from 'react';
import { LayoutDashboard, CheckCircle2, AlertCircle, Users, BarChart3, Clock, AlertTriangle, ChevronRight, Activity, TrendingUp, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

// Helper: verifica se uma data (string ISO ou texto) está no passado
const isOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  // Tentar parsear como ISO date
  const d = new Date(dueDate);
  if (!isNaN(d.getTime())) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  }
  // Fallback para textos legados como "3 dias atrás"
  return dueDate.includes('atrás');
};

const TaskDashboard = () => {
  const { tasks, taskStatuses, clients } = useAppContext();

  // Métricas Superiores
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.statusId === 's4' || taskStatuses.find(s => s.id === t.statusId)?.name.toUpperCase().includes('PRONTO')).length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length;
  const activeClients = clients.length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Por Status (Para as barras horizontais)
  const statusMetrics = useMemo(() => {
    return taskStatuses.map(status => {
      const count = tasks.filter(t => t.statusId === status.id).length;
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      return { ...status, count, percentage };
    }).filter(s => s.count > 0).sort((a, b) => b.count - a.count);
  }, [tasks, taskStatuses, totalTasks]);

  // Tarefas Recentes
  const recentTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 6);
  }, [tasks]);

  // Tarefas Atrasadas para o Alerta (usando comparação de data real)
  const delayedTasks = tasks.filter(t => isOverdue(t.dueDate) && t.statusId !== 's4');

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] p-6 lg:p-10 overflow-y-auto custom-scrollbar text-white">
      {/* Header Estilo ClickUp 3.0 / Linear */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight mb-1">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Visão Geral
          </h2>
          <p className="text-sm text-gray-400 font-medium">Acompanhe a saúde do seu workspace e o progresso da equipe.</p>
        </div>
      </motion.div>

      {/* 4 Cards Principais - Glassmorphism & Neon Subtle */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="w-16 h-16 text-blue-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Tarefas</div>
          </div>
          <div className="text-4xl font-extrabold text-white tracking-tight">{totalTasks}</div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Concluídas</div>
          </div>
          <div className="flex items-end gap-3">
             <div className="text-4xl font-extrabold text-white tracking-tight">{completedTasks}</div>
             <div className="text-sm font-medium text-emerald-400 mb-1.5">({completionRate}%)</div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prioritárias</div>
          </div>
          <div className="text-4xl font-extrabold text-white tracking-tight">{highPriorityTasks}</div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-purple-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clientes</div>
          </div>
          <div className="text-4xl font-extrabold text-white tracking-tight">{activeClients}</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Tarefas Recentes & Status */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Por Status (Barras de Progresso Premium) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/[0.02] border border-white/5 rounded-2xl p-7 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
             <h3 className="text-sm font-bold text-white mb-7 flex items-center gap-2 uppercase tracking-widest">
               <Activity className="w-4 h-4 text-gray-400" /> Progresso por Status
             </h3>
             <div className="flex flex-col gap-5">
               {statusMetrics.map((status, idx) => (
                 <div key={status.id} className="flex flex-col gap-2">
                   <div className="flex items-center justify-between text-xs font-semibold">
                     <span className="text-gray-300">{status.name}</span>
                     <span className="text-white bg-white/5 px-2 py-0.5 rounded-md">{status.count} <span className="text-gray-500 font-medium">({status.percentage}%)</span></span>
                   </div>
                   <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.max(status.percentage, 2)}%` }}
                       transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "easeOut" }}
                       className="h-full rounded-full relative" 
                       style={{ backgroundColor: status.color, boxShadow: `0 0 10px ${status.color}40` }}
                     >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20" />
                     </motion.div>
                   </div>
                 </div>
                 
               ))}
               {statusMetrics.length === 0 && (
                 <p className="text-sm text-gray-500 italic">Nenhum dado de status disponível.</p>
               )}
             </div>
          </motion.div>

          {/* Tarefas Recentes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/[0.02] border border-white/5 rounded-2xl p-7">
             <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
               <Clock className="w-4 h-4 text-gray-400" /> Tarefas Recentes
             </h3>
             <div className="flex flex-col gap-3">
               {recentTasks.map((task, idx) => {
                 const status = taskStatuses.find(s => s.id === task.statusId);
                 return (
                   <motion.div 
                     key={task.id}
                     initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + (idx * 0.05) }}
                     className="flex items-center justify-between p-4 bg-black/20 rounded-xl hover:bg-white/[0.04] transition-all border border-white/5 hover:border-white/10 group cursor-pointer"
                   >
                     <div className="flex items-center gap-4">
                       <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: status?.color || '#555', boxShadow: `0 0 8px ${status?.color || '#555'}40` }} />
                       <div>
                         <p className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors">{task.name}</p>
                         <p className="text-xs text-gray-500 mt-1 font-medium">{status?.name || 'Sem Status'}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                        {task.dueDate && (
                          <span className="text-xs font-semibold text-gray-400 bg-black/40 px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1.5">
                            <CalendarDays className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        )}
                        <div className="p-1 rounded-full group-hover:bg-white/10 transition-colors">
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
                        </div>
                     </div>
                   </motion.div>
                 );
               })}
               {recentTasks.length === 0 && (
                 <p className="text-sm text-gray-500 italic text-center py-6">Nenhuma tarefa criada recentemente.</p>
               )}
             </div>
          </motion.div>

        </div>

        {/* Coluna Direita: Alertas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col gap-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-7 flex-1 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
             
             <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest relative z-10">
               <AlertTriangle className="w-4 h-4 text-red-400" /> Alertas Críticos
             </h3>
             
             {delayedTasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center flex-1 text-center bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-8 relative z-10">
                 <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20">
                   <CheckCircle2 className="w-7 h-7" />
                 </div>
                 <h4 className="text-base font-bold text-emerald-400 mb-2">Workspace Saudável!</h4>
                 <p className="text-sm text-emerald-500/70 font-medium">Você não tem tarefas atrasadas. Ótimo trabalho!</p>
               </div>
             ) : (
               <div className="flex flex-col gap-4 relative z-10">
                 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mb-2 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                   <h4 className="text-sm font-bold text-red-400 mb-1.5 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                     Atenção Necessária
                   </h4>
                   <p className="text-xs text-red-400/80 font-medium">Você tem <span className="font-bold text-red-400">{delayedTasks.length}</span> tarefa(s) pendente(s) e atrasada(s).</p>
                 </div>
                 
                 <div className="space-y-3">
                   {delayedTasks.slice(0, 7).map(task => (
                     <div key={task.id} className="p-3.5 bg-black/30 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-colors flex items-start justify-between group cursor-pointer">
                       <p className="text-xs font-medium text-gray-300 line-clamp-2 pr-3 group-hover:text-white transition-colors">{task.name}</p>
                       <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md whitespace-nowrap ring-1 ring-red-500/20">{task.dueDate}</span>
                     </div>
                   ))}
                   {delayedTasks.length > 7 && (
                     <p className="text-xs font-medium text-center text-gray-500 mt-4 bg-white/5 py-2 rounded-lg">E outras {delayedTasks.length - 7} tarefas...</p>
                   )}
                 </div>
               </div>
             )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default TaskDashboard;
