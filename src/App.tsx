import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import LoginPage from './components/LoginPage';
import LineLogo from './components/LineLogo';
import { useAuth } from './context/AuthContext';
import ApprovalClientView from './components/ApprovalClientView';
import UserManagement from './components/UserManagement';
import RhCatalogo from './components/RhCatalogo';
import InstagramPreview from './components/InstagramPreview';
import SimulacaoView from './components/SimulacaoView';

function MainLayout() {
  const [showPalette, setShowPalette] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Mapeia pathname para a aba ativa para retrocompatibilidade com componentes filhos
  const pathnameToTab = (path: string): LineOsTab => {
    const route = path.replace('/', '');
    return (route === '' ? 'dashboard' : route) as LineOsTab;
  };
  const activeTab = pathnameToTab(location.pathname);

  const handleNavigate = useCallback((tab: LineOsTab) => {
    navigate(tab === 'dashboard' ? '/' : `/${tab}`);
    setShowPalette(false);
  }, [navigate]);

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

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--surface-0)', color: 'var(--text-secondary)' }}>
      <LineOsSidebar activeTab={activeTab} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <LineOsTopBar
          activeTab={activeTab}
          onOpenPalette={() => setShowPalette(true)}
        />
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full w-full"
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Dashboard onNavigate={handleNavigate} />} />
                <Route path="/gestor" element={<ClickUpInterface />} />
                <Route path="/aprovacao" element={<AprovacaoConteudo />} />
                <Route path="/crm" element={<CrmVendas />} />
                <Route path="/financeiro" element={<FinanceiroDre />} />
                <Route path="/academy" element={<Academy />} />
                <Route path="/agendamento" element={<Agendamento />} />
                <Route path="/usuarios" element={<UserManagement />} />
                <Route path="/rh" element={<RhCatalogo />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
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

function App() {
  const { session, profile, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050507]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 blur-2xl bg-[#E31837]/20 rounded-full"
            />
            <div className="relative bg-[#0f0f12] p-6 rounded-2xl border border-white/5 shadow-2xl">
              <LineLogo className="w-12 h-12 text-[#E31837]" />
            </div>
            <div className="absolute -inset-2 border border-[#E31837]/20 rounded-3xl animate-pulse" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-[#fafafa] font-bold tracking-[0.2em] text-sm font-sans">LINE OS</h2>
            <div className="flex items-center justify-center gap-1">
              <span className="w-1 h-1 bg-[#E31837] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-[#E31837] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-[#E31837] rounded-full animate-bounce" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/preview/instagram/*" element={<InstagramPreview />} />
      <Route path="/simulacao/*" element={<SimulacaoView />} />
      
      <Route path="*" element={
        !session ? (
          <LoginPage />
        ) : profile?.role === 'CLIENTE' ? (
          <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--surface-0)', color: 'var(--text-secondary)' }}>
            <main className="flex-1 overflow-hidden relative">
              <ApprovalClientView />
            </main>
          </div>
        ) : (
          <MainLayout />
        )
      } />
    </Routes>
  );
}

export default App;
