import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, User, Shield, Bell, Palette, Building2,
  Camera, Eye, EyeOff, Check, Save, Loader2,
  Moon, Sun, Monitor, Globe, Mail, MessageSquare,
  Smartphone, Volume2, VolumeX, Key, AlertTriangle,
  LogOut, Trash2, ChevronRight, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';

type Tab = 'perfil' | 'seguranca' | 'notificacoes' | 'aparencia' | 'empresa' | 'usuarios';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'perfil',       label: 'Meu Perfil',      icon: User },
  { id: 'seguranca',    label: 'Segurança',        icon: Shield },
  { id: 'notificacoes', label: 'Notificações',     icon: Bell },
  { id: 'aparencia',    label: 'Aparência',        icon: Palette },
  { id: 'empresa',      label: 'Empresa',          icon: Building2 },
  { id: 'usuarios',     label: 'Usuários',         icon: Users },
];

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-gray-700'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{children}</h3>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-600">{hint}</p>}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 placeholder-gray-600 transition-all ${props.className || ''}`}
  />
);

// ─── Tab: Perfil ─────────────────────────────────────────────────────────────
const TabPerfil = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    email: profile?.email || '',
    phone: '',
    jobTitle: '',
    bio: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const initials = form.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    if (supabase && profile) {
      await supabase.from('profiles').update({ full_name: form.fullName }).eq('id', profile.id);
    }
    setIsSaving(false);
    showToast('Perfil atualizado com sucesso!');
  };

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/60 to-purple-600/60 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full rounded-2xl object-cover" /> : initials}
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#2a2a2a] border border-white/10 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" />
        </div>
        <div>
          <p className="text-white font-semibold">{form.fullName || 'Seu Nome'}</p>
          <p className="text-sm text-gray-500">{profile?.role}</p>
          <button onClick={() => avatarInputRef.current?.click()} className="text-xs text-primary hover:underline mt-1">
            Alterar foto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Nome Completo">
          <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Seu nome" />
        </Field>
        <Field label="E-mail" hint="Usado para login e notificações">
          <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
        </Field>
        <Field label="Telefone / WhatsApp">
          <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
        </Field>
        <Field label="Cargo / Função">
          <Input value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} placeholder="Ex: Social Media" />
        </Field>
      </div>

      <Field label="Bio / Apresentação">
        <textarea
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
          rows={3}
          placeholder="Uma breve descrição sobre você..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 placeholder-gray-600 resize-none"
        />
      </Field>

      <div className="flex justify-end pt-2 border-t border-white/[0.06]">
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/80 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

