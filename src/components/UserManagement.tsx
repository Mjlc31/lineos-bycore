import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Plus, Trash2, Mail, Shield, UserCheck, User,
  Check, X, Eye, EyeOff, RefreshCw, AlertTriangle, Crown, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { useToast } from './Toast';
import { Modal } from './ui/Modal';

type UserRole = 'ADMIN' | 'EQUIPE' | 'CLIENTE';

interface SystemUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  clientId?: string | null;
  clientName?: string | null;
  createdAt: string;
}

const ROLE_CONFIG: Record<UserRole, { label: string; icon: React.ElementType; color: string; bg: string; description: string }> = {
  ADMIN: {
    label: 'Admin',
    icon: Crown,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    description: 'Acesso total ao sistema',
  },
  EQUIPE: {
    label: 'Equipe',
    icon: UserCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    description: 'CRM, Tarefas e Conteúdos',
  },
  CLIENTE: {
    label: 'Cliente',
    icon: User,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    description: 'Portal de aprovação',
  },
};

// ─── Modal de criação de usuário ─────────────────────────────────────────────
interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  clients: { id: string; name: string }[];
}

const CreateUserModal = ({ onClose, onSuccess, clients }: CreateUserModalProps) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'EQUIPE' as UserRole,
    clientId: '',
    sendInvite: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase não configurado.');
      return;
    }
    if (!form.email || !form.fullName) {
      setError('Preencha nome e e-mail.');
      return;
    }
    if (!form.sendInvite && form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (form.role === 'CLIENTE' && !form.clientId) {
      setError('Selecione o cliente vinculado.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (form.sendInvite) {
        // Convite por e-mail (magic link)
        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(form.email, {
          data: {
            full_name: form.fullName,
            role: form.role,
            client_id: form.role === 'CLIENTE' ? form.clientId : null,
          },
        });
        if (inviteError) throw inviteError;
        showToast(`Convite enviado para ${form.email}!`);
      } else {
        // Criação direta com senha definida pela agência
        const { data, error: signUpError } = await supabase.auth.admin.createUser({
          email: form.email,
          password: form.password,
          email_confirm: true,
          user_metadata: {
            full_name: form.fullName,
            role: form.role,
            client_id: form.role === 'CLIENTE' ? form.clientId : null,
          },
        });
        if (signUpError) throw signUpError;

        // Atualiza o perfil com os metadados corretos
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: form.email,
            full_name: form.fullName,
            role: form.role,
          });
        }
        showToast(`Usuário ${form.fullName} criado com sucesso!`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar usuário.';
      setError(msg.includes('email_address_invalid') ? 'E-mail inválido.' :
               msg.includes('User already registered') ? 'Este e-mail já está cadastrado.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClientName = clients.find(c => c.id === form.clientId)?.name;

  return (
    <Modal isOpen={true} onClose={onClose} title="Adicionar Usuário" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
            Nome Completo
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            placeholder="Ex: Ana Lima"
            required
            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-gray-600"
          />
        </div>

        {/* E-mail */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
            E-mail
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="usuario@exemplo.com"
            required
            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-gray-600"
          />
        </div>

        {/* Nível de Acesso */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            Nível de Acesso
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([role, conf]) => {
              const Icon = conf.icon;
              const selected = form.role === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role, clientId: '' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selected ? conf.bg + ' border-opacity-60' : 'bg-[#111] border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${selected ? conf.color : 'text-gray-500'}`} />
                  <p className={`text-xs font-bold ${selected ? 'text-white' : 'text-gray-400'}`}>{conf.label}</p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{conf.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vínculo com cliente (apenas para role CLIENTE) */}
        <AnimatePresence>
          {form.role === 'CLIENTE' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Vincular ao Cliente
              </label>
              <select
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value })}
                required={form.role === 'CLIENTE'}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {selectedClientName && (
                <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Vinculado a: {selectedClientName}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modo de acesso */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm({ ...form, sendInvite: !form.sendInvite })}
              className={`w-10 h-5 rounded-full relative transition-colors ${form.sendInvite ? 'bg-primary' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.sendInvite ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Convidar por e-mail</p>
              <p className="text-[11px] text-gray-500">O usuário define a própria senha pelo link</p>
            </div>
          </label>
        </div>

        {/* Senha manual */}
        <AnimatePresence>
          {!form.sendInvite && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Senha Temporária
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erro */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 pt-2 border-t border-white/5">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/80 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (form.sendInvite ? <Mail className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
            {isLoading ? 'Criando...' : (form.sendInvite ? 'Enviar Convite' : 'Criar Usuário')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const UserManagement = () => {
  const { clients } = useAppContext();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();

  const fetchUsers = useCallback(async () => {
    if (!supabase) {
      // Modo sem Supabase: mostrar usuários mock
      setUsers([
        { id: '1', email: 'arthur@line.com', fullName: 'Arthur de Moraes', role: 'ADMIN', avatarUrl: null, createdAt: new Date().toISOString() },
        { id: '2', email: 'equipe@line.com', fullName: 'Lucas Equipe', role: 'EQUIPE', avatarUrl: null, createdAt: new Date().toISOString() },
      ]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      // Mapear client_id → nome do cliente
      const mapped: SystemUser[] = (data || []).map((p: Record<string, unknown>) => {
        const linkedClient = clients.find(c => c.id === (p.client_id as string));
        return {
          id: p.id as string,
          email: p.email as string,
          fullName: (p.full_name as string) || (p.email as string).split('@')[0],
          role: (p.role as UserRole) || 'EQUIPE',
          avatarUrl: p.avatar_url as string | null,
          clientId: p.client_id as string | null,
          clientName: linkedClient?.name || null,
          createdAt: p.created_at as string,
        };
      });
      setUsers(mapped);
    } catch (err) {
      console.error('[UserManagement] fetchUsers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clients]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (userId: string, userName: string) => {
    if (!supabase) { showToast('Supabase não configurado.'); return; }
    if (!confirm(`Tem certeza que deseja remover "${userName}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(userId);
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`Usuário ${userName} removido com sucesso.`);
    } catch (err) {
      console.error(err);
      showToast('Erro ao remover usuário.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!supabase) return;
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    showToast('Nível de acesso atualizado!');
  };

  const clientsForModal = clients.map(c => ({ id: c.id, name: c.name }));

  const roleGroups: Record<UserRole, SystemUser[]> = {
    ADMIN: users.filter(u => u.role === 'ADMIN'),
    EQUIPE: users.filter(u => u.role === 'EQUIPE'),
    CLIENTE: users.filter(u => u.role === 'CLIENTE'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 lg:p-8 h-full overflow-auto text-white custom-scrollbar"
      style={{ background: 'var(--surface-0)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Gestão de Usuários</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie os acessos e permissões do sistema.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              title="Recarregar"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Adicionar Usuário
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([role, conf]) => {
            const Icon = conf.icon;
            const count = roleGroups[role].length;
            return (
              <div key={role} className={`rounded-2xl border p-4 ${conf.bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/20`}>
                    <Icon className={`w-5 h-5 ${conf.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className="text-xs text-gray-400 font-medium">{conf.label}{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabela de usuários */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span>Carregando usuários...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum usuário encontrado</p>
            <p className="text-sm mt-1">Adicione o primeiro usuário clicando no botão acima.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map(user => {
              const conf = ROLE_CONFIG[user.role];
              const Icon = conf.icon;
              const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const isDeleting = deletingId === user.id;

              return (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-4 bg-[#141414] border border-white/[0.06] rounded-2xl px-5 py-4 hover:border-white/10 transition-all group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-purple-600/40 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" />
                      : initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                      {user.clientName && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                          → {user.clientName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  {/* Role badge + dropdown */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${conf.bg} ${conf.color}`}>
                      <Icon className="w-3 h-3" />
                      {conf.label}
                    </div>
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="opacity-0 group-hover:opacity-100 bg-[#222] border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 outline-none focus:border-primary/50 transition-all w-0 group-hover:w-auto overflow-hidden cursor-pointer"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="EQUIPE">Equipe</option>
                      <option value="CLIENTE">Cliente</option>
                    </select>
                  </div>

                  {/* Data */}
                  <p className="text-[11px] text-gray-600 flex-shrink-0 hidden lg:block">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>

                  {/* Remover */}
                  <button
                    onClick={() => handleDelete(user.id, user.fullName)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remover usuário"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Aviso sobre Admin API */}
        <div className="mt-6 bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-0.5">Nota de Segurança</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              A criação de usuários utiliza a <strong className="text-gray-400">Supabase Admin API</strong>.
              Para funcionar em produção, configure a chave de serviço (<code className="bg-black/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>) em uma Edge Function ou variável de servidor segura.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchUsers}
            clients={clientsForModal}
          />
        )}
      </AnimatePresence>
      <ToastContainer />
    </motion.div>
  );
};

export default UserManagement;
