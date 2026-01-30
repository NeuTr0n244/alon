import type { Metadata } from 'next';
import './globals.css';
import { VoiceProvider } from '@/contexts/VoiceContext';

export const metadata: Metadata = {
  title: 'Pump Trenches - Real-time Token Monitor',
  description: 'Monitor new and migrated tokens on Pump.fun in real-time with 3D character announcements',
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
          {children}
        </VoiceProvider>
      </body>
    </html>
  );
}
