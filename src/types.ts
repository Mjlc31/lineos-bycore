export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Priority = 'Urgent' | 'High' | 'Normal' | 'Low' | 'None';

export type Tag = {
  name: string;
  color: string;
  bgColor: string;
};

export type Task = {
  id: string;
  name: string;
  statusId: string;
  assignees: string[];
  dueDate?: string;
  priority: Priority;
  tags?: Tag[];
};

export type ClientStatus = {
  id: string;
  name: string;
  color: string;
};

export type Client = {
  id: string;
  name: string;
  statusId: string;
  assignees: string[];
  faturamento?: string;
  segmento?: string;
  repositorio?: string;
  ultimaReuniao?: string;
};

export type ViewType = 'overview' | 'tasks' | 'clients';

// ─── CRM Types ───────────────────────────────────────────────────────────────
export type Column = {
  id: string;
  title: string;
  color: string;
};

export type Lead = {
  id: string;
  columnId: string;
  title: string;
  value: number;
  date: string;
};

// ─── Financeiro Types ──────────────────────────────────────────────────────────
export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: TransactionType;
};

// ─── Aprovação Types ───────────────────────────────────────────────────────────
export type ContentStatus = 'PENDENTE' | 'REVISÃO' | 'APROVADO';
export type ContentType = 'video' | 'image' | 'pdf';

export type ContentItem = {
  id: number;
  title: string;
  type: ContentType;
  status: ContentStatus;
  date: string;
  feedback: string | null;
  thumbnail: string;
  color: string;
  textColor: string;
};

// ─── Agendamento Types ─────────────────────────────────────────────────────────
export type Meeting = {
  id: number;
  title: string;
  date: string;
  time: string;
  client: string;
  platform: string;
  isToday: boolean;
};
