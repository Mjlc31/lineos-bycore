/**
 * usePipelines — Hook para gerenciar múltiplas pipelines no CRM
 * Ajuste 3: pipelines salvas no Supabase
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CrmColumn } from '../types';

export interface Pipeline {
  id: string;
  name: string;
  columns: CrmColumn[];
  createdAt: string;
  sort_order: number;
}

const DEFAULT_COLUMNS: CrmColumn[] = [
  { id: 'leads',    title: 'Leads',             color: 'bg-blue-500',   accent: 'blue'   },
  { id: 'agendada', title: 'Reunião Agendada',   color: 'bg-purple-500', accent: 'purple' },
  { id: 'proposta', title: 'Proposta Enviada',   color: 'bg-orange-500', accent: 'orange' },
  { id: 'ganho',    title: 'Fechado (Ganho)',    color: 'bg-green-500',  accent: 'green'  },
  { id: 'perdido',  title: 'Perdido',            color: 'bg-red-500',    accent: 'red'    },
];

const DEFAULT_PIPELINE: Pipeline = {
  id: 'pipeline-default',
  name: 'Pipeline Principal',
  columns: DEFAULT_COLUMNS,
  createdAt: new Date().toISOString(),
  sort_order: 0,
};

// ─── Helpers de persistência local (fallback) ─────────────────────────────────
function loadLocal(): Pipeline[] {
  try {
    const saved = localStorage.getItem('line_os_pipelines_v2');
    return saved ? JSON.parse(saved) : [DEFAULT_PIPELINE];
  } catch {
    return [DEFAULT_PIPELINE];
  }
}

function saveLocal(pipelines: Pipeline[]) {
  try {
    localStorage.setItem('line_os_pipelines_v2', JSON.stringify(pipelines));
  } catch { /* ignore */ }
}

// ─── Mappers ──────────────────────────────────────────────────────────────────
function mapRowToPipeline(row: Record<string, unknown>): Pipeline {
  return {
    id: row.id as string,
    name: row.name as string,
    columns: (row.columns as CrmColumn[]) ?? DEFAULT_COLUMNS,
    createdAt: row.created_at as string,
    sort_order: (row.sort_order as number) ?? 0,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePipelines() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(loadLocal);
  const [activePipelineId, setActivePipelineId] = useState<string>(() => {
    return localStorage.getItem('line_os_active_pipeline') || 'pipeline-default';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Persistir id da pipeline ativa
  useEffect(() => {
    localStorage.setItem('line_os_active_pipeline', activePipelineId);
  }, [activePipelineId]);

  // Sincronizar com Supabase
  useEffect(() => {
    if (!supabase) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('crm_pipelines' as never)
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        if (data && (data as unknown[]).length > 0) {
          const loaded = (data as Record<string, unknown>[]).map(mapRowToPipeline);
          setPipelines(loaded);
          saveLocal(loaded);
          // Garantir que activePipelineId existe
          const ids = loaded.map(p => p.id);
          setActivePipelineId(prev => ids.includes(prev) ? prev : loaded[0].id);
        }
      } catch {
        // Supabase ainda não tem a tabela — usar local silenciosamente
        console.info('[usePipelines] Usando localStorage (tabela crm_pipelines pendente)');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Helpers de sync ────────────────────────────────────────────────────────
  const upsertToSupabase = useCallback(async (pipeline: Pipeline) => {
    if (!supabase) return;
    try {
      await supabase.from('crm_pipelines' as never).upsert({
        id: pipeline.id,
        name: pipeline.name,
        columns: pipeline.columns,
        sort_order: pipeline.sort_order,
      });
    } catch (err) {
      console.warn('[usePipelines] upsert falhou, apenas local:', err);
    }
  }, []);

  const deleteFromSupabase = useCallback(async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from('crm_pipelines' as never).delete().eq('id', id);
    } catch (err) {
      console.warn('[usePipelines] delete falhou, apenas local:', err);
    }
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const addPipeline = useCallback((name: string) => {
    const newPipeline: Pipeline = {
      id: `pipeline-${Date.now()}`,
      name,
      columns: DEFAULT_COLUMNS.map(c => ({ ...c, id: `${c.id}-${Date.now()}` })),
      createdAt: new Date().toISOString(),
      sort_order: Date.now(),
    };
    setPipelines(prev => {
      const updated = [...prev, newPipeline];
      saveLocal(updated);
      return updated;
    });
    upsertToSupabase(newPipeline);
    return newPipeline.id;
  }, [upsertToSupabase]);

  const updatePipeline = useCallback((id: string, updates: Partial<Pick<Pipeline, 'name' | 'columns'>>) => {
    setPipelines(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        const next = { ...p, ...updates };
        upsertToSupabase(next);
        return next;
      });
      saveLocal(updated);
      return updated;
    });
  }, [upsertToSupabase]);

  const deletePipeline = useCallback((id: string) => {
    setPipelines(prev => {
      if (prev.length <= 1) return prev; // Não apagar a última pipeline
      const updated = prev.filter(p => p.id !== id);
      saveLocal(updated);
      return updated;
    });
    deleteFromSupabase(id);
    setActivePipelineId(prev => prev === id ? pipelines.find(p => p.id !== id)?.id ?? 'pipeline-default' : prev);
  }, [deleteFromSupabase, pipelines]);

  // ── Column actions (delegam para updatePipeline) ───────────────────────────
  const addColumn = useCallback((pipelineId: string, col: Omit<CrmColumn, 'id'>) => {
    const newCol: CrmColumn = { ...col, id: `col-${Date.now()}` };
    setPipelines(prev => {
      const updated = prev.map(p => {
        if (p.id !== pipelineId) return p;
        const next = { ...p, columns: [...p.columns, newCol] };
        upsertToSupabase(next);
        return next;
      });
      saveLocal(updated);
      return updated;
    });
  }, [upsertToSupabase]);

  const updateColumn = useCallback((pipelineId: string, colId: string, updates: Partial<CrmColumn>) => {
    setPipelines(prev => {
      const updated = prev.map(p => {
        if (p.id !== pipelineId) return p;
        const next = { ...p, columns: p.columns.map(c => c.id === colId ? { ...c, ...updates } : c) };
        upsertToSupabase(next);
        return next;
      });
      saveLocal(updated);
      return updated;
    });
  }, [upsertToSupabase]);

  const removeColumn = useCallback((pipelineId: string, colId: string) => {
    setPipelines(prev => {
      const updated = prev.map(p => {
        if (p.id !== pipelineId) return p;
        const next = { ...p, columns: p.columns.filter(c => c.id !== colId) };
        upsertToSupabase(next);
        return next;
      });
      saveLocal(updated);
      return updated;
    });
  }, [upsertToSupabase]);

  const reorderColumns = useCallback((pipelineId: string, columns: CrmColumn[]) => {
    setPipelines(prev => {
      const updated = prev.map(p => {
        if (p.id !== pipelineId) return p;
        const next = { ...p, columns };
        upsertToSupabase(next);
        return next;
      });
      saveLocal(updated);
      return updated;
    });
  }, [upsertToSupabase]);

  const activePipeline = pipelines.find(p => p.id === activePipelineId) ?? pipelines[0] ?? DEFAULT_PIPELINE;

  return {
    pipelines,
    activePipeline,
    activePipelineId,
    setActivePipelineId,
    isLoading,
    // Pipeline actions
    addPipeline,
    updatePipeline,
    deletePipeline,
    // Column actions
    addColumn,
    updateColumn,
    removeColumn,
    reorderColumns,
  };
}
