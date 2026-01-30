'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from '../Footer';

interface MainLayoutProps {
  leftColumn: ReactNode;
  centerColumn: ReactNode;
  rightColumn: ReactNode;
}

export function MainLayout({ leftColumn, centerColumn, rightColumn }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <main className="flex-1 overflow-hidden" style={{ paddingBottom: '32px' }}>
        <div className="h-full grid grid-cols-3 gap-0">
          {/* Left Column - New Tokens */}
          <div className="border-r border-[#1a1a1a] overflow-hidden flex flex-col">
            {leftColumn}
          </div>

          {/* Center Column - 3D Character */}
          <div className="border-r border-[#1a1a1a] overflow-hidden flex items-center justify-center bg-background">
            {centerColumn}
          </div>

          {/* Right Column - Migrated Tokens */}
          <div className="overflow-hidden flex flex-col">
            {rightColumn}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
