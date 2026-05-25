import React, { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Music, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimulacaoItem {
  u?: string; // url (fileUrl)
  c?: string; // caption
  e?: string; // email/client name
  t?: string; // type (image/video/audio)
  ch?: string[]; // postChannels
  d?: string; // date
}

export default function SimulacaoView() {
  const [items, setItems] = useState<SimulacaoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('d');
    if (d) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(d)));
        setItems(Array.isArray(decoded) ? decoded : [decoded]);
      } catch (err) {
        console.error('Failed to parse preview data', err);
      }
    }
  }, []);

  // Handle keyboard navigation for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setCurrentIndex(prev => Math.min(items.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length]);

  if (!items || items.length === 0) {
    return (
      <div className="h-screen w-screen bg-[#050507] flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Carregando simulação...</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const username = currentItem.e?.split('@')[0] || 'cliente_oficial';
  const initial = username.charAt(0).toUpperCase() || 'C';

  // Determinar qual "skin" usar (TikTok ou Instagram) com base no primeiro canal
  // Se não houver, assume Instagram como padrão por ser limpo
  const hasTikTok = currentItem.ch?.some(c => c.toLowerCase().includes('tiktok'));
  const skin = hasTikTok ? 'tiktok' : 'instagram';

  const nextSlide = () => setCurrentIndex(prev => Math.min(items.length - 1, prev + 1));
  const prevSlide = () => setCurrentIndex(prev => Math.max(0, prev - 1));

  return (
    <div className="min-h-screen bg-[#050507] sm:bg-zinc-950 flex flex-col items-center justify-center py-0 sm:py-10 font-sans relative overflow-hidden">
      
      {/* Background Blur Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
         {currentItem.t === 'image' || currentItem.t === 'video' ? (
           <img src={currentItem.u} className="w-full h-full object-cover blur-[100px] scale-150" alt="bg blur" />
         ) : null}
         <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Navigation Controls (Desktop) */}
      <div className="absolute inset-y-0 left-4 sm:left-12 flex items-center z-20 pointer-events-none">
        <button 
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white disabled:opacity-0 transition-all pointer-events-auto shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 sm:right-12 flex items-center z-20 pointer-events-none">
        <button 
          onClick={nextSlide}
          disabled={currentIndex === items.length - 1}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white disabled:opacity-0 transition-all pointer-events-auto shadow-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Main Mockup Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-black w-full max-w-[400px] h-[100dvh] sm:h-[800px] sm:rounded-[40px] sm:overflow-hidden sm:border-[8px] border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative z-10"
        >
          
          {skin === 'instagram' ? (
            // INSTAGRAM MOCKUP
            <>
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 z-10 shrink-0">
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

              <div className="w-full bg-black flex-1 flex items-center justify-center overflow-hidden relative">
                {currentItem.t === 'video' ? (
                  <video src={currentItem.u} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : currentItem.t === 'image' || !currentItem.t ? (
                  <img src={currentItem.u} className="w-full h-full object-cover" alt="Post preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                    <Music className="w-12 h-12 text-white/50 mb-3" />
                    <span className="text-white/50 text-sm font-medium">Formato não suportado no preview</span>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 flex flex-col bg-white shrink-0">
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
                <div className="text-sm text-black flex flex-col gap-1 max-h-[100px] overflow-y-auto custom-scrollbar">
                  <p>
                    <span className="font-semibold mr-2">{username}</span>
                    <span className="whitespace-pre-wrap">{currentItem.c}</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            // TIKTOK MOCKUP
            <>
              <div className="absolute inset-0 bg-black z-0">
                {currentItem.t === 'video' ? (
                  <video src={currentItem.u} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : currentItem.t === 'image' || !currentItem.t ? (
                  <img src={currentItem.u} className="w-full h-full object-cover" alt="Post preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                    <Music className="w-12 h-12 text-white/50 mb-3" />
                  </div>
                )}
              </div>
              
              {/* Overlay Gradients */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-10 pointer-events-none" />

              {/* Top Bar */}
              <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-20 text-white font-semibold">
                <span className="text-lg opacity-90">LIVE</span>
                <div className="flex gap-4 opacity-90">
                  <span className="opacity-70">Following</span>
                  <span className="border-b-2 border-white pb-1">For You</span>
                </div>
                <Share2 className="w-5 h-5 opacity-90" />
              </div>

              {/* Right Sidebar */}
              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white">
                    <span className="text-lg font-bold text-gray-800">{initial}</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-500 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    +
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Heart className="w-8 h-8 text-white drop-shadow-md fill-white" />
                  <span className="text-white text-xs font-semibold drop-shadow-md">84.2K</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <MessageCircle className="w-8 h-8 text-white drop-shadow-md fill-white" />
                  <span className="text-white text-xs font-semibold drop-shadow-md">1024</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Bookmark className="w-8 h-8 text-white drop-shadow-md fill-white" />
                  <span className="text-white text-xs font-semibold drop-shadow-md">409</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Share2 className="w-8 h-8 text-white drop-shadow-md fill-white" />
                  <span className="text-white text-xs font-semibold drop-shadow-md">120</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-zinc-800 border-[10px] border-zinc-900 animate-[spin_4s_linear_infinite] flex items-center justify-center mt-2">
                  <Music className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Bottom Content Info */}
              <div className="absolute bottom-4 left-4 right-20 z-20 flex flex-col gap-2 text-white">
                <h3 className="font-bold text-base drop-shadow-md">@{username}</h3>
                <p className="text-sm font-medium drop-shadow-md line-clamp-3">
                  {currentItem.c}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Music className="w-4 h-4 drop-shadow-md" />
                  <span className="text-sm font-medium drop-shadow-md animate-[pulse_2s_linear_infinite]">Som original - @{username}</span>
                </div>
              </div>
            </>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Indicator */}
      <div className="absolute bottom-4 sm:bottom-12 flex items-center justify-center gap-2 z-20">
        {items.map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white scale-125' : 'bg-white/30'}`}
          />
        ))}
      </div>
      
      {/* Post count badge */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white font-medium shadow-xl border border-white/10 z-20 flex items-center gap-2">
        <span className="text-xs uppercase tracking-wider opacity-70">Simulação</span>
        <div className="w-1 h-1 bg-white/30 rounded-full" />
        <span>{currentIndex + 1} de {items.length}</span>
      </div>

    </div>
  );
}
