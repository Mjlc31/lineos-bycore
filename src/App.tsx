import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ClickUpInterface from './components/ClickUpInterface';
import LineOsSidebar, { LineOsTab } from './components/LineOsSidebar';
import LineOsTopBar from './components/LineOsTopBar';
import AprovacaoConteudo from './components/AprovacaoConteudo';
import CrmVendas from './components/CrmVendas';
import FinanceiroDre from './components/FinanceiroDre';
import Academy from './components/Academy';
import Agendamento from './components/Agendamento';
import CommandPalette from './components/CommandPalette';

import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<LineOsTab>('dashboard');
  const [showPalette, setShowPalette] = useState(false);

  // Global Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleNavigate = useCallback((tab: LineOsTab) => {
    setActiveTab(tab);
    setShowPalette(false);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'gestor':
        return <ClickUpInterface />;
      case 'aprovacao':
        return <AprovacaoConteudo />;
      case 'crm':
        return <CrmVendas />;
      case 'financeiro':
        return <FinanceiroDre />;
      case 'academy':
        return <Academy />;
      case 'agendamento':
        return <Agendamento />;
      default:
        return <div className="p-8 text-white">Em desenvolvimento...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-200 overflow-hidden font-sans">
      <LineOsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <LineOsTopBar
          activeTab={activeTab}
          onOpenPalette={() => setShowPalette(true)}
        />
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        onNavigate={handleNavigate}
        activeTab={activeTab}
      />
    </div>
  );
}

export default App;
