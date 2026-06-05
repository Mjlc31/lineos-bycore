/**
 * useMeetings — Hook especializado para o módulo Agendamento
 * Inclui Realtime para sincronização ao vivo das reuniões.
 */
import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import {
  fetchMeetings, createMeeting as createMeetingDB,
  deleteMeeting as deleteMeetingDB,
} from '../services';
import type { Meeting } from '../types';
import { initialMeetings } from '../data';

export function useMeetings() {
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: fetchMeetings,
  });

  const setMeetings = useCallback((updater: any) => {
    queryClient.setQueryData(['meetings'], (prev: any) => {
      const current = prev || [];
      return typeof updater === 'function' ? updater(current) : updater;
    });
  }, [queryClient]);

  // ─── Realtime Subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('scheduled_events_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scheduled_events' }, () => {
        fetchMeetings().then(data => {
          setMeetings(data);
        }).catch(console.error);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const addMeeting = useCallback(async (meeting: Omit<Meeting, 'id'>) => {
    const tempId = Date.now();
    const optimistic: Meeting = { ...meeting, id: tempId };
    setMeetings(prev => [...prev, optimistic]);

    try {
      const saved = await createMeetingDB(meeting);
      setMeetings(prev => prev.map(m => m.id === tempId ? saved : m));
    } catch (err) {
      console.error('[useMeetings] addMeeting falhou:', err);
    }
  }, []);

  const removeMeeting = useCallback(async (id: number | string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    try {
      await deleteMeetingDB(id);
    } catch (err) {
      console.error('[useMeetings] removeMeeting falhou:', err);
    }
  }, []);

  return {
    meetings, setMeetings,
    isLoading,
    addMeeting,
    deleteMeeting: removeMeeting,
  };
}
