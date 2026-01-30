'use client';

import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { MainLayout } from '@/components/layout/MainLayout';
import { TrenchesColumn } from '@/components/columns/TrenchesColumn';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { CharacterCanvas } from '@/components/character/CharacterCanvas';
import { VoiceUnlockPrompt } from '@/components/VoiceUnlockPrompt';
import { XTrackerWidget } from '@/components/XTrackerWidget';

function CharacterColumn() {
  return <CharacterCanvas />;
}

export default function Home() {
  return (
    <WebSocketProvider>
      <VoiceUnlockPrompt />
      <XTrackerWidget />
      <MainLayout
        leftColumn={<TrenchesColumn />}
        centerColumn={<CharacterColumn />}
        rightColumn={<KnowledgeBase />}
      />
    </WebSocketProvider>
  );
}
