/**
 * Meeting Service — Acesso ao Supabase para o módulo Agendamento
 * Refatorado para usar 'scheduled_events' em vez de 'meetings'.
 */
import { supabase } from '../lib/supabase';
import type { Meeting } from '../types';

async function getFallbackEventTypeId(): Promise<string> {
  if (!supabase) return '';
  const { data } = await supabase.from('event_types').select('id').limit(1).single();
  if (data) return data.id;

  // Semear caso não exista
  const { data: inserted } = await supabase
    .from('event_types')
    .insert({
      name: 'Google Meet',
      emoji: '🎥',
      color: 'bg-emerald-500',
      is_default: true,
    })
    .select('id')
    .single();

  return inserted?.id ?? '';
}

function mapRowToMeeting(row: any): Meeting {
  const today = new Date().toISOString().split('T')[0];
  const platformName = row.event_types?.name || 'Google Meet';

  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    client: row.client_name || '',
    platform: platformName,
    isToday: row.date === today,
  };
}

export async function fetchMeetings(): Promise<Meeting[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('scheduled_events')
    .select('*, event_types(name)')
    .order('date', { ascending: true });

  if (error) throw new Error(`[meetingService] fetchMeetings: ${error.message}`);
  return (data ?? []).map(row => mapRowToMeeting(row));
}

export async function createMeeting(meeting: Omit<Meeting, 'id'>): Promise<Meeting> {
  if (!supabase) throw new Error('[meetingService] Supabase não disponível');

  const eventTypeId = await getFallbackEventTypeId();

  const { data, error } = await supabase
    .from('scheduled_events')
    .insert({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      client_name: meeting.client,
      event_type_id: eventTypeId,
    })
    .select('*, event_types(name)')
    .single();

  if (error) throw new Error(`[meetingService] createMeeting: ${error.message}`);
  return mapRowToMeeting(data);
}

export async function updateMeeting(id: number | string, patch: Partial<Meeting>): Promise<void> {
  if (!supabase) return;

  const dbPatch: any = {};
  if (patch.title !== undefined)    dbPatch.title = patch.title;
  if (patch.date !== undefined)     dbPatch.date = patch.date;
  if (patch.time !== undefined)     dbPatch.time = patch.time;
  if (patch.client !== undefined)   dbPatch.client_name = patch.client;

  const { error } = await supabase.from('scheduled_events').update(dbPatch).eq('id', id.toString());
  if (error) throw new Error(`[meetingService] updateMeeting: ${error.message}`);
}

export async function deleteMeeting(id: number | string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('scheduled_events').delete().eq('id', id.toString());
  if (error) throw new Error(`[meetingService] deleteMeeting: ${error.message}`);
}
