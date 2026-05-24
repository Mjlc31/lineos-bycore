import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface PreviewData {
  u?: string; // url (fileUrl)
  c?: string; // caption
  e?: string; // email (clientEmail)
  t?: string; // type
}

export default function InstagramPreview() {
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('d');
    if (d) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(d)));
        setData(decoded);
      } catch (err) {
        console.error('Failed to parse preview data', err);
      }
    }
  }, []);

  if (!data) {
    return <div className="h-screen w-screen bg-black flex items-center justify-center text-white font-sans">Conteúdo inválido ou não encontrado.</div>;
  }

  const username = data.e?.split('@')[0] || 'cliente_oficial';
  const initial = data.e?.charAt(0).toUpperCase() || 'C';

  return (
    <div className="min-h-screen bg-[#fafafa] sm:bg-zinc-900 flex items-center justify-center py-0 sm:py-10 font-sans">
      <div className="bg-white w-full max-w-[400px] h-[100dvh] sm:h-[800px] sm:rounded-[40px] sm:overflow-hidden sm:border-[12px] border-zinc-800 shadow-2xl flex flex-col relative">
        
        {/* Header do Instagram */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
              <div className="w-full h-full bg-white rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                <span className="text-xs font-bold text-gray-800">{initial}</span>
              </div>
            </div>
            <span className="font-semibold text-sm text-black">{username}</span>
          </div>
          <MoreHorizontal className="w-5 h-5 text-black" />
        </div>

        {/* Mídia */}
        <div className="w-full bg-black flex-1 flex items-center justify-center max-h-[500px] overflow-hidden relative">
          {data.t === 'video' ? (
            <video src={data.u} className="w-full h-full object-cover" autoPlay muted loop playsInline />
          ) : data.t === 'image' || !data.t ? (
             <img src={data.u} className="w-full h-full object-cover" alt="Post preview" />
          ) : (
            <div className="text-white text-sm">Mídia não suportada no preview</div>
          )}
        </div>

        {/* Ações e Legenda */}
        <div className="px-4 py-3 flex flex-col bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Heart className="w-6 h-6 text-black" />
              <MessageCircle className="w-6 h-6 text-black" />
              <Send className="w-6 h-6 text-black" />
            </div>
            <Bookmark className="w-6 h-6 text-black" />
          </div>

          <div className="text-sm font-semibold text-black mb-1">
            Curtido por milhares de pessoas
          </div>

          <div className="text-sm text-black mb-4 flex flex-col gap-1">
            <p>
              <span className="font-semibold mr-2">{username}</span>
              <span className="whitespace-pre-wrap">{data.c}</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
