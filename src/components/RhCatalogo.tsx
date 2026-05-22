import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Briefcase, DollarSign, Wallet, Phone, Mail, Plus, X, UserCog } from 'lucide-react';
import { useToast } from './Toast';

type TeamMember = {
  id: string;
  name: string;
  role: string;
  type: 'CLT' | 'PJ' | 'Freelancer' | 'Sócio';
  costPerHour: number;
  costPerDay: number;
  phone: string;
  email: string;
  pix: string;
  skills: string[];
  avatar: string;
};

const initialTeam: TeamMember[] = [
  {
    id: '1', name: 'Arthur de Moraes', role: 'Diretor Criativo', type: 'Sócio',
    costPerHour: 150, costPerDay: 1200, phone: '+55 11 99999-9999', email: 'arthur@lineos.com', pix: '000.000.000-00', skills: ['Direção', 'Estratégia'], avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: '2', name: 'Juliana Costa', role: 'Videomaker / Edição', type: 'Freelancer',
    costPerHour: 60, costPerDay: 500, phone: '+55 11 98888-8888', email: 'ju.video@gmail.com', pix: 'ju.video@gmail.com', skills: ['Captação', 'Premiere', 'After Effects'], avatar: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: '3', name: 'Carlos Mendes', role: 'Copywriter', type: 'PJ',
    costPerHour: 45, costPerDay: 350, phone: '+55 11 97777-7777', email: 'carlos.copy@gmail.com', pix: '11977777777', skills: ['Copywriting', 'SEO'], avatar: 'https://i.pravatar.cc/150?u=3'
  }
];

const RhCatalogo = () => {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const filteredTeam = team.filter(m => {
    const passType = filterType === 'TODOS' || m.type === filterType;
    const passSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase());
    return passType && passSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 lg:p-8 h-full flex flex-col text-white overflow-y-auto custom-scrollbar"
      style={{ background: 'var(--surface-0)' }}
    >
      <div className="max-w-[1400px] mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Equipe & RH</h1>
            <p className="text-zinc-500 text-[13px]">Catálogo de colaboradores, freelancers e tabelas de custos.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou cargo..."
                className="w-full bg-[#141414] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-[#141414] border border-white/5 text-gray-300 text-sm rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="TODOS">Todos</option>
              <option value="Sócio">Sócios</option>
              <option value="CLT">CLT</option>
              <option value="PJ">PJ</option>
              <option value="Freelancer">Freelancers</option>
            </select>
            <button
              onClick={() => { setShowAddModal(true); showToast('Formulário em desenvolvimento...'); setShowAddModal(false); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[13px] font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="bg-[#111] border border-[#222] rounded-2xl p-5 flex items-center justify-between group hover:border-[#333] transition-colors">
              <div>
                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Total de Colaboradores</p>
                 <div className="text-2xl font-bold">{team.length}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                 <Users className="w-6 h-6" />
              </div>
           </div>
           <div className="bg-[#111] border border-[#222] rounded-2xl p-5 flex items-center justify-between group hover:border-[#333] transition-colors">
              <div>
                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Custo Médio / Diária (Free)</p>
                 <div className="text-2xl font-bold">R$ {Math.round(team.filter(t => t.type === 'Freelancer').reduce((a,b) => a + b.costPerDay, 0) / (team.filter(t => t.type === 'Freelancer').length || 1))}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <DollarSign className="w-6 h-6" />
              </div>
           </div>
           <div className="bg-[#111] border border-[#222] rounded-2xl p-5 flex items-center justify-between group hover:border-[#333] transition-colors">
              <div>
                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Base Ativa</p>
                 <div className="text-2xl font-bold">{team.filter(t => t.type !== 'Sócio').length} Prestadores</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                 <Briefcase className="w-6 h-6" />
              </div>
           </div>
        </div>

        {/* Grid de Colaboradores */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTeam.map(member => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col group hover:border-[#444] transition-all hover:shadow-2xl hover:shadow-black/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#333]" />
                    <div>
                      <h3 className="font-bold text-white text-lg">{member.name}</h3>
                      <p className="text-sm text-gray-400">{member.role}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                    member.type === 'Freelancer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    member.type === 'PJ' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    member.type === 'CLT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}>
                    {member.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-[#1a1a1a] rounded-xl border border-white/5">
                  <div>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-0.5">Custo Hora</p>
                     <p className="font-medium text-gray-200">R$ {member.costPerHour}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-0.5">Diária (8h)</p>
                     <p className="font-medium text-gray-200">R$ {member.costPerDay}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="w-4 h-4" /> <span className="truncate">{member.phone}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Mail className="w-4 h-4" /> <span className="truncate">{member.email}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Wallet className="w-4 h-4" /> <span className="truncate font-mono text-xs mt-0.5">{member.pix}</span>
                   </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                   {member.skills.map(s => (
                      <span key={s} className="bg-white/5 border border-white/10 text-[10px] font-medium text-gray-300 px-2 py-1 rounded whitespace-nowrap">
                         {s}
                      </span>
                   ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {filteredTeam.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
             <UserCog className="w-12 h-12 mb-4 opacity-40" />
             <p>Nenhum colaborador encontrado.</p>
          </div>
        )}
      </div>
      <ToastContainer />
    </motion.div>
  );
};

export default RhCatalogo;
