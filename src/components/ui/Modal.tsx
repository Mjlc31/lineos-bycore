import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-md'
}) => {
  // Fechar com ESC quando aberto
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevenir rolagem do body quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center isolate">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Main Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-[#141414] border border-white/10 rounded-2xl shadow-2xl glass-panel overflow-hidden z-10 mx-4 flex flex-col max-h-[90vh]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Content Body */}
            <div className="px-6 py-4 overflow-y-auto custom-scrollbar">
              {children}
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
