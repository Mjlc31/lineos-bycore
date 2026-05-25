-- ─── 1. Adicionar 2FA ao Profile ───────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;

-- ─── 2. Criar tabela de SPACES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_spaces (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  icon_text     TEXT, -- Ex: 'S', 'E'
  color         TEXT, -- Ex: '#E31837'
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Criar tabela de FOLDERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_folders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id      UUID REFERENCES public.task_spaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Criar tabela de LISTS (opcional, para ser mais ClickUp-like) ────────
-- Por enquanto, usaremos as pastas e as listas serão implícitas ou vinculadas
-- No modelo atual, "Clientes Line" é uma pasta.

-- ─── 5. Relacionar TASKS e CLIENTS a Spaces/Folders ─────────────────────────
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.task_folders(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES public.task_spaces(id) ON DELETE SET NULL;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.task_folders(id) ON DELETE SET NULL;

-- ─── 6. Habilitar RLS ───────────────────────────────────────────────────────
ALTER TABLE public.task_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_spaces_select" ON public.task_spaces FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "task_spaces_manage" ON public.task_spaces FOR ALL USING (public.is_team_member());

CREATE POLICY "task_folders_select" ON public.task_folders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "task_folders_manage" ON public.task_folders FOR ALL USING (public.is_team_member());

-- ─── 7. SEED DATA ───────────────────────────────────────────────────────────
-- Criar Space "Line" e "Equipe"
DO $$
DECLARE
  space_line_id UUID;
  space_equipe_id UUID;
  folder_clientes_id UUID;
BEGIN
  -- Space Line (S)
  INSERT INTO public.task_spaces (name, icon_text, color, sort_order)
  VALUES ('Space', 'S', '#E31837', 1)
  RETURNING id INTO space_line_id;

  -- Folder Clientes Line
  INSERT INTO public.task_folders (space_id, name, sort_order)
  VALUES (space_line_id, 'Clientes Line', 1)
  RETURNING id INTO folder_clientes_id;

  -- Vincular clientes existentes a essa pasta
  UPDATE public.clients SET folder_id = folder_clientes_id;

  -- Space Equipe (E)
  INSERT INTO public.task_spaces (name, icon_text, color, sort_order)
  VALUES ('Espaço da equipe', 'E', '#ef4444', 2)
  RETURNING id INTO space_equipe_id;

  -- Criar pasta Projetos no Espaço Equipe
  INSERT INTO public.task_folders (space_id, name, sort_order)
  VALUES (space_equipe_id, 'Projetos', 1);

END $$;
