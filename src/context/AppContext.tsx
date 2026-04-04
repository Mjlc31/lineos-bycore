import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Task, Lead, Transaction, ContentItem, Meeting, Client, Status, ClientStatus 
} from '../types';
import { 
  tasks as initialTasks, 
  crmLeads as initialLeads, 
  transactions as initialTransactions, 
  initialContent, 
  initialMeetings,
  statuses as initialStatuses,
  clients as initialClients,
  clientStatuses as initialClientStatuses,
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
  watchedVideos: string[];
  setWatchedVideos: React.Dispatch<React.SetStateAction<string[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  taskStatuses: Status[];
  setTaskStatuses: React.Dispatch<React.SetStateAction<Status[]>>;
  clientStatuses: ClientStatus[];
  setClientStatuses: React.Dispatch<React.SetStateAction<ClientStatus[]>>;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  
  // Status Actions
  addTaskStatus: (status: Omit<Status, 'id'>) => void;
  
  // Client Actions
  addClient: (client: Omit<Client, 'id'>) => void;
  deleteClient: (clientId: string) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  
  // Lead Actions
  updateLeadStatus: (leadId: string, newColumnId: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addLead: (lead: Omit<Lead, 'id'>) => void;
  updateLeadDetails: (leadId: string, updates: Partial<Lead>) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  addContentItem: (item: Omit<ContentItem, 'id'>) => void;
  toggleVideoWatched: (videoId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or fallback to data.ts
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('line_os_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('line_os_leads_v2');
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

  const [watchedVideos, setWatchedVideos] = useState<string[]>(() => {
    const saved = localStorage.getItem('line_os_academy_watched');
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('line_os_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [taskStatuses, setTaskStatuses] = useState<Status[]>(() => {
    const saved = localStorage.getItem('line_os_task_statuses');
    return saved ? JSON.parse(saved) : initialStatuses;
  });

  const [clientStatuses, setClientStatuses] = useState<ClientStatus[]>(() => {
    const saved = localStorage.getItem('line_os_client_statuses');
    return saved ? JSON.parse(saved) : initialClientStatuses;
  });

  // Persistence
  useEffect(() => localStorage.setItem('line_os_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('line_os_leads_v2', JSON.stringify(leads)), [leads]);
  useEffect(() => localStorage.setItem('line_os_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('line_os_content', JSON.stringify(contentItems)), [contentItems]);
  useEffect(() => localStorage.setItem('line_os_meetings', JSON.stringify(meetings)), [meetings]);
  useEffect(() => localStorage.setItem('line_os_academy_watched', JSON.stringify(watchedVideos)), [watchedVideos]);
  useEffect(() => localStorage.setItem('line_os_clients', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('line_os_task_statuses', JSON.stringify(taskStatuses)), [taskStatuses]);
  useEffect(() => localStorage.setItem('line_os_client_statuses', JSON.stringify(clientStatuses)), [clientStatuses]);

  // ─── Task Actions ───────────────────────────────────────────────────────────
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: `task-${Date.now()}` } as Task;
    setTasks(prev => [...prev, newTask]);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  // ─── Status Actions ─────────────────────────────────────────────────────────
  const addTaskStatus = (status: Omit<Status, 'id'>) => {
    const newStatus: Status = { ...status, id: `s-${Date.now()}` };
    setTaskStatuses(prev => [...prev, newStatus]);
  };

  // ─── Client Actions ─────────────────────────────────────────────────────────
  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: `client-${Date.now()}` };
    setClients(prev => [...prev, newClient]);
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
  };

  // ─── Integrated CRM Actions ────────────────────────────────────────────────
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Date.now() };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateLeadStatus = (leadId: string, newColumnId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
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

  const updateLeadDetails = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates } : l));
  };

  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting = { ...meeting, id: `meet-${Date.now()}` } as any;
    setMeetings(prev => [...prev, newMeeting]);
  };

  const addContentItem = (item: Omit<ContentItem, 'id'>) => {
    const newItem = { ...item, id: `content-${Date.now()}` } as any;
    setContentItems(prev => [newItem, ...prev]);
  };

  const toggleVideoWatched = (videoId: string) => {
    setWatchedVideos(prev => 
      prev.includes(videoId) ? prev.filter(v => v !== videoId) : [...prev, videoId]
    );
  };

  return (
    <AppContext.Provider value={{ 
      tasks, setTasks, 
      leads, setLeads, 
      transactions, setTransactions, 
      contentItems, setContentItems,
      meetings, setMeetings,
      watchedVideos, setWatchedVideos,
      clients, setClients,
      taskStatuses, setTaskStatuses,
      clientStatuses, setClientStatuses,
      // Task actions
      addTask, deleteTask, updateTask,
      // Status actions
      addTaskStatus,
      // Client actions
      addClient, deleteClient, updateClient,
      // CRM actions
      updateLeadStatus,
      updateLeadDetails,
      addTransaction,
      addLead,
      addMeeting,
      addContentItem,
      toggleVideoWatched
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
