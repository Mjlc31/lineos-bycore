import React from 'react';
import { Layers, FileText, Bookmark, Folder, Plus, Settings } from 'lucide-react';

const Overview = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#141414] p-6 overflow-y-auto">
      {/* Banner */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-md p-3 mb-6 flex items-center justify-between">
        <span className="text-sm text-gray-300">
          Aproveite ao máximo a sua visão geral! Adicione, reordene e redimensione cartões para personalizar esta página <a href="#" className="text-purple-400 hover:underline">Começar</a>
        </span>
        <button className="text-gray-500 hover:text-gray-300"><Plus className="w-4 h-4 rotate-45" /></button>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#2b2b2b] hover:bg-[#333333] rounded text-gray-300 transition-colors border border-[#333]">
          <Settings className="w-4 h-4" /> Filtros
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Atualização: agora há pouco</span>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#2b2b2b] hover:bg-[#333333] rounded text-gray-300 transition-colors border border-[#333]">
            Atualização automática: Ligado
          </button>
          <button className="text-sm text-gray-400 hover:text-gray-200 px-2">Personalizar</button>
          <button className="bg-white text-black text-sm font-medium px-3 py-1.5 rounded hover:bg-gray-200 transition-colors">
            Adicionar cartão
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Recent */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-lg p-4 min-h-[250px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-200 mb-auto">Recent</h3>
          <div className="flex flex-col items-center justify-center flex-1 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#2b2b2b] flex items-center justify-center">
              <Layers className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">Seus itens abertos recentemente serão exibidos aqui.</p>
            <button className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-200 transition-colors">
              Saiba mais
            </button>
          </div>
        </div>

        {/* Docs */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-lg p-4 min-h-[250px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-200 mb-auto">Docs</h3>
          <div className="flex flex-col items-center justify-center flex-1 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#2b2b2b] flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">Ainda não há documentos nesta localização.</p>
            <button className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-200 transition-colors">
              Adicionar documento
            </button>
          </div>
        </div>

        {/* Bookmarks */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-lg p-4 min-h-[250px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-200 mb-auto">Bookmarks</h3>
          <div className="flex flex-col items-center justify-center flex-1 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#2b2b2b] flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">Os favoritos facilitam salvar itens da ClickUp ou qualquer URL da web.</p>
            <button className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-200 transition-colors">
              Adicionar favorito
            </button>
          </div>
        </div>
      </div>

      {/* Folders */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-lg p-4 min-h-[250px] flex flex-col">
        <h3 className="text-sm font-semibold text-gray-200 mb-auto">Folders</h3>
        <div className="flex flex-col items-center justify-center flex-1 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#2b2b2b] flex items-center justify-center">
            <Folder className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400">Adicionar nova pasta ao seu espaço</p>
          <button className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-200 transition-colors">
            Adicionar pasta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
