import React, { useMemo } from 'react';
import {
  Layers, Clock, CheckCircle2, Flag, TrendingUp, Users, AlertTriangle,
  Activity, ArrowUpRight, Target, Zap, BarChart3, Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

// ─── Donut Chart SVG ──────────────────────────────────────────────────────────
function DonutChart({ value, total, color, size = 72 }: { value: number; total: number; color: string; size?: number }) {
  const pct = total > 0 ? value / total : 0;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <motion.circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

// ─── Animated number ─────────────────────────────────────────────────────────
function StatNumber({ n, color }: { n: number; color: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-3xl font-bold tabular-nums"
      style={{ color }}
    >
      {n}
    </motion.span>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, total, color, icon: Icon, sub, delay = 0
}: {
  label: string; value: number; total?: number; color: string;
  icon: React.ElementType; sub: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative bg-[#111] border border-white/[0.06] rounded-2xl p-5 overflow-hidden group cursor-default"
      style={{ boxShadow: `0 0 40px ${color}08` }}
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 30% 30%, ${color}10, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {total !== undefined && (
          <DonutChart value={value} total={total} color={color} size={44} />
        )}
      </div>

      <div className="relative z-10">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1">{label}</div>
        <StatNumber n={value} color={color} />
        <div className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
          {sub}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Mini horizontal bar ─────────────────────────────────────────────────────
function HBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex-1">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
      />
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
const Overview = () => {
  const { tasks, taskStatuses, clients, clientStatuses } = useAppContext();

  const tasksByStatus = useMemo(() =>
    taskStatuses.map(s => ({ ...s, count: tasks.filter(t => t.statusId === s.id).length })),
    [tasks, taskStatuses]
  );

  const totalTasks = tasks.length;
  const completedStatusId = taskStatuses.find(s => s.name.includes('PRONTO') || s.name.includes('CONCLU'))?.id;
  const completedCount = completedStatusId ? tasks.filter(t => t.statusId === completedStatusId).length : 0;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const urgentTasks = useMemo(() => tasks.filter(t => t.priority === 'Urgent' || t.priority === 'High'), [tasks]);
  const overdueTasks = useMemo(() => tasks.filter(t => t.dueDate?.includes('atrás')), [tasks]);
  const recentTasks = useMemo(() => [...tasks].reverse().slice(0, 6), [tasks]);

  const activeClients = useMemo(() => {
    const activeStatusId = clientStatuses.find(s => s.name.includes('ACTIVE'))?.id;
    return activeStatusId ? clients.filter(c => c.statusId === activeStatusId).length : clients.length;
  }, [clients, clientStatuses]);

  // Priority distribution
  const byPriority = useMemo(() => [
    { label: 'Urgente', color: '#ef4444', count: tasks.filter(t => t.priority === 'Urgent').length },
    { label: 'Alta',    color: '#eab308', count: tasks.filter(t => t.priority === 'High').length },
    { label: 'Normal',  color: '#3b82f6', count: tasks.filter(t => t.priority === 'Normal').length },
    { label: 'Baixa',   color: '#9ca3af', count: tasks.filter(t => t.priority === 'Low').length },
  ], [tasks]);

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto custom-scrollbar" style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0d0d10 100%)' }}>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            Visão Geral do Workspace
          </h2>
          <p className="text-xs text-gray-500 mt-1 ml-11">Resumo de tarefas, progresso e atividade recente</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Atualizado agora
        </div>
      </div>

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Tarefas" value={totalTasks} total={totalTasks || 1}
          color="#E31837" icon={Layers}
          sub={`${progressPct}% concluídas`}
          delay={0}
        />
        <KpiCard
          label="Concluídas" value={completedCount} total={totalTasks || 1}
          color="#10b981" icon={CheckCircle2}
          sub={`de ${totalTasks} tarefas`}
          delay={0.08}
        />
        <KpiCard
          label="Alta Prioridade" value={urgentTasks.length} total={totalTasks || 1}
          color="#eab308" icon={Flag}
          sub="Urgentes + Altas"
          delay={0.16}
        />
        <KpiCard
          label="Clientes Ativos" value={activeClients} total={clients.length || 1}
          color="#3b82f6" icon={Users}
          sub={`de ${clients.length} total`}
          delay={0.24}
        />
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Por Status – col 4 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="col-span-4 bg-[#111] border border-white/[0.06] rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Por Status
          </h3>
          <div className="space-y-3.5">
            {tasksByStatus.map(s => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}80` }} />
                    <span className="text-[11px] text-gray-300 font-medium">{s.name}</span>
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: s.color }}>{s.count}</span>
                </div>
                <HBar pct={totalTasks > 0 ? (s.count / totalTasks) * 100 : 0} color={s.color} />
              </div>
            ))}
          </div>

          {/* Priority mini chart */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">Por Prioridade</h4>
            <div className="grid grid-cols-4 gap-2">
              {byPriority.map(p => (
                <div key={p.label} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}
                  >
                    {p.count}
                  </div>
                  <span className="text-[9px] text-gray-500 font-medium">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tarefas Recentes – col 4 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.38 }}
          className="col-span-4 bg-[#111] border border-white/[0.06] rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Tarefas Recentes
          </h3>
          {recentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-2">
                <Layers className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Nenhuma tarefa ainda.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTasks.map((task, i) => {
                const status = taskStatuses.find(s => s.id === task.statusId);
                const pColor = task.priority === 'Urgent' ? '#ef4444' : task.priority === 'High' ? '#eab308' : '#9ca3af';
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: status?.color || '#666', boxShadow: `0 0 5px ${status?.color || '#666'}60` }} />
                    <span className="text-[12px] text-gray-300 truncate flex-1 group-hover:text-white transition-colors font-medium">{task.name}</span>
                    {task.priority !== 'None' && (
                      <Flag className="w-3 h-3 flex-shrink-0 opacity-70" style={{ color: pColor, fill: pColor }} />
                    )}
                    <ArrowUpRight className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Alertas + Meta – col 4 */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.46 }}
            className="bg-[#111] border border-white/[0.06] rounded-2xl p-5 flex-1"
          >
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Alertas
            </h3>
            {overdueTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-xs text-green-400 font-semibold">Tudo em dia!</p>
                <p className="text-[10px] text-gray-500 mt-1">Nenhuma tarefa atrasada 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 py-2 px-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <Zap className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span className="text-[11px] text-gray-300 truncate flex-1">{task.name}</span>
                    <span className="text-[10px] text-red-400 font-bold flex-shrink-0">{task.dueDate}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Progress goal card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.54 }}
            className="bg-gradient-to-br from-primary/10 to-purple-500/5 border border-primary/20 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Meta do Ciclo
              </h3>
              <span className="text-xl font-black text-white">{progressPct}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #E31837, #f43f5e, #a855f7)` }}
              />
            </div>
            <p className="text-[11px] text-gray-400">
              {completedCount} de {totalTasks} tarefas concluídas
              {progressPct >= 80 && <span className="ml-1 text-green-400 font-semibold">🔥 Excelente!</span>}
              {progressPct >= 50 && progressPct < 80 && <span className="ml-1 text-yellow-400">Bom ritmo!</span>}
              {progressPct < 50 && totalTasks > 0 && <span className="ml-1 text-gray-500">Continue assim</span>}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
