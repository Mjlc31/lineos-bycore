/**
 * useContent — Hook especializado para o módulo Aprovação de Conteúdo
 */
import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import {
  fetchContentItems, createContentItem as createContentDB,
  updateContentItem, deleteContentItem,
} from '../services';
import type { ContentItem, ContentStatus } from '../types';
import { initialContent } from '../data';

export function useContent() {
  const queryClient = useQueryClient();

  const { data: contentItems = [], isLoading } = useQuery({
    queryKey: ['contentItems'],
    queryFn: fetchContentItems,
  });

  const setContentItems = useCallback((updater: any) => {
    queryClient.setQueryData(['contentItems'], (prev: any) => {
      const current = prev || [];
      return typeof updater === 'function' ? updater(current) : updater;
    });
  }, [queryClient]);

  // ─── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('content_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, () => {
        fetchContentItems().then(data => {
          setContentItems(data);
        }).catch(console.error);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const addContentItem = useCallback(async (item: Omit<ContentItem, 'id'>) => {
    const tempId = Date.now();
    const optimistic = { ...item, id: tempId };
    setContentItems(prev => [optimistic, ...prev]);

    try {
      const saved = await createContentDB(item);
      // Preserva o fileUrl original do upload local caso o banco não retorne ainda (blob:)
      setContentItems(prev => prev.map(i => i.id === tempId ? { ...saved, fileUrl: saved.fileUrl || item.fileUrl } : i));
    } catch (err) {
      console.error('[useContent] addContentItem falhou, revertendo otimista:', err);
      setContentItems(prev => prev.filter(i => i.id !== tempId));
    }
  }, []);

  const editContentItem = useCallback(async (id: number, updates: Partial<Omit<ContentItem, 'id'>>) => {
    setContentItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    try {
      await updateContentItem(id, updates);
    } catch (err) {
      console.error('[useContent] editContentItem falhou:', err);
    }
  }, []);

  const updateStatus = useCallback(async (id: number, status: ContentStatus, feedback?: string | null) => {
    setContentItems(prev => prev.map(i =>
      i.id === id ? { ...i, status, ...(feedback !== undefined ? { feedback } : {}) } : i
    ));
    try {
      await updateContentItem(id, { status, ...(feedback !== undefined ? { feedback } : {}) });
    } catch (err) {
      console.error('[useContent] updateStatus falhou:', err);
    }
  }, []);

  const removeContentItem = useCallback(async (id: number) => {
    setContentItems(prev => prev.filter(i => i.id !== id));
    try {
      await deleteContentItem(id);
    } catch (err) {
      console.error('[useContent] removeContentItem falhou:', err);
    }
  }, []);

  return {
    contentItems, setContentItems,
    isLoading,
    addContentItem,
    updateContentItem: editContentItem,
    updateContentStatus: updateStatus,
    deleteContentItem: removeContentItem,
  };
}
