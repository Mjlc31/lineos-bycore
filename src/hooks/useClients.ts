/**
 * useClients — Hook especializado para o módulo de Clientes
 */
import { useState, useEffect, useCallback } from 'react';
import {
  fetchClients, createClient as createClientDB,
  updateClient as updateClientDB, deleteClient as deleteClientDB,
  fetchClientStatuses, fetchComments, addComment as addCommentService
} from '../services';
import type { Client, ClientStatus, TaskComment } from '../types';
import { clients as initialClients, clientStatuses as initialClientStatuses } from '../data';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientStatuses, setClientStatuses] = useState<ClientStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Carregamento inicial ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const [clientsData, statusesData] = await Promise.all([
          fetchClients(),
          fetchClientStatuses(),
        ]);
        if (!cancelled) {
          setClients(clientsData.length > 0 ? clientsData : initialClients);
          setClientStatuses(statusesData.length > 0 ? statusesData : initialClientStatuses);
        }
      } catch (err) {
        console.error('[useClients] Erro ao carregar do Supabase:', err);
        if (!cancelled) {
          setClients([]);
          setClientStatuses(initialClientStatuses);
          alert('Erro ao carregar Clientes. Verifique a tabela clients.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

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
      const saved = await addCommentService(clientId, comment);
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
    const comments = await fetchComments(clientId);
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
