/**
 * DNAClientes — Ajuste 7
 * Painel completo de cada cliente: documentação, drive, senhas,
 * orientações para a equipe, NPS e gravações.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, ChevronRight, ChevronDown, Plus, Save, Trash2,
  Link as LinkIcon, Key, FileText, Phone, Mail, Globe,
  Star, Video, X, Edit2, Check, ExternalLink, Copy, Shield,
  BookOpen, Calendar, BarChart2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from './Toast';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface ClientDNA {
  clientId: string;
  description: string;           // Sobre o cliente
  driveUrl: string;              // Link do Drive
  socialPasswords: SocialAccount[];
  teamNotes: string;             // Orientações para a equipe
  npsHistory: NPSEntry[];
  recordings: Recording[];
  contacts: ContactEntry[];
}

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  password: string;
}

interface NPSEntry {
  id: string;
  date: string;
  score: number;
  comment: string;
}

interface Recording {
  id: string;
  title: string;
  date: string;
  url: string;
}

interface ContactEntry {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

const STORAGE_KEY = 'line_os_client_dna_v1';

function loadDNA(): Record<string, ClientDNA> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveDNA(data: Record<string, ClientDNA>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function emptyDNA(clientId: string): ClientDNA {
  return { clientId, description: '', driveUrl: '', socialPasswords: [], teamNotes: '', npsHistory: [], recordings: [], contacts: [] };
}

// ─── Sub-components ────────────────────────────────────────────────────────────
const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-[#141414] border border-[#222] rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-[#222] bg-[#0d0d0d]">
      <span className="text-gray-400">{icon}</span>
      <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const EditableText = ({ value, onChange, placeholder, multiline }: { value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => { onChange(draft); setEditing(false); };

  if (editing) {
    return multiline ? (
      <div className="space-y-2">
        <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)} rows={4}
          className="w-full bg-[#1e1e1e] border border-primary/40 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none placeholder-gray-600" placeholder={placeholder} />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancelar</button>
          <button onClick={save} className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg flex items-center gap-1"><Check className="w-3 h-3" /> Salvar</button>
        </div>
      </div>
    ) : (
      <div className="flex gap-2">
        <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          className="flex-1 bg-[#1e1e1e] border border-primary/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" placeholder={placeholder} />
        <button onClick={save} className="px-3 py-2 bg-primary text-white rounded-lg text-xs"><Check className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group cursor-pointer" onClick={() => { setDraft(value); setEditing(true); }}>
      <p className={`flex-1 text-sm leading-relaxed ${value ? 'text-gray-300' : 'text-gray-600 italic'}`}>
        {value || placeholder}
      </p>
      <Edit2 className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 mt-0.5 flex-shrink-0 transition-opacity" />
    </div>
  );
};

// ─── Painel do Cliente ─────────────────────────────────────────────────────────
const ClientPanel = ({ clientId, clientName }: { clientId: string; clientName: string }) => {
  const [dnaMap, setDnaMap] = useState<Record<string, ClientDNA>>(loadDNA);
  const dna = dnaMap[clientId] ?? emptyDNA(clientId);
  const { showToast, ToastContainer } = useToast();

  const update = (partial: Partial<ClientDNA>) => {
    const next = { ...dnaMap, [clientId]: { ...dna, ...partial } };
    setDnaMap(next);
    saveDNA(next);
  };

  // Social passwords
  const addSocial = () => update({ socialPasswords: [...dna.socialPasswords, { id: Date.now().toString(), platform: 'Instagram', username: '', password: '' }] });
  const updateSocial = (id: string, field: keyof SocialAccount, val: string) =>
    update({ socialPasswords: dna.socialPasswords.map(s => s.id === id ? { ...s, [field]: val } : s) });
  const removeSocial = (id: string) => update({ socialPasswords: dna.socialPasswords.filter(s => s.id !== id) });

  // NPS
  const addNPS = () => update({ npsHistory: [...dna.npsHistory, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], score: 8, comment: '' }] });
  const updateNPS = (id: string, field: keyof NPSEntry, val: any) =>
    update({ npsHistory: dna.npsHistory.map(n => n.id === id ? { ...n, [field]: val } : n) });
  const removeNPS = (id: string) => update({ npsHistory: dna.npsHistory.filter(n => n.id !== id) });

  // Recordings
  const addRecording = () => update({ recordings: [...dna.recordings, { id: Date.now().toString(), title: '', date: new Date().toISOString().split('T')[0], url: '' }] });
  const updateRecording = (id: string, field: keyof Recording, val: string) =>
    update({ recordings: dna.recordings.map(r => r.id === id ? { ...r, [field]: val } : r) });
  const removeRecording = (id: string) => update({ recordings: dna.recordings.filter(r => r.id !== id) });

  // Contacts
  const addContact = () => update({ contacts: [...dna.contacts, { id: Date.now().toString(), name: '', role: '', phone: '', email: '' }] });
  const updateContact = (id: string, field: keyof ContactEntry, val: string) =>
    update({ contacts: dna.contacts.map(c => c.id === id ? { ...c, [field]: val } : c) });
  const removeContact = (id: string) => update({ contacts: dna.contacts.filter(c => c.id !== id) });

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); showToast('Copiado!'); };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <ToastContainer />

      {/* Sobre o cliente */}
      <Section title="Sobre o Cliente" icon={<BookOpen className="w-4 h-4" />}>
        <EditableText value={dna.description} onChange={v => update({ description: v })} placeholder="Clique para adicionar uma descrição do cliente — segmento, contexto, histórico..." multiline />
      </Section>

      {/* Drive & Links */}
      <Section title="Drive & Arquivos" icon={<LinkIcon className="w-4 h-4" />}>
        <div className="flex items-center gap-3">
          <input value={dna.driveUrl} onChange={e => update({ driveUrl: e.target.value })}
            placeholder="https://drive.google.com/..."
            className="flex-1 bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 placeholder-gray-600" />
          {dna.driveUrl && (
            <>
              <a href={dna.driveUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                <ExternalLink className="w-4 h-4" />
              </a>
              <button onClick={() => copyToClipboard(dna.driveUrl)} className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors border border-white/10">
                <Copy className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </Section>

      {/* Contatos */}
      <Section title="Contatos" icon={<Phone className="w-4 h-4" />}>
        <div className="space-y-3">
          {dna.contacts.map(c => (
            <div key={c.id} className="grid grid-cols-4 gap-2 items-center group">
              <input value={c.name} onChange={e => updateContact(c.id, 'name', e.target.value)} placeholder="Nome"
                className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 placeholder-gray-600" />
              <input value={c.role} onChange={e => updateContact(c.id, 'role', e.target.value)} placeholder="Cargo"
                className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 placeholder-gray-600" />
              <input value={c.phone} onChange={e => updateContact(c.id, 'phone', e.target.value)} placeholder="Telefone"
                className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 placeholder-gray-600" />
              <div className="flex gap-2">
                <input value={c.email} onChange={e => updateContact(c.id, 'email', e.target.value)} placeholder="E-mail"
                  className="flex-1 bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 placeholder-gray-600" />
                <button onClick={() => removeContact(c.id)} className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          <button onClick={addContact} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" /> Adicionar contato
          </button>
        </div>
      </Section>

      {/* Senhas das Redes Sociais */}
      <Section title="Senhas das Redes Sociais" icon={<Shield className="w-4 h-4" />}>
        <div className="space-y-3">
          {dna.socialPasswords.map(s => (
            <div key={s.id} className="grid grid-cols-3 gap-2 items-center group">
              <select value={s.platform} onChange={e => updateSocial(s.id, 'platform', e.target.value)}
                className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40">
                {['Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn', 'Google Ads', 'Meta Ads', 'Twitter/X', 'Pinterest', 'Outros'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input value={s.username} onChange={e => updateSocial(s.id, 'username', e.target.value)} placeholder="Usuário / E-mail"
                className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 placeholder-gray-600" />
              <div className="flex gap-2">
                <input value={s.password} onChange={e => updateSocial(s.id, 'password', e.target.value)} placeholder="Senha"
                  className="flex-1 bg-[#1e1e1e] border border-red-500/10 rounded-lg px-3 py-2 text-sm text-red-300 font-mono focus:outline-none focus:border-red-500/40 placeholder-gray-600" />
                <button onClick={() => copyToClipboard(s.password)} className="p-2 rounded-lg text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5" title="Copiar senha"><Copy className="w-3.5 h-3.5" /></button>
                <button onClick={() => removeSocial(s.id)} className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          <button onClick={addSocial} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" /> Adicionar conta
          </button>
        </div>
      </Section>

      {/* Orientações para a equipe */}
      <Section title="Orientações para a Equipe" icon={<FileText className="w-4 h-4" />}>
        <EditableText value={dna.teamNotes} onChange={v => update({ teamNotes: v })}
          placeholder="Clique para adicionar orientações — tom de voz, preferências, restrições, como lidar com este cliente..." multiline />
      </Section>

      {/* Histórico de NPS */}
      <Section title="Histórico de NPS" icon={<BarChart2 className="w-4 h-4" />}>
        <div className="space-y-3">
          {dna.npsHistory.map(n => (
            <div key={n.id} className="flex items-center gap-3 group">
              <input type="date" value={n.date} onChange={e => updateNPS(n.id, 'date', e.target.value)}
                className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none [color-scheme:dark] w-36" />
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <button key={i} type="button" onClick={() => updateNPS(n.id, 'score', i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${n.score >= i + 1
                      ? n.score >= 9 ? 'bg-green-500 text-white' : n.score >= 7 ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                      : 'bg-[#222] text-gray-500 hover:bg-[#333]'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <input value={n.comment} onChange={e => updateNPS(n.id, 'comment', e.target.value)} placeholder="Observação..."
                className="flex-1 bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none placeholder-gray-600" />
              <button onClick={() => removeNPS(n.id)} className="p-1.5 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={addNPS} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" /> Registrar NPS
          </button>
        </div>
      </Section>

      {/* Gravações */}
      <Section title="Gravações de Reuniões" icon={<Video className="w-4 h-4" />}>
        <div className="space-y-3">
          {dna.recordings.map(r => (
            <div key={r.id} className="grid grid-cols-3 gap-2 items-center group">
              <input value={r.title} onChange={e => updateRecording(r.id, 'title', e.target.value)} placeholder="Título da reunião"
                className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 placeholder-gray-600" />
              <input type="date" value={r.date} onChange={e => updateRecording(r.id, 'date', e.target.value)}
                className="bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none [color-scheme:dark]" />
              <div className="flex gap-2">
                <input value={r.url} onChange={e => updateRecording(r.id, 'url', e.target.value)} placeholder="Link da gravação"
                  className="flex-1 bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 placeholder-gray-600" />
                {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="p-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 rounded-lg border border-blue-500/20 transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>}
                <button onClick={() => removeRecording(r.id)} className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          <button onClick={addRecording} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" /> Adicionar gravação
          </button>
        </div>
      </Section>
    </motion.div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const DNAClientes = () => {
  const { clients } = useAppContext();
  const [selectedId, setSelectedId] = useState<string | null>(clients[0]?.id ?? null);
  const [search, setSearch] = useState('');

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const selected = clients.find(c => c.id === selectedId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full overflow-hidden" style={{ background: 'var(--surface-0)' }}>
      {/* Sidebar de clientes */}
      <div className="w-64 flex-shrink-0 border-r border-[#222] bg-[#0d0d0d] flex flex-col">
        <div className="p-4 border-b border-[#222]">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> DNA dos Clientes
          </h2>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..."
            className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 placeholder-gray-600" />
        </div>
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {filtered.map(client => (
            <button key={client.id} onClick={() => setSelectedId(client.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${selectedId === client.id ? 'bg-primary/10 border-l-2 border-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/40 to-blue-600/40 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{client.name}</p>
                <p className="text-[11px] text-gray-600 truncate">{(client as any).segmento || 'Sem segmento'}</p>
              </div>
              {selectedId === client.id && <ChevronRight className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-600 text-sm">Nenhum cliente encontrado</div>
          )}
        </div>
      </div>

      {/* Painel principal */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {selected ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-blue-600/30 border border-primary/20 flex items-center justify-center text-white font-bold text-xl">
                {selected.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{selected.name}</h1>
                <p className="text-sm text-gray-500">Painel DNA — todas as informações vitais do cliente</p>
              </div>
            </div>
            <ClientPanel clientId={selected.id} clientName={selected.name} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Selecione um cliente para ver o DNA</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DNAClientes;
