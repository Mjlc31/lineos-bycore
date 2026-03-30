import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

const Agendamento = () => {
  const { meetings, setMeetings } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', time: '', client: '', platform: '' });

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) return;
    
    setMeetings(prev => [
      { ...newMeeting, id: Date.now(), isToday: newMeeting.date.toLowerCase() === 'hoje' },
      ...prev
    ]);
    setIsModalOpen(false);
    setNewMeeting({ title: '', date: '', time: '', client: '', platform: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 h-full overflow-auto bg-[#0a0a0a] text-white"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Agendamento</h1>
            <p className="text-gray-400 text-sm">Organize suas reuniões com clientes e equipe.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            <CalendarIcon className="w-4 h-4" /> Nova Reunião
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Calendário (Placeholder) */}
          <div className="col-span-2 bg-[#141414] border border-[#222] rounded-xl p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Novembro 2023
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-[#222] rounded text-gray-400 hover:text-white transition-colors">&lt;</button>
                <button className="px-3 py-1.5 text-sm font-medium bg-[#222] rounded text-white">Hoje</button>
                <button className="p-1.5 hover:bg-[#222] rounded text-gray-400 hover:text-white transition-colors">&gt;</button>
              </div>
            </div>
            <div className="flex-1 border border-[#222] rounded-lg bg-[#0a0a0a] flex items-center justify-center text-gray-500 relative overflow-hidden">
              {/* Simple Calendar Grid Simulation */}
              <div className="absolute inset-0 grid grid-cols-7 grid-rows-5 gap-px bg-[#222] p-px">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="bg-[#0a0a0a] p-2 hover:bg-[#111] transition-colors cursor-pointer flex flex-col">
                    <span className="text-xs text-gray-600">{i + 1 <= 30 ? i + 1 : ''}</span>
                    {i === 14 && <div className="mt-1 bg-red-600/20 border border-red-600/50 text-red-500 text-[10px] px-1 rounded truncate">Apresentação Q3</div>}
                    {i === 15 && <div className="mt-1 bg-blue-600/20 border border-blue-600/50 text-blue-500 text-[10px] px-1 rounded truncate">Alinhamento</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Próximas Reuniões */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[600px]">
            <h3 className="font-semibold mb-2 sticky top-0 bg-[#141414] pb-2 z-10">Próximos Compromissos</h3>
            
            <AnimatePresence>
              {meetings.map((meeting) => (
                <motion.div 
                  key={meeting.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-red-500/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm group-hover:text-red-400 transition-colors">{meeting.title}</h4>
                    {meeting.isToday && <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20">HOJE</span>}
                  </div>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> {meeting.date}, {meeting.time}
                    </div>
                    {meeting.client && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Cliente: {meeting.client}
                      </div>
                    )}
                    {meeting.platform && (
                      <div className="flex items-center gap-2 text-blue-400">
                        <Video className="w-3.5 h-3.5" /> {meeting.platform}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Nova Reunião Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-[#333] rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#333]">
                <h3 className="font-semibold">Nova Reunião</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddMeeting} className="p-4 space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Título</label>
                  <input 
                    type="text" 
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Ex: Reunião de Kickoff"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Data</label>
                    <input 
                      type="text" 
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="Ex: Hoje, Amanhã, 20/11"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Horário</label>
                    <input 
                      type="text" 
                      value={newMeeting.time}
                      onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="Ex: 14:00 - 15:00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cliente / Participantes</label>
                  <input 
                    type="text" 
                    value={newMeeting.client}
                    onChange={(e) => setNewMeeting({...newMeeting, client: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Ex: TechCorp"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Plataforma</label>
                  <input 
                    type="text" 
                    value={newMeeting.platform}
                    onChange={(e) => setNewMeeting({...newMeeting, platform: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Ex: Google Meet, Zoom"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Agendar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Agendamento;
