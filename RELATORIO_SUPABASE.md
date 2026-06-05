# 🚀 Relatório Detalhado: Migração e Estruturação do Supabase

Este documento serve como um **log oficial e detalhado** de todas as operações realizadas via MCP (Model Context Protocol) diretamente no seu banco de dados Supabase para o projeto **LINE OS**.

Toda a arquitetura de dados que antes estava simulada em `data.ts` foi mapeada e implementada para suportar um ecossistema produtivo corporativo.

---

## 1. Storage (Armazenamento de Arquivos)

### 📦 Bucket: `media`
Foi criado um repositório central de Storage, configurado para acesso público (facilitando a visualização de mídias sem necessidade de tokens assinados nesta primeira fase).

**Casos de uso suportados:**
- **Academy:** Hospedagem dos vídeos (`video_url` nas lessons).
- **Tarefas:** Upload de anexos em cards do Gestor (`task_attachments`).
- **Aprovação de Conteúdo:** Vídeos, PDFs e Imagens enviadas para aprovação de clientes (`content_items`).
- **Usuários:** Fotos de avatar (`avatar_url` na tabela profiles).

---

## 2. Banco de Dados: Tabelas Criadas / Ajustadas

Abaixo estão listadas, módulo a módulo, as tabelas que agora estruturam o LINE OS, juntamente com seus campos principais:

### 👤 Módulo: Perfil e Usuários
> Tabelas para estender o módulo nativo de autenticação (`auth.users`) do Supabase.

| Tabela | Função / Descrição |
| :--- | :--- |
| `profiles` | Armazena dados públicos dos usuários: `id` (referência ao `auth.users`), `name` (ou full_name), `avatar_url` (bucket media), e `role`. |

### ✅ Módulo: Gestor de Tarefas (Estilo ClickUp)
> O núcleo de operações da agência. Todas as atividades operacionais residem aqui.

| Tabela | Função / Descrição |
| :--- | :--- |
| `statuses` | Tabela de domínio contendo os status da agência: PENDENTE, REVISÃO INTERNA, etc. |
| `tasks` | A tarefa central. Contém `name`, `description`, `due_date`, `priority`, `time_spent` e liga ao `status_id`. |
| `task_assignees` | **(Tabela Pivot)** Relacionamento N:N ligando as `tasks` aos `profiles` responsáveis. |
| `task_tags` | Etiquetas de categorização. Campos: `name`, `color`, `bg_color`. |
| `task_comments` | Comunicação dentro dos cards. Registra `author_id` (perfil), `content` e `created_at`. |
| `task_activities` | Logs de atividades e automações do card (mudanças de status, transferências). |
| `task_attachments` | Referências aos arquivos anexados do bucket `media`. |
| `task_subtasks` | Sub-itens (checklists) de cada tarefa com status booleano `completed`. |
| `automations` | Registro de automações e gatilhos da equipe do Gestor. |
| `spaces`, `folders`, `lists` | Hierarquia de organização de projetos. |

### 🏢 Módulo: Clientes (Contas)
> Centralização das informações contratuais e gerenciais dos clientes.

| Tabela | Função / Descrição |
| :--- | :--- |
| `client_statuses` | Tabela de domínio para o ciclo do cliente: ACTIVE, ONBOARDING, CHURNED. |
| `clients` | Dados da conta. `name`, `faturamento`, `segmento`, `repositorio` (Link do Drive) e `ultima_reuniao`. |
| `client_assignees` | **(Tabela Pivot)** Vincula quais membros da agência atendem qual conta. |

### 🎯 Módulo: CRM e Comercial (Leads)
> Funil de Vendas do pipeline comercial da agência.

| Tabela | Função / Descrição |
| :--- | :--- |
| `crm_columns` | As etapas do funil de vendas (Leads, Reunião Agendada, Ganho, etc). |
| `crm_leads` | Ficha do lead comercial. Inclui campos de `contact_name`, `email`, `value` (Valor financeiro), `source` e informações de empresa (CNPJ/Endereço). |
| `crm_lead_tags` | Tags de segmentação para remarketing. |
| `lead_activities`| Histórico do vendedor com o lead (Notas, Ligações, E-mails). |
| `lead_tasks` | Lembretes de follow-up (Tarefas exclusivas da equipe de vendas atreladas ao lead). |

### 💰 Módulo: Financeiro
> Gestão de receitas, despesas e DRE.

| Tabela | Função / Descrição |
| :--- | :--- |
| `transactions` | Todas as movimentações. Campos `title`, `amount`, `category`, e `type` (income/expense). |
| `dre_categories` | Definições de categorização para cruzamentos na montagem da DRE (Plano de contas). |

### 👍 Módulo: Aprovação de Conteúdo
> Portal onde o cliente entra para revisar as peças produzidas.

| Tabela | Função / Descrição |
| :--- | :--- |
| `content_groups` | O pacote ("pack") de posts enviado para aprovação, agrupa vários itens e gera um `share_token`. |
| `content_items` | A peça individual (Carrossel, Vídeo, PDF). Contém `status` (Aprovado/Pendente), `file_url`, `caption` (Legenda). |
| `content_feedbacks`| Registro de comentários dos clientes solicitando alterações. |

### 📅 Módulo: Agendamentos
> Ferramenta de marcação de reuniões e calendários, substituindo o Calendly.

| Tabela | Função / Descrição |
| :--- | :--- |
| `event_types` | Tipos de chamadas (Reunião Comercial, Apresentação de Relatório, Onboarding). |
| `scheduled_events` | O evento em si, marcado na agenda: `date`, `time`, `meet_link`, `recurrence`. |
| `scheduled_event_assignees` | Pessoas convidadas para o evento. |

### 🎓 Módulo: Academy
> Hub de treinamento (EAD) interno para novos colaboradores da agência.

| Tabela | Função / Descrição |
| :--- | :--- |
| `course_tracks` | A Trilha de Conhecimento (Ex: Onboarding Geral, Formação de Designer). |
| `lessons` | As aulas. Podem ser textos (Markdown) ou vídeos armazenados no bucket `media` (campo `video_url`). |

---

## 3. Extração e Geração de Tipos (TypeScript)

Para que o Front-End do sistema consuma esses dados do banco de forma segura, com autocompletar inteligente e verificações de tipo rigorosas no padrão Vale do Silício, o arquivo `src/lib/database.types.ts` foi gerado via MCP Supabase e o `supabase.ts` foi refatorado para utilizar estritamente o tipo estático.

---

> [!NOTE]
> **Sobre o Design do Banco de Dados:**
> Ao longo das criações via SQL, foram incluídas deleções em cascata (`ON DELETE CASCADE`) na maior parte das tabelas pivot e tabelas filho. Isso garante que, se um `Task` ou `Client` for deletado, seus anexos, comentários e responsáveis vinculados também sejam deletados para manter o banco limpo e livre de "dados órfãos".
> **Atualização Recente:** O patch V9 foi executado via Supabase MCP e as tabelas `task_activities`, `automations`, `content_feedbacks`, `content_groups`, `event_types`, `scheduled_events`, `spaces`, `folders` e `lists` foram devidamente provisionadas e seguradas via *Row Level Security* (RLS).
