/**
 * LeadModal — Modal completo do lead no CRM
 * Ajuste 1: Upload de arquivos (foto, vídeo, PDF, DOCX, CSV, XLSX) via Supabase Storage
 * Ajuste 4: Editor rico (negrito, itálico, sublinhado, cor) nas notas e atividades
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X, Building2, Mail, Phone, Calendar,
  DollarSign, Target, AlignLeft, Activity, Users, Send, History,
  Paperclip, FileText, FileSpreadsheet, Image as ImageIcon,
  Video, File, Trash2, Loader2, Upload
} from 'lucide-react';
import { Lead } from '../types';
import useEscapeKey from '../hooks/useEscapeKey';
import { supabase } from '../lib/supabase';
import { RichTextEditor } from './ui/RichTextEditor';

// ─── Tipos de anexo ────────────────────────────────────────────────────────────
export interface LeadAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'docx' | 'csv' | 'xlsx' | 'file';
  size: number;
  url: string;
  uploadedAt: string;
}

const BUCKET = 'lead-attachments';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFileType(file: File): LeadAttachment['type'] {
  const mime = file.type;
  const name = file.name.toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'pdf';
  if (name.endsWith('.docx') || name.endsWith('.doc')) return 'docx';
  if (name.endsWith('.csv')) return 'csv';
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'xlsx';
  return 'file';
}

function FileTypeIcon({ type }: { type: LeadAttachment['type'] }) {
  const cls = 'w-5 h-5 flex-shrink-0';
  switch (type) {
    case 'image': return <ImageIcon className={`${cls} text-blue-400`} />;
    case 'video': return <Video className={`${cls} text-purple-400`} />;
    case 'pdf':   return <FileText className={`${cls} text-red-400`} />;
    case 'docx':  return <FileText className={`${cls} text-blue-300`} />;
    case 'csv':   return <FileSpreadsheet className={`${cls} text-green-400`} />;
    case 'xlsx':  return <FileSpreadsheet className={`${cls} text-emerald-400`} />;
    default:      return <File className={`${cls} text-gray-400`} />;
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUpdate: (id: string, updates: Partial<Lead>) => void;
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, lead, onUpdate }) => {
  useEscapeKey(onClose, isOpen);

  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [newActivity, setNewActivity] = useState('');
  const [attachments, setAttachments] = useState<LeadAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lead) {
      setFormData({
        title: lead.title || '',
        value: lead.value || 0,
        contactName: lead.contactName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || '',
        notes: lead.notes || '',
        tags: lead.tags || [],
      });
      // Carregar anexos existentes do lead (campo attachments no futuro)
      setAttachments((lead as any).attachments || []);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleChange = (field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onUpdate(lead.id, { [field]: value });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      const newTags = [...(formData.tags || []), newTag];
      setFormData(prev => ({ ...prev, tags: newTags }));
      onUpdate(lead.id, { tags: newTags });
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = (formData.tags || []).filter(t => t !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: newTags }));
    onUpdate(lead.id, { tags: newTags });
  };

  // ── Upload de arquivo (Supabase Storage) ────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    const newAttachments: LeadAttachment[] = [];

    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split('.').pop();
        const path = `leads/${lead.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        if (supabase) {
          const { error: uploadErr } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { cacheControl: '3600', upsert: false });

          if (uploadErr) throw uploadErr;

          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

          newAttachments.push({
            id: `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: getFileType(file),
            size: file.size,
            url: urlData.publicUrl,
            uploadedAt: new Date().toISOString(),
          });
        } else {
          // Fallback local: objeto URL
          newAttachments.push({
            id: `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: getFileType(file),
            size: file.size,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.error('[LeadModal] Upload falhou:', err);
        setUploadError(`Erro ao enviar "${file.name}": ${err.message}`);
      }
    }

    const updated = [...attachments, ...newAttachments];
    setAttachments(updated);
    onUpdate(lead.id, { attachments: updated } as any);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteAttachment = async (att: LeadAttachment) => {
    // Remover do Storage se for URL do Supabase
    if (supabase && att.url.includes('supabase')) {
      try {
        // Extrair path do URL
        const parts = att.url.split(`/${BUCKET}/`);
        if (parts[1]) {
          await supabase.storage.from(BUCKET).remove([parts[1]]);
        }
      } catch (err) {
        console.error('[LeadModal] Falha ao remover arquivo do storage:', err);
      }
    }
    const updated = attachments.filter(a => a.id !== att.id);
    setAttachments(updated);
    onUpdate(lead.id, { attachments: updated } as any);
  };

  const handleAddActivity = () => {
    if (!newActivity.trim()) return;
    const newAct = {
      id: `act-${Date.now()}`,
      type: 'note' as const,
      content: newActivity.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    const activities = [...(lead.activities || []), newAct];
    handleChange('activities', activities);
    setNewActivity('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-5xl bg-[#141414] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-6 border-b border-[#2b2b2b]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b border-blue-500 placeholder-gray-600 w-64"
                  placeholder="Nome da Empresa/Lead..."
                />
                <span className="bg-[#2b2b2b] text-gray-400 text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider">
                  {lead.source || 'Novo Lead'}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-sm text-green-500 flex items-center gap-1 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                  <DollarSign className="w-3.5 h-3.5" />
                  <input
                    type="number"
                    value={formData.value || ''}
                    onChange={(e) => handleChange('value', parseFloat(e.target.value))}
                    className="bg-transparent focus:outline-none w-24 text-green-500"
                  />
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> Criado em: {lead.date}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-[#1e1e1e] hover:bg-[#2b2b2b] rounded-lg transition-colors border border-[#333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Content Split ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* ── Coluna Esquerda (dados + anexos) ──────────────────────────── */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto custom-scrollbar border-r border-[#2b2b2b] space-y-8 bg-[#0a0a0a]">

            {/* Contato */}
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Informações de Contato
              </h3>
              <div className="space-y-3">
                {[
                  { icon: <Users className="w-4 h-4" />, field: 'contactName' as keyof Lead, placeholder: 'Nome do Ponto de Contato', type: 'text' },
                  { icon: <Mail className="w-4 h-4" />, field: 'email' as keyof Lead, placeholder: 'Email Corporativo', type: 'email' },
                  { icon: <Phone className="w-4 h-4" />, field: 'phone' as keyof Lead, placeholder: 'Telefone / WhatsApp', type: 'text' },
                ].map(({ icon, field, placeholder, type }) => (
                  <div key={field} className="flex items-center gap-3 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 focus-within:border-primary/50 transition-colors">
                    <div className="text-gray-500">{icon}</div>
                    <input
                      type={type}
                      value={(formData[field] as string) || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={placeholder}
                      className="bg-transparent flex-1 text-sm text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Origem & Tags */}
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" /> Origem & Segmentação
              </h3>
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Origem do Lead</label>
                  <select
                    value={formData.source || ''}
                    onChange={(e) => handleChange('source', e.target.value)}
                    className="w-full bg-[#141414] border border-[#2b2b2b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">Selecione a origem...</option>
                    <option value="Inbound">Inbound (Site / Ads)</option>
                    <option value="Outbound">Outbound (Prospecção Ativa)</option>
                    <option value="Indicação">Indicação de Cliente</option>
                    <option value="Evento">Evento / Network</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Tags / Nicho</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.tags || []).map((tag, i) => (
                      <span key={i} className="text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded flex items-center gap-1.5 uppercase tracking-wide">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-blue-200">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Adicione tag (ex: Saas, VIP) e tecle Enter..."
                    onKeyDown={handleAddTag}
                    className="w-full bg-[#141414] border border-[#2b2b2b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </section>

            {/* Anotações com editor rico (Ajuste 4) */}
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-orange-400" /> Anotações Base
              </h3>
              <div className="relative">
                <RichTextEditor
                  value={formData.notes || ''}
                  onChange={(html) => handleChange('notes', html)}
                  placeholder="Exigências, dores, budget..."
                  minHeight="120px"
                />
              </div>
            </section>

            {/* ── Anexos (Ajuste 1) ──────────────────────────────────────── */}
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-cyan-400" /> Arquivos Anexados
              </h3>

              {/* Área de upload */}
              <div
                className="border-2 border-dashed border-[#333] rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-xs text-gray-400">Enviando...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Upload className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
                    <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                      Clique para anexar arquivo
                    </p>
                    <p className="text-[10px] text-gray-600">PDF, DOCX, CSV, XLSX, Imagens, Vídeos</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.csv,.xlsx,.xls,image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadError && (
                <p className="text-xs text-red-400 mt-2">{uploadError}</p>
              )}

              {/* Lista de arquivos */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 bg-[#1e1e1e] border border-[#2b2b2b] rounded-lg px-3 py-2 group"
                    >
                      <FileTypeIcon type={att.type} />
                      <div className="flex-1 min-w-0">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white hover:text-primary truncate block transition-colors"
                        >
                          {att.name}
                        </a>
                        <p className="text-[10px] text-gray-500">{formatBytes(att.size)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(att)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400"
                        title="Remover arquivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Coluna Direita (Timeline) ──────────────────────────────────── */}
          <div className="w-full md:w-1/2 flex flex-col bg-[#141414]">
            <div className="p-6 border-b border-[#2b2b2b]">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-500" /> Linha do Tempo e Atividades
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">Registre interações, e-mails, e status.</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#333] before:via-[#333] before:to-transparent">
                {/* Lead Criado */}
                <div className="relative flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#333] bg-[#1e1e1e] text-blue-500 shadow-md shrink-0 z-10">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="ml-4 w-full bg-[#1e1e1e] p-4 rounded-xl border border-[#2b2b2b]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-gray-300 text-sm">Lead Criado</div>
                      <time className="font-medium text-[11px] text-gray-500">{lead.date}</time>
                    </div>
                    <div className="text-[12px] text-gray-400">Adicionado ao pipeline pela primeira vez.</div>
                  </div>
                </div>

                {/* Atividades dinâmicas */}
                {(lead.activities || []).map((act, i) => (
                  <div key={i} className="relative flex items-center group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#333] bg-[#1e1e1e] text-gray-400 shadow-md shrink-0 z-10 group-hover:text-emerald-500 group-hover:border-emerald-500/50 transition-colors">
                      {act.type === 'note' ? <AlignLeft className="w-4 h-4" /> :
                       act.type === 'status_change' ? <Target className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="ml-4 w-full bg-[#1e1e1e] p-4 rounded-xl border border-[#2b2b2b] group-hover:border-[#444] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        {/* Renderizar HTML rico se existir */}
                        <div
                          className="font-bold text-gray-200 text-sm prose-dark"
                          dangerouslySetInnerHTML={{ __html: act.content }}
                        />
                        <time className="font-medium text-[11px] text-gray-500 flex-shrink-0 ml-2">{act.date}</time>
                      </div>
                      {act.type === 'note' && (
                        <div className="text-[12px] text-gray-400 mt-1 bg-[#0a0a0a] p-2 rounded-lg border border-[#333] italic">
                          Anotação registrada.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input de nova atividade com editor rico (Ajuste 4) */}
            <div className="p-4 border-t border-[#2b2b2b] bg-[#0a0a0a]">
              <RichTextEditor
                value={newActivity}
                onChange={setNewActivity}
                placeholder="Registrar nova atividade ou nota..."
                minHeight="40px"
                className="mb-2"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddActivity}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
