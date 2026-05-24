/**
 * Client Service — Acesso ao Supabase para o módulo de Clientes
 */
import { supabase } from '../lib/supabase';
import type { Client, ClientStatus } from '../types';

function mapRowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    statusId: row.status_id as string,
    assignees: (row.assignees as string[]) ?? [],
    faturamento: row.faturamento as string | undefined,
    segmento: row.segmento as string | undefined,
    repositorio: row.repositorio as string | undefined,
    ultimaReuniao: row.ultima_reuniao as string | undefined,
    priority: (row.priority as Client['priority']) || 'None',
    estimatedTime: Number(row.estimated_time) || 0,
    trackedTime: Number(row.tracked_time) || 0,
    description: row.description as string | undefined,
    tags: (row.tags as unknown as Client['tags']) || [],
    relatedTaskIds: (row.related_tasks as unknown as string[]) || [],
    startDate: row.start_date as string | undefined,
    dueDate: row.due_date as string | undefined,
    activities: (row.activities as unknown as Client['activities']) || [],
  };
}

function mapRowToClientStatus(row: Record<string, unknown>): ClientStatus {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
  };
}

export async function fetchClientStatuses(): Promise<ClientStatus[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('client_statuses')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`[clientService] fetchClientStatuses: ${error.message}`);
  return (data ?? []).map(row => mapRowToClientStatus(row as Record<string, unknown>));
}

export async function fetchClients(): Promise<Client[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`[clientService] fetchClients: ${error.message}`);
  return (data ?? []).map(row => mapRowToClient(row as Record<string, unknown>));
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
  if (!supabase) throw new Error('[clientService] Supabase não disponível');

  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: client.name,
      status_id: client.statusId,
      assignees: client.assignees,
      faturamento: client.faturamento,
      segmento: client.segmento,
      repositorio: client.repositorio,
      ultima_reuniao: client.ultimaReuniao,
      priority: client.priority || 'None',
      estimated_time: client.estimatedTime || 0,
      tracked_time: client.trackedTime || 0,
      description: client.description,
      tags: client.tags || [],
      related_tasks: client.relatedTaskIds || [],
      start_date: client.startDate,
      due_date: client.dueDate,
      activities: client.activities || [],
    })
    .select()
    .single();

  if (error) throw new Error(`[clientService] createClient: ${error.message}`);
  return mapRowToClient(data as Record<string, unknown>);
}

export async function updateClient(id: string, patch: Partial<Client>): Promise<void> {
  if (!supabase) return;

  const dbPatch: any = {};
  if (patch.name !== undefined)         dbPatch.name = patch.name;
  if (patch.statusId !== undefined)     dbPatch.status_id = patch.statusId;
  if (patch.assignees !== undefined)    dbPatch.assignees = patch.assignees;
  if (patch.faturamento !== undefined)  dbPatch.faturamento = patch.faturamento;
  if (patch.segmento !== undefined)     dbPatch.segmento = patch.segmento;
  if (patch.repositorio !== undefined)  dbPatch.repositorio = patch.repositorio;
  if (patch.ultimaReuniao !== undefined) dbPatch.ultima_reuniao = patch.ultimaReuniao;
  if (patch.priority !== undefined)     dbPatch.priority = patch.priority;
  if (patch.estimatedTime !== undefined) dbPatch.estimated_time = patch.estimatedTime;
  if (patch.trackedTime !== undefined)  dbPatch.tracked_time = patch.trackedTime;
  if (patch.description !== undefined)  dbPatch.description = patch.description;
  if (patch.tags !== undefined)         dbPatch.tags = patch.tags;
  if (patch.relatedTaskIds !== undefined) dbPatch.related_tasks = patch.relatedTaskIds;
  if (patch.startDate !== undefined)    dbPatch.start_date = patch.startDate;
  if (patch.dueDate !== undefined)      dbPatch.due_date = patch.dueDate;
  if (patch.activities !== undefined)   dbPatch.activities = patch.activities;

  const { error } = await supabase.from('clients').update(dbPatch).eq('id', id);
  if (error) throw new Error(`[clientService] updateClient: ${error.message}`);
}

export async function deleteClient(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw new Error(`[clientService] deleteClient: ${error.message}`);
}
// ─── Client Comments ────────────────────────────────────────────────────────
export async function addClientComment(
  clientId: string,
  comment: Omit<import('../types').TaskComment, 'id' | 'createdAt'>
): Promise<import('../types').TaskComment> {
  const fallback = { ...comment, id: `cc-${Date.now()}`, createdAt: new Date().toISOString() };
  if (!supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from('client_comments')
      .insert({
        client_id: clientId,
        author_name: comment.authorName,
        author_avatar: comment.authorAvatar,
        content: comment.content,
      })
      .select()
      .single();

    if (error) throw error;
    const row = data as Record<string, unknown>;
    return {
      id: row.id as string,
      authorName: row.author_name as string,
      authorAvatar: row.author_avatar as string,
      content: row.content as string,
      createdAt: row.created_at as string,
    };
  } catch {
    return fallback;
  }
}

export async function fetchClientComments(clientId: string): Promise<import('../types').TaskComment[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('client_comments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    if (error) return [];
    return ((data ?? []) as Record<string, unknown>[]).map(row => ({
      id: row.id as string,
      authorName: row.author_name as string,
      authorAvatar: row.author_avatar as string,
      content: row.content as string,
      createdAt: row.created_at as string,
    }));
  } catch {
    return [];
  }
}
