-- =================================================================================
-- PATCH V11: Nexus Modules - Tabelas faltantes (task_lists) e correções
-- =================================================================================

-- 1. Criar tabela de LISTS
CREATE TABLE IF NOT EXISTS public.task_lists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id      UUID REFERENCES public.task_spaces(id) ON DELETE CASCADE,
  folder_id     UUID REFERENCES public.task_folders(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  color         TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS e Policies para task_lists
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "task_lists_select" ON public.task_lists;
CREATE POLICY "task_lists_select" ON public.task_lists FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "task_lists_manage" ON public.task_lists;
CREATE POLICY "task_lists_manage" ON public.task_lists FOR ALL USING (public.is_team_member());

-- 3. Atualizar tabela tasks para referenciar list_id como UUID caso necessário
-- CUIDADO: Se a coluna list_id já existir como TEXT, precisaremos alterá-ta ou tratar no frontend
-- Por enquanto, no App, listId é tratado como string, então o UUID vai funcionar como string.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'list_id') THEN
        ALTER TABLE public.tasks ADD COLUMN list_id UUID REFERENCES public.task_lists(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Notificar PostgREST para reler o schema
NOTIFY pgrst, 'reload schema';
