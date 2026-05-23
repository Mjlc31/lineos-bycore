# 📱 Relatório de Mudanças no App Front-End

Para conectar o **LINE OS** (atualmente utilizando dados mockados no arquivo `data.ts`) ao novo banco de dados no Supabase, precisaremos realizar algumas modificações na base de código do Front-End. 

A arquitetura atual do seu projeto já é excelente, pois isola a lógica de dados em **Custom Hooks** (ex: `useTasks`, `useClients`, etc.). Isso significa que não precisaremos reescrever as telas do aplicativo, apenas a forma como os dados são consumidos dentro desses hooks!

Abaixo detalho o passo a passo do que precisa ser alterado na aplicação:

---

## 1. Configuração Inicial do Cliente (Supabase)

Primeiro, será necessário instalar o SDK oficial do Supabase.

**Comando no terminal:**
```bash
npm install @supabase/supabase-js
```

**Novo arquivo `src/lib/supabase.ts`:**
Vamos precisar criar a instância do cliente para que o App possa conversar com o banco, importando também as tipagens geradas anteriormente.

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types'; // Os tipos que geramos

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

*(Você precisará colocar a URL e a Key pública no seu arquivo `.env` local).*

---

## 2. Refatoração dos Custom Hooks (De Síncrono para Assíncrono)

Os arquivos dentro da pasta `src/hooks/` atualmente inicializam os estados locais (`useState`) utilizando as constantes importadas de `../data.ts`. Precisamos mudar isso para buscar os dados diretamente do Supabase (`useEffect`).

### 📌 Exemplo: Refatorando `useTasks.ts`

**Como é hoje:**
```typescript
import { tasks as initialTasks } from '../data';
const [tasks, setTasks] = useState<Task[]>(initialTasks);

const addTask = (newTask) => {
  setTasks([...tasks, newTask]);
}
```

**Como vai ficar (com Supabase):**
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

export function useTasks() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Buscar do banco (READ)
  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase.from('tasks').select('*');
      if (data) setTasks(data);
      setLoading(false);
    }
    fetchTasks();
  }, []);

  // 2. Criar no banco (CREATE)
  const addTask = async (newTask: Database['public']['Tables']['tasks']['Insert']) => {
    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (data) setTasks([...tasks, data[0]]);
  };

  // ... (Update e Delete seguem a mesma lógica)

  return { tasks, loading, addTask };
}
```

Esta mesma lógica de refatoração se aplica a todos os outros hooks (`useClients`, `useLeads`, `useTransactions`, `useContent`, `useMeetings`).

---

## 3. Substituição das Tipagens (`types.ts`)

Atualmente o sistema usa tipos criados manualmente em `src/types.ts`.
Como geramos os tipos do banco (`src/lib/database.types.ts`), você tem duas opções:

1. **Substituição Completa:** Passar a usar apenas os tipos do banco (Recomendado para máxima segurança). Exemplo: `type Task = Database['public']['Tables']['tasks']['Row']`.
2. **Camada de Adaptação (Mappers):** Converter o retorno do banco para o tipo atual do `types.ts` antes de passar para as telas. Útil se as telas usarem campos aninhados ou renomeados.

---

## 4. Gerenciamento de Arquivos e Uploads (Storage)

Telas que precisarem exibir ou salvar imagens/arquivos (como anexos de tarefas, vídeos da Academy e peças de aprovação), usarão a API de Storage.

**Exemplo de Upload (Ao anexar arquivo na tarefa):**
```typescript
const file = event.target.files[0];
const fileExt = file.name.split('.').pop();
const fileName = `${Math.random()}.${fileExt}`;
const filePath = `tasks/${fileName}`;

// Faz o Upload
const { error } = await supabase.storage.from('media').upload(filePath, file);

// Pega a URL pública
const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

// Salva a publicUrl na tabela task_attachments
```

---

## 5. Implementação de Autenticação (Auth)

Para não deixar o painel aberto ao público, será necessário:
1. Criar uma tela de Login (`/login`).
2. Proteger as rotas usando o state de sessão do Supabase:
```typescript
const { data: { session } } = await supabase.auth.getSession();
```
3. Atualizar a lógica para que as "Assignees" de tarefas peguem o ID do usuário logado e não fotos "mockadas" (`pravatar`).

---

## Resumo do Cronograma de Migração

Para executar essa transição de forma segura sem quebrar o app atual, recomendo a seguinte ordem de ataque:

- [ ] **Fase 1:** Instalar dependências e configurar a conexão (`supabase.ts`).
- [ ] **Fase 2:** Migrar `types.ts` para usar o `database.types.ts`.
- [ ] **Fase 3:** Refatorar os Hooks um a um (`useTasks`, `useClients`, etc) e remover importações de `data.ts`.
- [ ] **Fase 4:** Ajustar componentes de tela se houverem quebras de tipagem.
- [ ] **Fase 5:** Implementar sistema de login e rotas protegidas.
- [ ] **Fase 6:** Implementar a lógica de upload no Bucket `media`.
