import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { motion } from 'motion/react';
import { 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, 
  MinusSquare, Text
} from 'lucide-react';

export const getSuggestionItems = ({ query }: { query: string }) => {
  const commands = [
    {
      title: 'Texto',
      description: 'Texto simples e parágrafos',
      icon: <Text className="w-4 h-4 text-gray-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run();
      },
    },
    {
      title: 'Título 1',
      description: 'Título grande (H1)',
      icon: <Heading1 className="w-4 h-4 text-blue-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Título 2',
      description: 'Título médio (H2)',
      icon: <Heading2 className="w-4 h-4 text-emerald-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Título 3',
      description: 'Título pequeno (H3)',
      icon: <Heading3 className="w-4 h-4 text-purple-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'Lista de Marcadores',
      description: 'Lista simples',
      icon: <List className="w-4 h-4 text-orange-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Lista Numerada',
      description: 'Lista em ordem',
      icon: <ListOrdered className="w-4 h-4 text-yellow-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Citação',
      description: 'Capturar uma citação (Blockquote)',
      icon: <Quote className="w-4 h-4 text-gray-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: 'Divisor',
      description: 'Linha horizontal',
      icon: <MinusSquare className="w-4 h-4 text-gray-400" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ];

  return commands
    .filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 10);
};

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col w-72 overflow-hidden"
    >
      <div className="px-2 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        Comandos Básicos
      </div>
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            key={index}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              index === selectedIndex ? 'bg-primary/20 text-white shadow-sm ring-1 ring-primary/30' : 'text-gray-300 hover:bg-white/5'
            }`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-md ${index === selectedIndex ? 'bg-primary/20' : 'bg-[#2a2a2a]'} border border-white/5`}>
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{item.title}</span>
              <span className="text-[11px] text-gray-500 font-medium">{item.description}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="text-xs text-gray-500 p-3 text-center">Nenhum comando encontrado</div>
      )}
    </motion.div>
  );
});

import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling
import 'tippy.js/animations/shift-away.css';

export const SlashCommands = Extension.create({
  name: 'slashCommands',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
        items: getSuggestionItems,
        render: () => {
          let component: ReactRenderer;
          let popup: any;

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                animation: 'shift-away',
                theme: 'light-border',
              });
            },

            onUpdate(props: any) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }

              return (component.ref as any)?.onKeyDown(props);
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
