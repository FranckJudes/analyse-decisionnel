import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import CustomizeButton from '../customizer/CustomizeButton';
import CustomizerPanel from '../customizer/CustomizerPanel';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        {children}
      </main>

      <CustomizeButton />
      <CustomizerPanel />
    </div>
  );
}
