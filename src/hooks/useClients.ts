/**
 * useClients — Hook especializado para o módulo de Clientes
 */
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchClients, createClient as createClientDB,
  updateClient as updateClientDB, deleteClient as deleteClientDB,
  fetchClientStatuses, fetchClientComments, addClientComment as addClientCommentService
} from '../services';
import type { Client, ClientStatus, TaskComment } from '../types';
import { clients as initialClients, clientStatuses as initialClientStatuses } from '../data';

export function useClients() {
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { data: clientStatuses = initialClientStatuses, isLoading: isStatusesLoading } = useQuery({
    queryKey: ['clientStatuses'],
    queryFn: async () => {
      const statuses = await fetchClientStatuses();
      return statuses.length > 0 ? statuses : initialClientStatuses;
    },
  });

  const isLoading = isClientsLoading || isStatusesLoading;

  const setClients = useCallback((updater: any) => {
    queryClient.setQueryData(['clients'], (prev: any) => {
      const current = prev || [];
      return typeof updater === 'function' ? updater(current) : updater;
    });
  }, [queryClient]);

  const setClientStatuses = useCallback((updater: any) => {
    queryClient.setQueryData(['clientStatuses'], (prev: any) => {
      const current = prev || [];
      return typeof updater === 'function' ? updater(current) : updater;
    });
  }, [queryClient]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const addClient = useCallback(async (client: Omit<Client, 'id'>) => {
    const tempId = `client-${Date.now()}`;
    const optimistic: Client = { ...client, id: tempId };
    setClients(prev => [...prev, optimistic]);

    try {
      const saved = await createClientDB(client);
      setClients(prev => prev.map(c => c.id === tempId ? saved : c));
    } catch (err) {
      console.error('[useClients] addClient falhou:', err);
    }
  }, []);

  const editClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
    try {
      await updateClientDB(clientId, updates);
    } catch (err) {
      console.error('[useClients] editClient falhou:', err);
    }
  }, []);

  const removeClient = useCallback(async (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    try {
      await deleteClientDB(clientId);
    } catch (err) {
      console.error('[useClients] removeClient falhou:', err);
    }
  }, []);

  const addClientComment = useCallback(async (clientId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => {
    // Optimistic update
    const optimisticComment: TaskComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, comments: [...(c.comments || []), optimisticComment] } : c
    ));

    try {
      const saved = await addClientCommentService(clientId, comment);
      setClients(prev => prev.map(c => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          comments: (c.comments || []).map(cm => cm.id === optimisticComment.id ? saved : cm)
        };
      }));
    } catch (err) {
      console.error('[useClients] addClientComment falhou:', err);
    }
  }, []);

  const loadClientComments = useCallback(async (clientId: string) => {
    const comments = await fetchClientComments(clientId);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, comments } : c));
  }, []);

  return {
    clients, setClients,
    clientStatuses, setClientStatuses,
    isLoading,
    addClient,
    updateClient: editClient,
    deleteClient: removeClient,
    addClientComment,
    loadClientComments,
  };
}
