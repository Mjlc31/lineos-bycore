import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Task, Lead, Transaction, ContentItem, Meeting 
} from '../types';
import { 
  tasks as initialTasks, 
  crmLeads as initialLeads, 
  transactions as initialTransactions, 
  initialContent, 
  initialMeetings 
} from '../data';

interface AppContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  contentItems: ContentItem[];
  setContentItems: React.Dispatch<React.SetStateAction<ContentItem[]>>;
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  
  // Actions
  updateLeadStatus: (leadId: string, newColumnId: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addLead: (lead: Omit<Lead, 'id'>) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  addContentItem: (item: Omit<ContentItem, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or fallback to data.ts
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('line_os_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('line_os_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('line_os_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    const saved = localStorage.getItem('line_os_content');
    return saved ? JSON.parse(saved) : initialContent;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('line_os_meetings');
    return saved ? JSON.parse(saved) : initialMeetings;
  });

  // Persistence
  useEffect(() => localStorage.setItem('line_os_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('line_os_leads', JSON.stringify(leads)), [leads]);
  useEffect(() => localStorage.setItem('line_os_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('line_os_content', JSON.stringify(contentItems)), [contentItems]);
  useEffect(() => localStorage.setItem('line_os_meetings', JSON.stringify(meetings)), [meetings]);

  // Integrated Actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Date.now() };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateLeadStatus = (leadId: string, newColumnId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Trigger para Financeiro se virar "Ganho"
    if (newColumnId === 'ganho' && lead.columnId !== 'ganho') {
      addTransaction({
        title: `Venda: ${lead.title}`,
        category: 'Vendas CRM',
        date: new Date().toLocaleDateString('pt-BR'),
        amount: lead.value,
        type: 'income'
      });
    }

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, columnId: newColumnId } : l));
  };

  const addLead = (lead: Omit<Lead, 'id'>) => {
    const newLead = { ...lead, id: `lead-${Date.now()}` };
    setLeads(prev => [newLead, ...prev]);
  };

  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting = { ...meeting, id: `meet-${Date.now()}` };
    setMeetings(prev => [...prev, newMeeting]);
  };

  const addContentItem = (item: Omit<ContentItem, 'id'>) => {
    const newItem = { ...item, id: `content-${Date.now()}` };
    setContentItems(prev => [newItem, ...prev]);
  };

  return (
    <AppContext.Provider value={{ 
      tasks, setTasks, 
      leads, setLeads, 
      transactions, setTransactions, 
      contentItems, setContentItems,
      meetings, setMeetings,
      updateLeadStatus,
      addTransaction,
      addLead,
      addMeeting,
      addContentItem
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
