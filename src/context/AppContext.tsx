/**
 * AppContext — Slim Orchestrator
 * 
 * Este context NÃO contém lógica de negócio, acesso ao banco ou persistência.
 * Ele apenas delega para os hooks especializados e expõe uma interface unificada
 * compatível com todos os componentes existentes (zero breaking changes).
 * 
 * Arquitetura:
 *   useTasks      → tasks, statuses, automations
 *   useLeads      → leads, crmColumns
 *   useContent    → contentItems
 *   useTransactions → transactions
 *   useClients    → clients, clientStatuses
 *   useMeetings   → meetings
 *   Local state   → watchedVideos (progresso academy — por usuário, sem DB)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Task, Lead, Transaction, ContentItem, Meeting, Client, Status, ClientStatus,
  TaskComment, TaskAttachment, Automation, CrmColumn, LeadActivity, LeadTask, ContentStatus,
  CustomFieldDefinition, TaskSpace, TaskFolder, TaskList, CourseTrack
} from '../types';
import { useTasks } from '../hooks/useTasks';
import { useLeads } from '../hooks/useLeads';
import { useContent } from '../hooks/useContent';
import { useTransactions } from '../hooks/useTransactions';
import { useClients } from '../hooks/useClients';
import { useMeetings } from '../hooks/useMeetings';
import { useAcademy } from '../hooks/useAcademy';
import { useAuth } from './AuthContext';
import { useRh } from '../hooks/useRh';
import { RhProfile } from '../services/rhService';

// ─── Usuários mock do sistema (removidos em favor do DB) ────────────────────
// Removido export SYSTEM_USERS daqui. Usar `systemUsers` do context!
import { useSystemUsers, SystemUser } from '../hooks/useSystemUsers';

// ─── Interface pública (100% compatível com versão anterior) ──────────────────
interface AppContextType {
  // State
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  contentItems: ContentItem[];
  setContentItems: React.Dispatch<React.SetStateAction<ContentItem[]>>;
  addContentItem: (item: Omit<ContentItem, 'id'>) => void;
  updateContentItem: (id: number, updates: Partial<Omit<ContentItem, 'id'>>) => void;
  updateContentStatus: (id: number, status: ContentStatus, feedback?: string | null) => void;
  deleteContentItem: (id: number) => void;
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  watchedVideos: string[];
  setWatchedVideos: React.Dispatch<React.SetStateAction<string[]>>;
  academyTracks: CourseTrack[];
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  taskStatuses: Status[];
  setTaskStatuses: React.Dispatch<React.SetStateAction<Status[]>>;
  clientStatuses: ClientStatus[];
  setClientStatuses: React.Dispatch<React.SetStateAction<ClientStatus[]>>;
  crmColumns: CrmColumn[];
  automations: Automation[];
  setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
  customFieldDefinitions: CustomFieldDefinition[];
  setCustomFieldDefinitions: React.Dispatch<React.SetStateAction<CustomFieldDefinition[]>>;

  // Loading states
  isTasksLoading: boolean;
  isLeadsLoading: boolean;

  // Task Actions
  addTask: (task: Omit<Task, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addComment: (taskId: string, content: string) => void;
  addAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id' | 'uploadedAt'>) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;

  // Status & Custom Fields Actions
  addTaskStatus: (status: Omit<Status, 'id'>) => void;
  addCustomFieldDefinition: (def: Omit<CustomFieldDefinition, 'id'>) => Promise<void>;
  updateCustomFieldDefinition: (id: string, updates: Partial<CustomFieldDefinition>) => Promise<void>;
  deleteCustomFieldDefinition: (id: string) => Promise<void>;

  // Hierarchy
  spaces: TaskSpace[];
  folders: TaskFolder[];
  lists: TaskList[];
  addSpace: (space: Omit<TaskSpace, 'id'>) => Promise<void>;
  removeSpace: (id: string) => Promise<void>;
  addFolder: (folder: Omit<TaskFolder, 'id'>) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  addList: (list: Omit<TaskList, 'id'>) => Promise<void>;
  removeList: (id: string) => Promise<void>;

  // Client Actions
  addClient: (client: Omit<Client, 'id'>) => void;
  deleteClient: (clientId: string) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  addClientComment: (clientId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => void;
  loadClientComments: (clientId: string) => Promise<void>;

  // CRM Column Actions
  addCrmColumn: (col: Omit<CrmColumn, 'id'>) => void;
  updateCrmColumn: (colId: string, updates: Partial<CrmColumn>) => void;
  removeCrmColumn: (colId: string) => void;

  // Lead Actions
  updateLeadStatus: (leadId: string, newColumnId: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addLead: (lead: Omit<Lead, 'id'>) => void;
  deleteLead: (leadId: string) => void;
  updateLeadDetails: (leadId: string, updates: Partial<Lead>) => void;
  addLeadActivity: (leadId: string, activity: Omit<LeadActivity, 'id'>) => void;
  addLeadTask: (leadId: string, task: Omit<LeadTask, 'id' | 'leadId' | 'createdAt'>) => void;
  toggleLeadTask: (leadId: string, taskId: string) => void;

  // Others
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  toggleVideoWatched: (videoId: string) => void;
  
  // System Users
  systemUsers: SystemUser[];
  isSystemUsersLoading: boolean;

  // RH / Equipe
  rhTeam: RhProfile[];
  isRhLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  // ─── Hooks especializados ─────────────────────────────────────────────────
  const tasksHook = useTasks(profile?.fullName, profile?.avatarUrl ?? undefined);
  const leadsHook = useLeads();
  const contentHook = useContent();
  const transactionsHook = useTransactions();
  const clientsHook = useClients();
  const meetingsHook = useMeetings();
  const systemUsersHook = useSystemUsers();
  const rhHook = useRh();
  const academyHook = useAcademy(profile?.id);

  // ─── Wrapper para updateLeadStatus (precisa das crmColumns) ──────────────
  const updateLeadStatus = useCallback((leadId: string, newColumnId: string) => {
    leadsHook.updateLeadStatus(leadId, newColumnId, leadsHook.crmColumns);
  }, [leadsHook]);

  // ─── Wrapper para addLeadTask (adapta interface) ──────────────────────────
  const addLeadTask = useCallback((leadId: string, task: Omit<LeadTask, 'id' | 'leadId' | 'createdAt'>) => {
    leadsHook.addLeadTask(leadId, {
      title: task.title,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
    });
  }, [leadsHook]);

  // ─── Automação Pós-Aprovação ──────────────────────────────────────────────
  const updateContentStatusWithTask = useCallback((id: number, status: ContentStatus, feedback?: string | null) => {
    contentHook.updateContentStatus(id, status, feedback);
    
    // Sincronizar com tarefa
    const item = contentHook.contentItems.find(c => c.id === id);
    if (item && item.linkedTaskId) {
      // Map de status de Aprovação -> Status da Tarefa
      const statusMap: Record<ContentStatus, string> = {
        APROVADO: 's5', // CONCLUÍDO
        ALTERAÇÃO: 's3', // EM APROVAÇÃO COM CLIENTE (ou REVISÃO se preferir, manteremos em s3)
        REVISÃO: 's2', // REVISÃO INTERNA
        PENDENTE: 's4', // PRONTO PARA POSTAR
      };
      const newStatus = statusMap[status];
      if (newStatus) {
        tasksHook.updateTask(item.linkedTaskId, { statusId: newStatus });
      }
    }
  }, [contentHook, tasksHook]);

  return (
    <AppContext.Provider value={{
      // Tasks
      tasks: tasksHook.tasks,
      setTasks: tasksHook.setTasks,
      taskStatuses: tasksHook.taskStatuses,
      setTaskStatuses: tasksHook.setTaskStatuses,
      automations: tasksHook.automations,
      setAutomations: tasksHook.setAutomations,
      customFieldDefinitions: tasksHook.customFieldDefinitions,
      setCustomFieldDefinitions: tasksHook.setCustomFieldDefinitions,
      isTasksLoading: tasksHook.isLoading,

      // Leads + CRM
      leads: leadsHook.leads,
      setLeads: leadsHook.setLeads,
      crmColumns: leadsHook.crmColumns,
      isLeadsLoading: leadsHook.isLoading,

      // Content
      contentItems: contentHook.contentItems,
      setContentItems: contentHook.setContentItems,
      addContentItem: contentHook.addContentItem,
      updateContentItem: contentHook.updateContentItem,
      updateContentStatus: updateContentStatusWithTask,
      deleteContentItem: contentHook.deleteContentItem,

      // Transactions
      transactions: transactionsHook.transactions,
      setTransactions: transactionsHook.setTransactions,

      // Clients
      clients: clientsHook.clients,
      setClients: clientsHook.setClients,
      clientStatuses: clientsHook.clientStatuses,
      setClientStatuses: clientsHook.setClientStatuses,

      // Meetings
      meetings: meetingsHook.meetings,
      setMeetings: meetingsHook.setMeetings,

      // Academy
      watchedVideos: academyHook.watchedVideos,
      setWatchedVideos: academyHook.setWatchedVideos,
      academyTracks: academyHook.academyTracks,

      // Task Actions
      addTask: tasksHook.addTask,
      deleteTask: tasksHook.deleteTask,
      updateTask: tasksHook.updateTask,
      addComment: tasksHook.addComment,
      addAttachment: tasksHook.addAttachment,
      removeAttachment: tasksHook.removeAttachment,
      addTaskStatus: tasksHook.addTaskStatus,
      addCustomFieldDefinition: tasksHook.addCustomFieldDefinition,
      updateCustomFieldDefinition: tasksHook.updateCustomFieldDefinition,
      deleteCustomFieldDefinition: tasksHook.deleteCustomFieldDefinition,

      // Hierarchy
      spaces: tasksHook.spaces,
      folders: tasksHook.folders,
      lists: tasksHook.lists,
      addSpace: tasksHook.addSpace,
      removeSpace: tasksHook.removeSpace,
      addFolder: tasksHook.addFolder,
      removeFolder: tasksHook.removeFolder,
      addList: tasksHook.addList,
      removeList: tasksHook.removeList,

      // Client Actions
      addClient: clientsHook.addClient,
      deleteClient: clientsHook.deleteClient,
      updateClient: clientsHook.updateClient,
      addClientComment: clientsHook.addClientComment,
      loadClientComments: clientsHook.loadClientComments,

      // CRM Column Actions
      addCrmColumn: leadsHook.addCrmColumn,
      updateCrmColumn: leadsHook.updateCrmColumn,
      removeCrmColumn: leadsHook.removeCrmColumn,

      // Lead Actions
      updateLeadStatus,
      addTransaction: transactionsHook.addTransaction,
      addLead: leadsHook.addLead,
      deleteLead: leadsHook.deleteLead,
      updateLeadDetails: leadsHook.updateLeadDetails,
      addLeadActivity: leadsHook.addLeadActivity,
      addLeadTask,
      toggleLeadTask: leadsHook.toggleLeadTask,

      // Others
      addMeeting: meetingsHook.addMeeting,
      toggleVideoWatched: academyHook.toggleVideoWatched,

      // System Users
      systemUsers: systemUsersHook.systemUsers,
      isSystemUsersLoading: systemUsersHook.isLoading,

      // RH / Equipe
      rhTeam: rhHook.team,
      isRhLoading: rhHook.isLoading,

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