// ─── Tab: Segurança ───────────────────────────────────────────────────────────
const TabSeguranca = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [isSaving, setIsSaving] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleChangePass = async () => {
    if (!form.current || !form.newPass) return showToast('Preencha todos os campos.');
    if (form.newPass !== form.confirm) return showToast('As senhas não coincidem.');
    if (form.newPass.length < 6) return showToast('Mínimo 6 caracteres.');
    setIsSaving(true);
    const { error } = supabase
      ? await supabase.auth.updateUser({ password: form.newPass })
      : { error: null };
    setIsSaving(false);
    if (error) return showToast('Erro ao alterar senha: ' + error.message);
    showToast('Senha alterada com sucesso!');
    setForm({ current: '', newPass: '', confirm: '' });
  };

  const PassInput = ({ field, label }: { field: keyof typeof form; label: string }) => (
    <Field label={label}>
      <div className="relative">
        <Input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          placeholder="••••••••"
          className="pr-10"
        />
        <button onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  );

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Alterar Senha</SectionTitle>
        <div className="space-y-4">
          <PassInput field="current" label="Senha Atual" />
          <PassInput field="newPass" label="Nova Senha" />
          <PassInput field="confirm" label="Confirmar Nova Senha" />
          {form.newPass && form.confirm && form.newPass !== form.confirm && (
            <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Senhas não coincidem</p>
          )}
          <button onClick={handleChangePass} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/80 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {isSaving ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-6">
        <SectionTitle>Autenticação de Dois Fatores</SectionTitle>
        <div className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-white">2FA via App Autenticador</p>
              <p className="text-xs text-gray-500">Adiciona uma camada extra de segurança ao login</p>
            </div>
          </div>
          <Toggle value={twoFactor} onChange={setTwoFactor} />
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-6">
        <SectionTitle>Zona de Perigo</SectionTitle>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-400">Excluir Conta</p>
            <p className="text-xs text-gray-500">Ação irreversível. Todos os dados serão removidos.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors">
            <Trash2 className="w-4 h-4" /> Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Notificações ────────────────────────────────────────────────────────
const TabNotificacoes = () => {
  const [n, setN] = useState({
    emailTarefas: true, emailComentarios: true, emailAprovacoes: true,
    pushTarefas: false, pushComentarios: true, pushReuniao: true,
    somAtivo: true, resumoDiario: false,
  });
  const { showToast } = useToast();
  type Nkey = keyof typeof n;
  const t = (k: Nkey) => setN(p => ({ ...p, [k]: !p[k] }));

  const Row = ({ label, desc, k, icon: Icon }: { label: string; desc: string; k: Nkey; icon: React.ElementType }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <Toggle value={n[k]} onChange={() => t(k)} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Por E-mail</SectionTitle>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4">
          <Row label="Novas tarefas" desc="Quando uma tarefa for atribuída a você" k="emailTarefas" icon={Mail} />
          <Row label="Comentários" desc="Quando alguém comentar em uma tarefa sua" k="emailComentarios" icon={MessageSquare} />
          <Row label="Aprovações" desc="Quando um cliente aprovar ou solicitar alteração" k="emailAprovacoes" icon={Check} />
        </div>
      </div>
      <div>
        <SectionTitle>Push / In-App</SectionTitle>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4">
          <Row label="Alertas de tarefa" desc="Notificações de vencimento próximo" k="pushTarefas" icon={Bell} />
          <Row label="Menções" desc="Quando alguém mencionar você" k="pushComentarios" icon={MessageSquare} />
          <Row label="Reuniões" desc="Lembrete 10 min antes de reuniões" k="pushReuniao" icon={Globe} />
        </div>
      </div>
      <div>
        <SectionTitle>Preferências</SectionTitle>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4">
          <Row label="Sons de notificação" desc="Ativar sons ao receber notificações" k="somAtivo" icon={n.somAtivo ? Volume2 : VolumeX} />
          <Row label="Resumo diário" desc="Receba um e-mail com o resumo do dia às 8h" k="resumoDiario" icon={Mail} />
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={() => showToast('Preferências salvas!')} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/80 rounded-xl text-sm font-bold text-white transition-colors">
          <Save className="w-4 h-4" /> Salvar Preferências
        </button>
      </div>
    </div>
  );
};

// ─── Tab: Aparência ───────────────────────────────────────────────────────────
const TabAparencia = () => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [accent, setAccent] = useState('#E31837');
  const [density, setDensity] = useState<'compact' | 'default' | 'comfortable'>('default');
  const [font, setFont] = useState('Inter');
  const { showToast } = useToast();

  const ACCENTS = ['#E31837', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Tema</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {([
            { v: 'dark',   label: 'Escuro',   icon: Moon },
            { v: 'light',  label: 'Claro',    icon: Sun },
            { v: 'system', label: 'Sistema',  icon: Monitor },
          ] as const).map(({ v, label, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setTheme(v)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                theme === v ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-[#1a1a1a] text-gray-400 hover:border-white/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Cor de Destaque</SectionTitle>
        <div className="flex gap-3 flex-wrap">
          {ACCENTS.map(c => (
            <button
              key={c}
              onClick={() => setAccent(c)}
              className="w-8 h-8 rounded-full transition-all border-2"
              style={{ background: c, borderColor: accent === c ? 'white' : 'transparent', transform: accent === c ? 'scale(1.2)' : 'scale(1)' }}
            />
          ))}
          <div className="flex items-center gap-2">
            <input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent" />
            <span className="text-xs text-gray-500">Personalizado</span>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Densidade</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {(['compact', 'default', 'comfortable'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                density === d ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-[#1a1a1a] text-gray-400'
              }`}
            >
              {d === 'compact' ? 'Compacto' : d === 'default' ? 'Padrão' : 'Espaçado'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Fonte</SectionTitle>
        <select value={font} onChange={e => setFont(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50">
          {['Inter', 'Geist', 'DM Sans', 'Outfit', 'Sora'].map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end pt-2 border-t border-white/[0.06]">
        <button onClick={() => showToast('Aparência salva!')} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/80 rounded-xl text-sm font-bold text-white transition-colors">
          <Save className="w-4 h-4" /> Aplicar
        </button>
      </div>
    </div>
  );
};

// ─── Tab: Empresa ─────────────────────────────────────────────────────────────
const TabEmpresa = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: 'LINE - Agência Digital',
    cnpj: '',
    site: 'linedigital.com.br',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  return (
    <div className="space-y-6">
      <SectionTitle>Dados da Empresa</SectionTitle>
      <div className="grid grid-cols-2 gap-5">
        <Field label="Nome da Empresa">
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="CNPJ">
          <Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
        </Field>
        <Field label="Site">
          <Input value={form.site} onChange={e => setForm({ ...form, site: e.target.value })} placeholder="www.suaempresa.com.br" />
        </Field>
        <Field label="Telefone">
          <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 9999-9999" />
        </Field>
        <Field label="Endereço" >
          <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cidade">
            <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="São Paulo" />
          </Field>
          <Field label="Estado">
            <Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="SP" />
          </Field>
        </div>
      </div>
      <div className="flex justify-end pt-2 border-t border-white/[0.06]">
        <button onClick={() => showToast('Dados da empresa salvos!')} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/80 rounded-xl text-sm font-bold text-white transition-colors">
          <Save className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  defaultTab?: Tab;
}

export const AccountSettingsModal = ({ onClose, defaultTab = 'perfil' }: Props) => {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const { ToastContainer } = useToast();

  const CONTENT: Record<Tab, React.ReactNode> = {
    perfil:       <TabPerfil />,
    seguranca:    <TabSeguranca />,
    notificacoes: <TabNotificacoes />,
    aparencia:    <TabAparencia />,
    empresa:      <TabEmpresa />,
    usuarios:     <div className="text-gray-400 text-sm py-4">Acesse o módulo "Usuários" pela sidebar principal.</div>,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-4xl max-h-[88vh] bg-[#111] border border-white/[0.08] rounded-2xl shadow-2xl flex overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 border-r border-white/[0.06] flex flex-col py-4 bg-[#0d0d0d]">
          <div className="px-4 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Configurações</p>
          </div>
          <nav className="flex flex-col gap-0.5 px-2">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active ? 'bg-white/[0.08] text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : ''}`} strokeWidth={1.75} />
                  {t.label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-600" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
            <h2 className="text-base font-bold text-white">
              {TABS.find(t => t.id === tab)?.label}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {CONTENT[tab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      <ToastContainer />
    </div>
  );
};
