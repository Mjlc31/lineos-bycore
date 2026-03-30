import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ListView from './ListView';
import Overview from './Overview';
import ClientList from './ClientList';
import SettingsModal from './SettingsModal';
import { ViewType } from '../types';

const ClickUpInterface = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-full w-full bg-[#141414] text-[#d5d6d7] font-sans overflow-hidden selection:bg-purple-500/30">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0 bg-[#141414]">
        <TopBar currentView={currentView} onOpenSettings={() => setShowSettings(true)} />
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          {currentView === 'overview' && <Overview />}
          {currentView === 'tasks' && <ListView />}
          {currentView === 'clients' && <ClientList />}
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default ClickUpInterface;
