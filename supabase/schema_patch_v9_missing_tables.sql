-- =================================================================================
-- PATCH V9: Adição das tabelas pendentes (Task Activities, Automations, Feedbacks, Events)
-- =================================================================================

-- 1. TASK ACTIVITIES (Log de Tarefas)
CREATE TABLE IF NOT EXISTS public.task_activities (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id     TEXT         NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  type        TEXT         NOT NULL, -- 'status_change', 'assignee_change', 'priority_change', 'system'
  description TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on task_activities" ON public.task_activities;
CREATE POLICY "Enable all for authenticated on task_activities" ON public.task_activities FOR ALL USING (true) WITH CHECK (true);

-- 2. AUTOMATIONS (Automações da Equipe)
CREATE TABLE IF NOT EXISTS public.automations (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT         NOT NULL,
  trigger     JSONB        NOT NULL,
  actions     JSONB        NOT NULL,
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on automations" ON public.automations;
CREATE POLICY "Enable all for authenticated on automations" ON public.automations FOR ALL USING (true) WITH CHECK (true);

-- 3. CONTENT FEEDBACKS (Histórico de feedbacks)
CREATE TABLE IF NOT EXISTS public.content_feedbacks (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  content_item_id BIGINT   NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  text        TEXT         NOT NULL,
  author      TEXT         NOT NULL, -- 'cliente' ou 'equipe'
  date        TEXT         NOT NULL, -- ISO
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.content_feedbacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on content_feedbacks" ON public.content_feedbacks;
CREATE POLICY "Enable all for authenticated on content_feedbacks" ON public.content_feedbacks FOR ALL USING (true) WITH CHECK (true);

-- 4. CONTENT GROUPS (Agrupamento de conteúdos enviados)
CREATE TABLE IF NOT EXISTS public.content_groups (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT         NOT NULL,
  client_name TEXT         NOT NULL,
  share_token TEXT         NOT NULL UNIQUE,
  task_ids    TEXT[]       DEFAULT '{}',
  status      TEXT         NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'approved', 'revision'
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.content_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on content_groups" ON public.content_groups;
CREATE POLICY "Enable all for authenticated on content_groups" ON public.content_groups FOR ALL USING (true) WITH CHECK (true);

-- 5. EVENT TYPES (Tipos de Reunião/Evento)
CREATE TABLE IF NOT EXISTS public.event_types (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT         NOT NULL,
  emoji       TEXT         NOT NULL,
  color       TEXT         NOT NULL,
  is_default  BOOLEAN      DEFAULT false,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on event_types" ON public.event_types;
CREATE POLICY "Enable all for authenticated on event_types" ON public.event_types FOR ALL USING (true) WITH CHECK (true);

-- 6. SCHEDULED EVENTS (Novo modelo de agendamento)
CREATE TABLE IF NOT EXISTS public.scheduled_events (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT         NOT NULL,
  event_type_id UUID       NOT NULL REFERENCES public.event_types(id) ON DELETE CASCADE,
  client_name TEXT,
  assignees   TEXT[]       DEFAULT '{}',
  date        TEXT         NOT NULL, -- ISO ou data formatada
  time        TEXT         NOT NULL,
  end_time    TEXT,
  meet_link   TEXT,
  description TEXT,
  reminder    TEXT,        -- '5min', '1h', etc
  recurrence  TEXT         DEFAULT 'none',
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.scheduled_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on scheduled_events" ON public.scheduled_events;
CREATE POLICY "Enable all for authenticated on scheduled_events" ON public.scheduled_events FOR ALL USING (true) WITH CHECK (true);

-- 7. Adicionar LESSONS no Academy Trilhas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academy_trilhas' AND column_name = 'lessons') THEN
        ALTER TABLE public.academy_trilhas ADD COLUMN lessons JSONB DEFAULT '[]'::JSONB;
    END IF;
END $$;

-- Notificar PostgREST para reler o schema
NOTIFY pgrst, 'reload schema';
