-- =================================================================================
-- PATCH V10: Hierarquia de Tarefas (Spaces, Folders, Lists) & Custom Fields
-- =================================================================================

-- 1. SPACES
CREATE TABLE IF NOT EXISTS public.spaces (
  id          TEXT PRIMARY KEY DEFAULT 'space-' || gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  icon        TEXT,
  color       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on spaces" ON public.spaces;
CREATE POLICY "Enable all for authenticated on spaces" ON public.spaces FOR ALL USING (true) WITH CHECK (true);


-- 2. FOLDERS
CREATE TABLE IF NOT EXISTS public.folders (
  id          TEXT PRIMARY KEY DEFAULT 'folder-' || gen_random_uuid()::TEXT,
  space_id    TEXT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on folders" ON public.folders;
CREATE POLICY "Enable all for authenticated on folders" ON public.folders FOR ALL USING (true) WITH CHECK (true);


-- 3. LISTS
CREATE TABLE IF NOT EXISTS public.lists (
  id          TEXT PRIMARY KEY DEFAULT 'list-' || gen_random_uuid()::TEXT,
  space_id    TEXT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  folder_id   TEXT REFERENCES public.folders(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on lists" ON public.lists;
CREATE POLICY "Enable all for authenticated on lists" ON public.lists FOR ALL USING (true) WITH CHECK (true);


-- 4. CUSTOM FIELD DEFINITIONS
CREATE TABLE IF NOT EXISTS public.custom_field_definitions (
  id          TEXT PRIMARY KEY DEFAULT 'cfd-' || gen_random_uuid()::TEXT,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL, -- 'text', 'number', 'date', 'dropdown', 'checkbox'
  options     JSONB DEFAULT '[]'::JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on custom_field_definitions" ON public.custom_field_definitions;
CREATE POLICY "Enable all for authenticated on custom_field_definitions" ON public.custom_field_definitions FOR ALL USING (true) WITH CHECK (true);


-- 5. TASK COMMENTS & ATTACHMENTS (caso não existam)
CREATE TABLE IF NOT EXISTS public.task_comments (
  id            TEXT PRIMARY KEY DEFAULT 'comment-' || gen_random_uuid()::TEXT,
  task_id       TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_name   TEXT NOT NULL,
  author_avatar TEXT,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on task_comments" ON public.task_comments;
CREATE POLICY "Enable all for authenticated on task_comments" ON public.task_comments FOR ALL USING (true) WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.task_attachments (
  id          TEXT PRIMARY KEY DEFAULT 'att-' || gen_random_uuid()::TEXT,
  task_id     TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  type        TEXT NOT NULL, -- 'image', 'video', 'pdf', 'file'
  size        NUMERIC,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated on task_attachments" ON public.task_attachments;
CREATE POLICY "Enable all for authenticated on task_attachments" ON public.task_attachments FOR ALL USING (true) WITH CHECK (true);


-- 6. ALTERAÇÃO NA TABELA TASKS (Adicionar colunas faltantes)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'list_id') THEN
        ALTER TABLE public.tasks ADD COLUMN list_id TEXT REFERENCES public.lists(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'subtasks') THEN
        ALTER TABLE public.tasks ADD COLUMN subtasks JSONB DEFAULT '[]'::JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_spent') THEN
        ALTER TABLE public.tasks ADD COLUMN time_spent NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'is_timer_running') THEN
        ALTER TABLE public.tasks ADD COLUMN is_timer_running BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'custom_fields') THEN
        ALTER TABLE public.tasks ADD COLUMN custom_fields JSONB DEFAULT '{}'::JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_at') THEN
        ALTER TABLE public.tasks ADD COLUMN completed_at TEXT;
    END IF;
END $$;

-- Notificar PostgREST para reler o schema
NOTIFY pgrst, 'reload schema';
