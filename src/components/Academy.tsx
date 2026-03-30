import React, { useState } from 'react';
import { Play, Clock, ChevronRight, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const trilhas = [
  { id: 1, img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=2070&auto=format&fit=crop', title: 'Onboarding', duration: '2h 30m', videos: 5 },
  { id: 2, img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop', title: 'Gestão de Tráfego', duration: '5h 15m', videos: 12 },
  { id: 3, img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop', title: 'Design & Criativos', duration: '3h 45m', videos: 8 },
  { id: 4, img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop', title: 'Atendimento', duration: '1h 20m', videos: 3 },
];

const Academy = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const openVideo = (title) => {
    setActiveVideo(title);
    setIsVideoOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 h-full overflow-auto bg-[#0a0a0a] text-white"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">LINE Academy</h1>
          <p className="text-gray-400 text-sm">Base de conhecimento e treinamentos internos para nivelamento da equipe.</p>
        </div>

        {/* Hero */}
        <div 
          className="relative rounded-2xl overflow-hidden mb-10 h-[360px] group cursor-pointer"
          onClick={() => openVideo('Como conduzir uma Reunião de Kickoff Perfeita')}
        >
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
          
          <div className="absolute inset-0 p-10 flex flex-col justify-center max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Novo Lançamento</span>
              <span className="text-gray-300 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> 45 min</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">Como conduzir uma Reunião de Kickoff Perfeita</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-xl">
              Aprenda o passo a passo exato que utilizamos na LINE para encantar o cliente na primeira reunião e alinhar todas as expectativas do projeto.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2 w-fit hover:bg-gray-200 transition-colors">
              <Play className="w-4 h-4 fill-black" /> Assistir Agora
            </button>
          </div>
        </div>

        {/* Trilhas */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" /> Trilhas de Conhecimento
          </h3>
          <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
            Ver todas <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {trilhas.map((trilha) => (
            <motion.div 
              key={trilha.id} 
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
              onClick={() => openVideo(`Trilha: ${trilha.title}`)}
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                <img src={trilha.img} alt={trilha.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              </div>
              <h4 className="font-medium text-sm group-hover:text-red-400 transition-colors">{trilha.title}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {trilha.duration}</span>
                <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {trilha.videos} aulas</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#141414] border border-[#333] rounded-2xl overflow-hidden w-full max-w-5xl shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#333]">
                <h3 className="font-semibold text-lg">{activeVideo}</h3>
                <button 
                  onClick={() => setIsVideoOpen(false)}
                  className="p-2 hover:bg-[#222] rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Simulação de Player de Vídeo</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-medium mb-2">Sobre esta aula</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Nesta aula, você aprenderá os conceitos fundamentais sobre {activeVideo?.replace('Trilha: ', '')}. 
                  Certifique-se de fazer anotações e completar os exercícios propostos no final do módulo.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Academy;
