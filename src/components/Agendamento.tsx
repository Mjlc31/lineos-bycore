import React, { useState, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, Plus, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import useEscapeKey from '../hooks/useEscapeKey';
import { useToast } from './Toast';
import { Meeting } from '../types';
import { Modal } from './ui/Modal';

// ─── Helpers de Data ──────────────────────────────────────────────────────────
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const toDisplayDate = (iso: string) => {
  if (!iso) return '';
  if (iso.includes('/')) return iso;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// ─── Nova Reunião Modal ───────────────────────────────────────────────────────
interface NovaReuniaoModalProps {
  onAdd: (meeting: Omit<Meeting, 'id'>) => void;
  onClose: () => void;
  initialDate?: string;
}

const NovaReuniaoModal = ({ onAdd, onClose, initialDate }: NovaReuniaoModalProps) => {
  const [form, setForm] = useState({
    title: '',
    date: initialDate || formatDate(new Date()),
    time: '14:00',
    duration: '60',
    client: '',
    platform: 'Google Meet'
  });

  useEscapeKey(onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time) return;

    // Calcular hora de término baseado na duração
    const [hours, mins] = form.time.split(':').map(Number);
    const end = new Date(0, 0, 0, hours, mins + parseInt(form.duration));
    const timeStr = `${form.time} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

    const isToday = form.date === formatDate(new Date());

    onAdd({
      title: form.title,
      date: form.date, // armazenando ISO para ordernar melhor depois ou display local
      time: timeStr,
      client: form.client || 'Interno',
      platform: form.platform,
      isToday
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Agendar Reunião" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Título / Assunto</label>
            <input
              type="text"
              required
              autoFocus
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-[#444]"
              placeholder="Ex: Kickoff do Projeto XYZ"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Data</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Início</label>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={e => setForm({ ...form, time: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                 <label className="block text-xs font-medium text-gray-400 mb-1.5">Duração</label>
                 <select
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 hora</option>
                    <option value="90">1.5 horas</option>
                    <option value="120">2 horas</option>
                 </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Convidado / Cliente</label>
              <input
                type="text"
                value={form.client}
                onChange={e => setForm({ ...form, client: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-[#444]"
                placeholder="Ex: TechCorp"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Plataforma</label>
              <div className="relative">
                <Video className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.platform}
                  onChange={e => setForm({ ...form, platform: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors placeholder-[#444]"
                  placeholder="Ex: Google Meet, Zoom"
                />
              </div>
            </div>
          </div>
          <div className="pt-5 flex justify-end gap-3 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Agendamento = () => {
  const { meetings, setMeetings, addMeeting } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();

  const handleAddMeeting = (meeting: Omit<Meeting, 'id'>) => {
    addMeeting(meeting);
    setIsModalOpen(false);
  };

  const handleDelete = useCallback((id: number | string) => {
    const deleted = meetings.find((m) => m.id === id);
    if (!deleted) return;
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    showToast(`"${deleted.title}" cancelada.`, () => {
      setMeetings((prev) => {
        const exists = prev.find((m) => m.id === id);
        if (exists) return prev;
        return [deleted, ...prev].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });
    });
  }, [meetings, setMeetings, showToast]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const todayStr = formatDate(new Date());

  // Organizar reuniões por data ISO ('YYYY-MM-DD') para exibir no grid facilmente
  const meetingsByDate = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    meetings.forEach(m => {
      let isoDate = m.date;
      if (isoDate.toLowerCase() === 'hoje') isoDate = todayStr;
      else if (isoDate.toLowerCase() === 'amanhã') {
        const d = new Date(); d.setDate(d.getDate() + 1);
        isoDate = formatDate(d);
      }
      // Assuming existing items might be DD/MM or DD/MM/YYYY
      if (isoDate.includes('/')) {
        const parts = isoDate.split('/');
        if (parts.length === 2) {
          isoDate = `${currentDate.getFullYear()}-${parts[1]}-${parts[0]}`;
        } else {
          isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      if (!map[isoDate]) map[isoDate] = [];
      map[isoDate].push(m);
    });
    return map;
  }, [meetings, currentDate, todayStr]);

  // Lista lateral mostra selecionados ou próximos 10
  const upcomingMeetings = useMemo(() => {
    if (selectedDateStr && meetingsByDate[selectedDateStr]) {
      return [...meetingsByDate[selectedDateStr]].sort((a, b) => a.time.localeCompare(b.time));
    }
    // Filter future
    return [...meetings]
      .filter(m => {
         let iso = m.date;
         if (iso.toLowerCase() === 'hoje') iso = todayStr;
         if (iso.includes('/')) {
            const p = iso.split('/');
            iso = p.length === 2 ? `${currentDate.getFullYear()}-${p[1]}-${p[0]}` : `${p[2]}-${p[1]}-${p[0]}`;
         }
         return iso >= todayStr;
      })
      .sort((a, b) => {
         let isoA = a.date.includes('/') ? `${a.date.split('/')[2] || currentDate.getFullYear()}-${a.date.split('/')[1]}-${a.date.split('/')[0]}` : a.date;
         let isoB = b.date.includes('/') ? `${b.date.split('/')[2] || currentDate.getFullYear()}-${b.date.split('/')[1]}-${b.date.split('/')[0]}` : b.date;
         if (isoA === 'hoje') isoA = todayStr; if (isoB === 'hoje') isoB = todayStr;
         if (isoA === isoB) return a.time.localeCompare(b.time);
         return isoA.localeCompare(isoB);
      })
      .slice(0, 15);
  }, [meetings, selectedDateStr, meetingsByDate, todayStr, currentDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="p-8 h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden"
    >
      <div className="max-w-[1500px] mx-auto w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold mb-1">Central de Agendamentos</h1>
            <p className="text-gray-400 text-sm">Gerencie reuniões, calls e compromissos importantes de forma centralizada.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)] border border-orange-500/20"
          >
            <CalendarIcon className="w-4 h-4" /> Agendar Nova
          </button>
        </div>

        <div className="flex gap-8 flex-1 overflow-hidden min-h-0">
          {/* Main Calendar View */}
          <div className="flex-1 bg-[#141414] border border-[#222] rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {/* Header Calendário */}
            <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#1a1a1a]/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#222] to-[#111] border border-white/5 flex flex-col items-center justify-center shadow-inner">
                   <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{monthNames[currentDate.getMonth()].substring(0,3)}</div>
                   <div className="text-sm font-semibold">{currentDate.getFullYear()}</div>
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  {monthNames[currentDate.getMonth()]} <span className="text-gray-500 font-normal">{currentDate.getFullYear()}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 p-1 bg-[#0a0a0a] rounded-lg border border-[#222]">
                <button onClick={prevMonth} className="p-2 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors">
                   <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={goToday} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#222] hover:bg-[#333] rounded-md text-white transition-colors">Hoje</button>
                <button onClick={nextMonth} className="p-2 hover:bg-[#222] rounded-md text-gray-400 hover:text-white transition-colors">
                   <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid Days Header */}
            <div className="grid grid-cols-7 border-b border-[#222] bg-[#0a0a0a]/50 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="py-3 text-center">{day}</div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="flex-1 bg-[#222] gap-px grid grid-cols-7 grid-rows-5 overflow-y-auto custom-scrollbar p-px">
               {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - firstDay + 1;
                  const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                  const dateIso = isCurrentMonth ? `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}` : null;
                  const dayMeetings = dateIso ? meetingsByDate[dateIso] || [] : [];
                  const isTodayBox = dateIso === todayStr;
                  const isSelected = dateIso === selectedDateStr;

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (dateIso) {
                            if (selectedDateStr === dateIso) setSelectedDateStr(null);
                            else setSelectedDateStr(dateIso);
                        }
                      }}
                      className={`min-h-[100px] p-2 flex flex-col transition-colors cursor-pointer group ${
                        !isCurrentMonth ? 'bg-[#0a0a0a]/50' :
                        isSelected ? 'bg-orange-500/10 ring-1 ring-inset ring-orange-500' :
                        'bg-[#0a0a0a] hover:bg-[#111]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                           isTodayBox ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' :
                           !isCurrentMonth ? 'text-gray-700' :
                           isSelected ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-200'
                        }`}>
                          {isCurrentMonth ? dayNum : ''}
                        </span>
                        {isCurrentMonth && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                         {dayMeetings.map(m => (
                            <div key={m.id} className="bg-[#1a1a1a] border border-[#333] px-2 py-1.5 rounded-md flex flex-col gap-0.5 group/item hover:border-orange-500/50 transition-colors">
                               <div className="flex items-center justify-between">
                                  <div className="text-[10px] font-bold text-orange-400">{m.time.split('-')[0].trim()}</div>
                               </div>
                               <div className="text-xs text-gray-300 truncate font-medium group-hover/item:text-white transition-colors" title={m.title}>{m.title}</div>
                            </div>
                         ))}
                      </div>
                    </div>
                  );
               })}
            </div>
          </div>

          {/* Sidebar Compromissos */}
          <div className="w-[380px] bg-[#141414] border border-[#222] rounded-2xl flex flex-col shadow-xl overflow-hidden flex-shrink-0">
            <div className="p-6 border-b border-[#222] bg-gradient-to-b from-[#1a1a1a] to-[#141414]">
               <h3 className="font-bold text-lg text-white mb-1">
                 {selectedDateStr ? `Eventos em ${toDisplayDate(selectedDateStr)}` : 'Próximos Compromissos'}
               </h3>
               <p className="text-xs text-gray-500">
                 {upcomingMeetings.length} {upcomingMeetings.length === 1 ? 'reunião agendada' : 'reuniões agendadas'}
               </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {upcomingMeetings.length === 0 ? (
                   <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="pt-10 text-center flex flex-col items-center gap-3 opacity-50">
                      <CalendarIcon className="w-10 h-10 text-gray-600" />
                      <p className="text-sm font-medium">Livre! Nenhum compromisso.</p>
                   </motion.div>
                ) : (
                  upcomingMeetings.map((meeting) => (
                    <motion.div
                      key={meeting.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, x: 20 }}
                      className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 hover:border-orange-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-orange-500/5 relative"
                    >
                      {/* Borda decorativa lateral */}
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-orange-500/20 group-hover:bg-orange-500 rounded-r-full transition-colors" />

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(meeting.id); }}
                        className="absolute top-4 right-4 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Cancelar Reunião"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-start justify-between mb-3 pl-2 pr-6">
                        <h4 className="font-semibold text-sm group-hover:text-orange-400 transition-colors leading-tight">{meeting.title}</h4>
                      </div>

                      <div className="space-y-2.5 text-xs text-gray-400 pl-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[#222] flex items-center justify-center flex-shrink-0 text-gray-300">
                             <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-gray-300">
                             {!selectedDateStr && <span className="mr-1">{toDisplayDate(meeting.date)} •</span>}
                             {meeting.time}
                          </span>
                        </div>
                        {meeting.client && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                              <Users className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate flex-1">{meeting.client}</span>
                          </div>
                        )}
                        {meeting.platform && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-400">
                              <Video className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate flex-1">{meeting.platform}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && <NovaReuniaoModal onAdd={handleAddMeeting} onClose={() => setIsModalOpen(false)} initialDate={selectedDateStr || undefined} />}
      </AnimatePresence>
      <ToastContainer />
    </motion.div>
  );
};

export default Agendamento;
