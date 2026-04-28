import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ContentItem } from '../types';

interface ContentCalendarViewProps {
  onContentClick: (content: ContentItem) => void;
}

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const channelColors: Record<string, string> = {
  instagram: 'bg-pink-500',
  tiktok: 'bg-black',
  youtube: 'bg-red-500',
  kwai: 'bg-orange-500',
  linkedin: 'bg-blue-500',
  facebook: 'bg-blue-600',
};

export const ContentCalendarView = ({ onContentClick }: ContentCalendarViewProps) => {
  const { contentItems } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const contentsByDate = useMemo(() => {
    const map: Record<string, ContentItem[]> = {};
    contentItems.forEach(item => {
      if (!item.postDate) return;
      let dateStr = '';
      const dd = item.postDate;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dd)) {
        const [d, m, y] = dd.split('/');
        dateStr = `${y}-${m}-${d}`;
      } else if (/^\d{2}\/\d{2}$/.test(dd)) {
        const [d, m] = dd.split('/');
        dateStr = `${year}-${m}-${d}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dd)) {
        dateStr = dd;
      } else {
        return;
      }
      
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(item);
    });
    return map;
  }, [contentItems, year]);

  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const today = formatDateKey(new Date());

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Calendário de Conteúdo — {MONTHS_PT[month]} {year}
          </h2>
          <button
            onClick={goToday}
            className="text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20"
          >
            Mês Atual
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 shrink-0">
        {DAYS_PT.map(day => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 py-2 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 border-t border-l border-[#222] min-h-0 bg-[#0a0a0a] rounded-b-2xl overflow-hidden">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const dateKey = formatDateKey(date);
          const dayContents = contentsByDate[dateKey] || [];
          const isToday = dateKey === today;

          return (
            <div
              key={idx}
              className={`border-r border-b border-[#222] p-2 flex flex-col relative transition-colors ${
                isCurrentMonth ? 'bg-[#111] hover:bg-[#151515]' : 'bg-[#050505]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : isCurrentMonth
                        ? 'text-gray-300'
                        : 'text-gray-700'
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>

              <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                {dayContents.map(content => (
                  <div
                    key={content.id}
                    onClick={() => onContentClick(content)}
                    className="group cursor-pointer bg-[#1a1a1a] border border-[#333] hover:border-emerald-500/50 p-1.5 rounded-lg transition-all"
                  >
                    <p className="text-[10px] font-bold text-gray-200 truncate mb-1.5 leading-tight group-hover:text-emerald-400">
                      {content.title}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {content.postChannels && content.postChannels.length > 0 ? (
                         content.postChannels.map(ch => (
                           <div 
                             key={ch} 
                             title={ch}
                             className={`w-2 h-2 rounded-full ${channelColors[ch.toLowerCase()] || 'bg-gray-500'}`}
                           />
                         ))
                      ) : (
                         <div className="w-2 h-2 rounded-full bg-gray-700" title="Sem canal" />
                      )}
                      
                      {content.status === 'APROVADO' && (
                         <div className="w-2 h-2 rounded-full bg-emerald-500 ml-auto" title="Aprovado" />
                      )}
                      {content.status === 'REVISÃO' && (
                         <div className="w-2 h-2 rounded-full bg-yellow-500 ml-auto" title="Revisão" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
