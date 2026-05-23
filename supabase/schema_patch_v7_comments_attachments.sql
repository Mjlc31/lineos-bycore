-- =================================================================================
-- PATCH V7: Tabelas de Comentários e Anexos de Tarefas
-- Execute este script no SQL Editor do Supabase
-- =================================================================================

-- 1. Tabela de Comentários de Tarefas
CREATE TABLE IF NOT EXISTS public.task_comments (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id     TEXT         NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_name TEXT         NOT NULL,
  author_avatar TEXT,
  content     TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for authenticated on task_comments" ON public.task_comments;
CREATE POLICY "Enable all for authenticated on task_comments"
  ON public.task_comments FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Tabela de Anexos de Tarefas
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id     TEXT         NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  name        TEXT         NOT NULL,
  url         TEXT         NOT NULL,
  type        TEXT         NOT NULL DEFAULT 'file',
  size        INTEGER,
  uploaded_at TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for authenticated on task_attachments" ON public.task_attachments;
CREATE POLICY "Enable all for authenticated on task_attachments"
  ON public.task_attachments FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Notificar PostgREST para reler o schema
NOTIFY pgrst, 'reload schema';
