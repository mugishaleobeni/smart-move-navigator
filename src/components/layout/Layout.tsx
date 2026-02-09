import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { OfflineBanner } from '@/components/offline/OfflineBanner';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      <AIAssistant />
    </div>
  );
}
