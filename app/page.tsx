'use client';

import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewTokensColumn } from '@/components/columns/NewTokensColumn';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { CharacterCanvas } from '@/components/character/CharacterCanvas';
import { CharacterModel } from '@/types/character';
import { LipSyncController } from '@/lib/three/lipSyncController';

function CharacterColumn() {
  const handleCharacterLoad = (model: CharacterModel, lipSyncController: LipSyncController) => {
    console.log('[App] Character loaded');
  };

  return <CharacterCanvas onCharacterLoad={handleCharacterLoad} />;
}

export default function Home() {
  return (
    <WebSocketProvider>
      <MainLayout
        leftColumn={<NewTokensColumn />}
        centerColumn={<CharacterColumn />}
        rightColumn={<KnowledgeBase />}
      />
    </WebSocketProvider>
  );
}
