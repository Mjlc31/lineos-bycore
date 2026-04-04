import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, TrendingUp, DollarSign, Users, Calendar, CheckSquare, Clock, ArrowRight, Video, Link, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAppContext } from '../context/AppContext';

// --- Dashboard Helper Functions ---
const getTodayStr = () => new Date().toISOString().split('T')[0];
const toIsoDate = (d: string) => {
  if (d.includes('/')) {
    const p = d.split('/');
    return p.length === 2 ? `${new Date().getFullYear()}-${p[1]}-${p[0]}` : `${p[2]}-${p[1]}-${p[0]}`;
  }
  if (d.toLowerCase() === 'hoje') return getTodayStr();
  return d;
};

const Dashboard = ({ onNavigate }: { onNavigate: (tab: any) => void }) => {
  const { leads, transactions, contentItems, meetings, tasks } = useAppContext();
  const today = getTodayStr();

  // --- KPIs Calculations ---
  const pipelineValue = useMemo(() => leads
    .filter(l => l.columnId !== 'ganho' && l.columnId !== 'perdido')
    .reduce((acc, curr) => acc + curr.value, 0), [leads]);
    
  const revenue = useMemo(() => transactions
    .filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0), [transactions]);
  const expenses = useMemo(() => transactions
    .filter(t => t.type === 'expense').reduce((acc, curr) => acc + Math.abs(curr.amount), 0), [transactions]);
  const profit = revenue - expenses;

  const pendingContents = useMemo(() => contentItems.filter(c => c.status !== 'APROVADO'), [contentItems]);
  const pendingTasks = useMemo(() => tasks.filter(t => t.statusId !== 's4'), [tasks]);

  // --- CRM Chart Data ---
  const crmData = useMemo(() => {
    const cols = [
      { id: 'leads', name: 'Leads' },
      { id: 'agendada', name: 'Reunião' },
      { id: 'proposta', name: 'Proposta' },
      { id: 'ganho', name: 'Ganho' }
    ];
    return cols.map(c => ({
      name: c.name,
      valor: leads.filter(l => l.columnId === c.id).reduce((acc, curr) => acc + curr.value, 0)
    }));
  }, [leads]);

  // --- Content Chart Data ---
  const contentData = useMemo(() => {
    return [
      { name: 'Pendente', value: contentItems.filter(c => c.status === 'PENDENTE').length, color: '#3b82f6' },
      { name: 'Revisão', value: contentItems.filter(c => c.status === 'REVISÃO').length, color: '#eab308' },
      { name: 'Aprovado', value: contentItems.filter(c => c.status === 'APROVADO').length, color: '#22c55e' }
    ].filter(d => d.value > 0);
  }, [contentItems]);

  // --- My Day (Meetings + Urgent Tasks) ---
  const todaysMeetings = useMemo(() => {
    return meetings
      .filter(m => toIsoDate(m.date) === today || m.date.toLowerCase() === 'hoje')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [meetings, today]);

  // --- Top Leads ---
  const topLeads = useMemo(() => {
    return leads
      .filter(l => l.columnId !== 'ganho' && l.columnId !== 'perdido')
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [leads]);

  // --- Lead Sources ---
  const leadSourcesData = useMemo(() => {
    const sources: Record<string, number> = {};
    leads.forEach(l => {
      const s = l.source || 'Sem Origem';
      sources[s] = (sources[s] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [leads]);
  const SOURCE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="p-8 h-full overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#0a0a0a] to-[#111] text-white flex-1"
    >
      <div className="max-w-[95vw] w-full mx-auto space-y-[clamp(1.5rem,3vh,3rem)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
               <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                 <LayoutDashboard className="w-5 h-5 text-white" />
               </span>
               Dashboard
             </h1>
             <p className="text-gray-400 text-sm">Resumo executivo do dia. Tudo o que você precisa no mesmo lugar.</p>
          </div>
          <div className="text-right">
             <div className="text-xl font-bold text-gray-200">
               {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
             </div>
             <div className="text-sm font-medium text-orange-500 flex items-center justify-end gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5" /> Foco e Produtividade
             </div>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <motion.div whileHover={{ y: -4 }} className="bg-[#141414] border border-[#222] rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/10 cursor-pointer" onClick={() => onNavigate('crm')}>
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-blue-500/20" />
             <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                   <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Pipeline Ativo</span>
             </div>
             <h3 className="text-2xl font-black tracking-tight mb-1 group-hover:text-blue-400 transition-colors">
               R$ {pipelineValue.toLocaleString('pt-BR')}
             </h3>
             <p className="text-xs text-gray-500 font-medium">No funil de vendas (Aberto)</p>
           </motion.div>

           <motion.div whileHover={{ y: -4 }} className="bg-[#141414] border border-[#222] rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/30 transition-all shadow-lg hover:shadow-green-500/10 cursor-pointer" onClick={() => onNavigate('financeiro')}>
             <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-green-500/20" />
             <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 group-hover:scale-110 transition-transform">
                   <DollarSign className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${profit >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>Margem</span>
             </div>
             <motion.h3 
               key={profit}
               initial={{ scale: 1.1, color: '#22c55e' }}
               animate={{ scale: 1, color: profit < 0 ? '#f87171' : '#ffffff' }}
               transition={{ duration: 0.5 }}
               className={`text-2xl font-black tracking-tight mb-1 group-hover:text-green-400 transition-colors`}
             >
               R$ {profit.toLocaleString('pt-BR')}
             </motion.h3>
             <p className="text-xs text-gray-500 font-medium">Lucro Líquido (Receitas - Despesas)</p>
           </motion.div>

           <motion.div whileHover={{ y: -4 }} className="bg-[#141414] border border-[#222] rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all shadow-lg hover:shadow-yellow-500/10 cursor-pointer" onClick={() => onNavigate('aprovacao')}>
             <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-yellow-500/20" />
             <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                   <CheckSquare className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">Aprovações</span>
             </div>
             <h3 className="text-2xl font-black tracking-tight mb-1 group-hover:text-yellow-400 transition-colors">
               {pendingContents.length} Itens
             </h3>
             <p className="text-xs text-gray-500 font-medium">{pendingContents.length === 1 ? 'Aguardando validação' : 'Aguardando validação'}</p>
           </motion.div>

           <motion.div whileHover={{ y: -4 }} className="bg-[#141414] border border-[#222] rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-lg hover:shadow-purple-500/10 cursor-pointer" onClick={() => onNavigate('gestor')}>
             <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:bg-purple-500/20" />
             <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                   <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Tarefas Ativas</span>
             </div>
             <h3 className="text-2xl font-black tracking-tight mb-1 group-hover:text-purple-400 transition-colors">
               {pendingTasks.length} Projetos
             </h3>
             <p className="text-xs text-gray-500 font-medium">Em andamento na agência</p>
           </motion.div>
        </div>

         {/* Main Content Grid 1: Operations */}
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[40vh]">
            
            {/* Section: Meu Dia (Meetings) */}
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 flex flex-col shadow-xl">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                     <Calendar className="w-5 h-5 text-orange-500" /> Meu Dia
                  </h3>
                  <button onClick={() => onNavigate('agendamento')} className="text-xs bg-[#222] hover:bg-[#333] px-2.5 py-1 rounded text-gray-300 font-medium transition-colors">Ver Agenda</button>
               </div>
               
               <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 min-h-[250px]">
                  {todaysMeetings.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center py-10">
                        <div className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-3">
                           <Calendar className="w-6 h-6 opacity-40" />
                        </div>
                        <p className="text-sm">Dia livre. Nenhuma reunião para hoje.</p>
                     </div>
                  ) : (
                     todaysMeetings.map(m => (
                        <div key={m.id} className="relative bg-[#1a1a1a] border border-[#333] rounded-xl p-4 hover:border-orange-500/50 transition-colors group">
                           <div className="absolute left-0 top-3 bottom-3 w-1 bg-orange-500 rounded-r-full" />
                           <div className="pl-2">
                              <div className="font-semibold text-sm mb-2 group-hover:text-orange-400 transition-colors">{m.title}</div>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                 <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{m.time}</span>
                                 {m.platform && <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded text-blue-400"><Video className="w-3.5 h-3.5" />{m.platform}</span>}
                              </div>
                              {m.client && <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {m.client}</div>}
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* Section: Status Conteúdos */}
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 flex flex-col shadow-xl">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                     <CheckSquare className="w-5 h-5 text-yellow-500" /> Review de Conteúdos
                  </h3>
                  <button onClick={() => onNavigate('aprovacao')} className="text-xs bg-[#222] hover:bg-[#333] px-2.5 py-1 rounded text-gray-300 font-medium transition-colors">Aprovações</button>
               </div>
               
               <div className="flex-1 flex flex-col justify-center items-center">
                  {contentData.length > 0 ? (
                     <div className="w-full flex items-center justify-between">
                        <div className="h-[200px] w-1/2">
                           <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                               <Pie data={contentData} innerRadius={55} outerRadius={80} dataKey="value" stroke="none" paddingAngle={5}>
                                 {contentData.map((entry, idx) => (
                                   <Cell key={`cell-${idx}`} fill={entry.color} />
                                 ))}
                               </Pie>
                               <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px' }} />
                             </PieChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 space-y-4 pl-4 border-l border-[#222]">
                           {contentData.map(d => (
                              <div key={d.name} className="flex flex-col">
                                 <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5 mb-1">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
                                 </div>
                                 <div className="text-xl font-bold">{d.value} <span className="text-xs font-normal text-gray-500">itens</span></div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <div className="text-center text-gray-500 text-sm">Tudo aprovado e em dia! 🎉</div>
                  )}
               </div>
               
               {pendingContents.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-[#222]">
                      <div className="text-xs text-gray-400 mb-3 font-medium">Últimos Solicitados</div>
                      <div className="space-y-2">
                         {pendingContents.slice(0, 2).map(c => (
                            <div key={c.id} className="bg-[#1a1a1a] rounded flex items-center justify-between px-3 py-2 border border-[#222] hover:border-yellow-500/30 transition-colors group cursor-pointer" onClick={() => onNavigate('aprovacao')}>
                               <span className="text-xs font-medium truncate pr-2 group-hover:text-yellow-400">{c.title}</span>
                               <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${
                                  c.status === 'PENDENTE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                               }`}>{c.status}</span>
                            </div>
                         ))}
                      </div>
                   </div>
               )}
            </div>

            {/* Section: Top Deals & Acquisition */}
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 flex flex-col shadow-xl">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                     <TrendingUp className="w-5 h-5 text-blue-500" /> Inteligência de Vendas
                  </h3>
                  <button onClick={() => onNavigate('crm')} className="text-xs bg-[#222] hover:bg-[#333] px-2.5 py-1 rounded text-gray-300 font-medium transition-colors">CRM Completo</button>
               </div>
               
               <div className="flex-1 flex flex-col gap-6">
                 {/* Top Deals List */}
                 <div>
                   <h4 className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-3">Maiores Acordos (Em Aberto)</h4>
                   <div className="space-y-2">
                     {topLeads.map((l, i) => (
                       <div key={l.id} className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-lg border border-[#333] group hover:border-[#444] transition-colors">
                         <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">{i + 1}</div>
                           <div>
                             <div className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{l.title}</div>
                             {l.contactName && <div className="text-xs text-gray-500">{l.contactName}</div>}
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-sm font-bold text-green-400">R$ {l.value.toLocaleString('pt-BR')}</div>
                           <div className="text-[10px] uppercase font-semibold text-gray-500 bg-[#222] px-1.5 rounded">{l.columnId}</div>
                         </div>
                       </div>
                     ))}
                     {topLeads.length === 0 && <div className="text-xs text-gray-500 text-center p-4">Pipeline vazio no momento.</div>}
                   </div>
                 </div>

                 {/* Lead Sources Small Chart */}
                 <div className="pt-4 border-t border-[#333] flex items-center gap-4">
                   <div className="w-20 h-20 flex-shrink-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie data={leadSourcesData} innerRadius={20} outerRadius={35} dataKey="value" stroke="none">
                           {leadSourcesData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', fontSize: '12px' }} />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                   <div className="flex-1">
                     <h4 className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Origem dos Contatos</h4>
                     <div className="space-y-1.5 flex flex-wrap gap-x-4">
                       {leadSourcesData.map((s, idx) => (
                         <div key={s.name} className="flex items-center gap-1.5">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLORS[idx % SOURCE_COLORS.length] }} />
                           <span className="text-xs font-medium text-gray-300">{s.name}</span>
                           <span className="text-xs text-gray-500">({s.value})</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
               </div>
            </div>

         </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
