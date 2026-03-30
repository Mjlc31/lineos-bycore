-- supabase/schema.sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'EQUIPE', 'CLIENTE');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
CREATE TYPE content_status AS ENUM ('PENDENTE', 'APROVADO', 'REVISAO');

-- USERS TABLE (Extending Supabase auth.users is common, but we'll create a public profile table)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'CLIENTE'::user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTES TABLE
CREATE TABLE public.clientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    nicho TEXT,
    mrr DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAREFAS TABLE
CREATE TABLE public.tarefas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    status task_status DEFAULT 'TODO'::task_status NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id),
    responsavel_id UUID REFERENCES public.users(id),
    data_entrega TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTEUDOS_APROVACAO TABLE
CREATE TABLE public.conteudos_aprovacao (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) NOT NULL,
    midia_url TEXT NOT NULL,
    tipo_midia TEXT, -- 'VIDEO', 'FOTO', 'PDF'
    status content_status DEFAULT 'PENDENTE'::content_status NOT NULL,
    feedback_cliente TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FINANCEIRO TABLE
CREATE TABLE public.financeiro (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    valor DECIMAL(10, 2) NOT NULL,
    categoria TEXT NOT NULL,
    data_competencia DATE NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id), -- Optional, for fee tracking
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conteudos_aprovacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;

-- RLS Policies for `users`
-- Admins and Equipe can read all users. Clientes can only read their own profile.
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Equipe and Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'EQUIPE'))
);

-- RLS Policies for `clientes`
-- Admins and Equipe can read/write all. Clientes can read their own client data.
CREATE POLICY "Equipe and Admins can access clientes" ON public.clientes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'EQUIPE'))
);

-- RLS Policies for `tarefas`
-- Equipe/Admins can see all. Clientes can see tasks related to their cliente_id.
CREATE POLICY "Equipe and Admins can access tarefas" ON public.tarefas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'EQUIPE'))
);

-- RLS Policies for `conteudos_aprovacao`
-- Equipe/Admins can manage all. Clientes can view and update (feedback/status) their own content.
CREATE POLICY "Equipe and Admins can manage conteudos" ON public.conteudos_aprovacao FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'EQUIPE'))
);
CREATE POLICY "Clientes can view and update their conteudos" ON public.conteudos_aprovacao FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'CLIENTE')
);
CREATE POLICY "Clientes can update their conteudos" ON public.conteudos_aprovacao FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'CLIENTE')
);

-- RLS Policies for `financeiro`
-- Only Admins and Equipe can access financial data.
CREATE POLICY "Equipe and Admins can access financeiro" ON public.financeiro FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'EQUIPE'))
);
