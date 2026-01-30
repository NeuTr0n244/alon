import type { Metadata } from 'next';
import './globals.css';
import { VoiceProvider } from '@/contexts/VoiceContext';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'ALON TERMINAL',
  description: 'Real-time crypto intelligence terminal. Live market data, news, and AI-powered insights.',
  keywords: ['crypto', 'solana', 'terminal', 'trading', 'pump.fun', 'memecoin'],
  authors: [{ name: 'ALON TERMINAL' }],
  openGraph: {
    title: 'ALON TERMINAL',
    description: 'Real-time crypto intelligence terminal powered by Alon',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <VoiceProvider>
          <Header />
          <main style={{ paddingTop: '100px' }}>
            {children}
          </main>
        </VoiceProvider>
      </body>
    </html>
  );
}
