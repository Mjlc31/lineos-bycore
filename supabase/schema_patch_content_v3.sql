-- ═══════════════════════════════════════════════════════════════════════════════
-- PATCH: Módulo de Aprovação de Conteúdo v3
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Adicionar novas colunas em content_items
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS post_date TEXT,
ADD COLUMN IF NOT EXISTS post_time TEXT,
ADD COLUMN IF NOT EXISTS post_channels TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS post_format TEXT,
ADD COLUMN IF NOT EXISTS caption TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT;

COMMENT ON COLUMN public.content_items.post_date IS 'Data de postagem agendada (ISO)';
COMMENT ON COLUMN public.content_items.post_time IS 'Horário de postagem (HH:MM)';
COMMENT ON COLUMN public.content_items.post_channels IS 'Canais (Instagram, TikTok, etc)';
COMMENT ON COLUMN public.content_items.post_format IS 'Formato do post (Reels, Feed, etc)';
COMMENT ON COLUMN public.content_items.caption IS 'Legenda da postagem';
COMMENT ON COLUMN public.content_items.client_email IS 'Email do cliente para acesso exclusivo';

-- 2. Atualizar RLS Policies de content_items para restringir acesso de CLIENTE

-- Remover políticas antigas
DROP POLICY IF EXISTS "content_select" ON public.content_items;
DROP POLICY IF EXISTS "content_client_update" ON public.content_items;

-- Nova política de SELECT (Equipe vê tudo)
CREATE POLICY "content_select_team" ON public.content_items
  FOR SELECT USING (public.is_team_member());

-- Nova política de SELECT (Cliente vê apenas os vinculados ao seu e-mail)
CREATE POLICY "content_select_client" ON public.content_items
  FOR SELECT USING (
    client_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Nova política de UPDATE (Cliente pode atualizar apenas os seus)
CREATE POLICY "content_client_update" ON public.content_items
  FOR UPDATE USING (
    client_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );
