/**
 * RichTextEditor — Editor rico com TipTap
 * Suporta: negrito, itálico, sublinhado, cor do texto, fundo colorido
 * Inspirado no ClickUp/Notion
 */
import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, Underline as UnderlineIcon, Highlighter, Palette, Type } from 'lucide-react';

// ─── Paletas de cores disponíveis ─────────────────────────────────────────────
const TEXT_COLORS = [
  { label: 'Padrão', value: '' },
  { label: 'Vermelho', value: '#ef4444' },
  { label: 'Laranja', value: '#f97316' },
  { label: 'Amarelo', value: '#eab308' },
  { label: 'Verde', value: '#22c55e' },
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Roxo', value: '#a855f7' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Cinza', value: '#6b7280' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Nenhum', value: '' },
  { label: 'Vermelho', value: '#7f1d1d' },
  { label: 'Laranja', value: '#7c2d12' },
  { label: 'Amarelo', value: '#713f12' },
  { label: 'Verde', value: '#14532d' },
  { label: 'Azul', value: '#1e3a5f' },
  { label: 'Roxo', value: '#4a1d96' },
  { label: 'Rosa', value: '#831843' },
];

// ─── Componente de paleta de cores ────────────────────────────────────────────
const ColorPicker = ({
  colors,
  onSelect,
  onClose,
}: {
  colors: { label: string; value: string }[];
  onSelect: (val: string) => void;
  onClose: () => void;
}) => (
  <div
    className="absolute z-50 top-full left-0 mt-1 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl p-3 flex flex-wrap gap-2 w-48"
    onMouseLeave={onClose}
  >
    {colors.map((c) => (
      <button
        key={c.value}
        title={c.label}
        onClick={() => { onSelect(c.value); onClose(); }}
        className="w-6 h-6 rounded-full border-2 border-[#444] hover:border-white transition-all"
        style={{ background: c.value || '#888', opacity: c.value ? 1 : 0.3 }}
      />
    ))}
  </div>
);

// ─── Botão da toolbar ─────────────────────────────────────────────────────────
const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded transition-colors ${
      active
        ? 'bg-white/20 text-white'
        : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

// ─── Componente Principal ──────────────────────────────────────────────────────
interface RichTextEditorProps {
  value?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Escreva algo...',
  minHeight = '80px',
  className = '',
}) => {
  const [showTextColors, setShowTextColors] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'outline-none text-sm text-white',
        style: `min-height: ${minHeight}; padding: 10px 12px;`,
      },
    },
  });

  if (!editor) return null;

  return (
    <div
      className={`bg-[#1e1e1e] border border-[#333] rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-colors ${className}`}
    >
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#2a2a2a] flex-wrap">
        <ToolbarButton
          title="Negrito (Ctrl+B)"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Itálico (Ctrl+I)"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Sublinhado (Ctrl+U)"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-[#333] mx-1" />

        {/* Cor do texto */}
        <div className="relative">
          <ToolbarButton
            title="Cor do texto"
            active={showTextColors}
            onClick={() => { setShowTextColors(v => !v); setShowHighlights(false); }}
          >
            <Palette className="w-3.5 h-3.5" />
          </ToolbarButton>
          {showTextColors && (
            <ColorPicker
              colors={TEXT_COLORS}
              onSelect={(color) => {
                if (color) {
                  editor.chain().focus().setColor(color).run();
                } else {
                  editor.chain().focus().unsetColor().run();
                }
              }}
              onClose={() => setShowTextColors(false)}
            />
          )}
        </div>

        {/* Fundo colorido (highlight) */}
        <div className="relative">
          <ToolbarButton
            title="Cor de fundo"
            active={showHighlights}
            onClick={() => { setShowHighlights(v => !v); setShowTextColors(false); }}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </ToolbarButton>
          {showHighlights && (
            <ColorPicker
              colors={HIGHLIGHT_COLORS}
              onSelect={(color) => {
                if (color) {
                  editor.chain().focus().setHighlight({ color }).run();
                } else {
                  editor.chain().focus().unsetHighlight().run();
                }
              }}
              onClose={() => setShowHighlights(false)}
            />
          )}
        </div>

        <div className="w-px h-4 bg-[#333] mx-1" />

        {/* Sem formatação */}
        <ToolbarButton
          title="Remover formatação"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <Type className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      {/* ── Área de edição ── */}
      <EditorContent editor={editor} />

      {/* Placeholder manual (TipTap não tem placeholder built-in sem plugin extra) */}
      {editor.isEmpty && (
        <div
          className="absolute pointer-events-none text-sm text-gray-600 px-3 py-2.5"
          style={{ top: '42px' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
