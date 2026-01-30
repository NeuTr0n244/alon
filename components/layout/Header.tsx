'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useVoice } from '@/contexts/VoiceContext';

export function Header() {
  const { isEnabled, isSpeaking, toggleVoice } = useVoice();
  const [activeTab, setActiveTab] = useState('trenches');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const connectWallet = async () => {
    setIsConnecting(true);

    try {
      const { solana } = window as any;

      if (!solana?.isPhantom) {
        window.open('https://phantom.app/', '_blank');
        setIsConnecting(false);
        return;
      }

      const response = await solana.connect();
      const address = response.publicKey.toString();
      const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
      setWalletAddress(shortAddress);
      console.log('✅ Conectado:', address);
    } catch (error) {
      console.error('❌ Erro:', error);
    }

    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    const { solana } = window as any;
    solana?.disconnect();
    setWalletAddress(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const trimmed = searchQuery.trim();
      if (trimmed.length >= 32) {
        // Contract Address
        window.open(`https://pump.fun/coin/${trimmed}`, '_blank');
      } else {
        // Token name
        window.open(`https://pump.fun/?search=${encodeURIComponent(trimmed)}`, '_blank');
      }
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#0a0a0a] border-b border-[#1a1a1a] z-[9999]">
        <div className="flex justify-between items-center px-5 py-2.5">
        {/* Left Side - Logo + Nav */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-[#00ff00] text-xs">●</span>
            <span className="text-[14px] font-bold text-white tracking-wider font-mono">ALON TERMINAL</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              href="/trending"
              className="text-[13px] font-medium text-[#888] hover:text-white transition-colors no-underline"
            >
              Trending
            </Link>
            <Link
              href="/portfolio"
              className="text-[13px] font-medium text-[#888] hover:text-white transition-colors no-underline"
            >
              Portfolio
            </Link>
            <Link
              href="/track"
              className="text-[13px] font-medium text-[#888] hover:text-white transition-colors no-underline"
            >
              Track
            </Link>
            <Link
              href="/rewards"
              className="text-[13px] font-medium text-[#888] hover:text-white transition-colors no-underline"
            >
              Rewards
            </Link>
            <Link
              href="/"
              className="text-[13px] font-medium text-[#888] hover:text-white transition-colors no-underline"
            >
              Trenches
            </Link>
          </nav>
        </div>

        {/* Right Side - Search, Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Paste CA / Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Paste CA or search..."
              className="w-[200px] px-3 py-1.5 text-xs bg-[#111] border border-[#333] rounded-lg text-white placeholder-[#666] focus:border-[#00ff00] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#111] border border-[#333] text-[#888] hover:bg-[#1a1a1a] hover:text-white transition-all"
              title="Search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          {/* X (Twitter) Link */}
          <a
            href="https://x.com/AlonTerminal"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow us on X"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#111] border border-[#333] text-[#888] hover:bg-[#1a1a1a] hover:text-[#1da1f2] transition-all no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* Voice Button */}
          <button
            onClick={toggleVoice}
            title={isSpeaking ? 'Stop Speaking' : isEnabled ? 'Voice ON' : 'Voice OFF'}
            className={`
              w-9 h-9 flex items-center justify-center rounded-lg text-base
              bg-[#111] border transition-all
              ${isEnabled ? 'border-[#00ff00] text-[#00ff00]' : 'border-[#333] text-[#888]'}
              ${isSpeaking ? 'animate-pulse-glow' : 'hover:bg-[#1a1a1a]'}
            `}
          >
            {isSpeaking ? '🔊' : isEnabled ? '🔈' : '🔇'}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#111] border border-[#333] text-[#888] hover:bg-[#1a1a1a] hover:text-white transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M1 12h6m6 0h6m-2.636-7.364l-4.242 4.242m0 4.242l4.242 4.242M6.636 6.636l4.242 4.242m0 4.242L6.636 19.364"/>
            </svg>
          </button>

          {/* Profile Button */}
          <button
            onClick={() => setShowProfile(true)}
            title="Profile"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#111] border border-[#333] text-[#888] hover:bg-[#1a1a1a] hover:text-white transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>

          {/* Connect Wallet Button */}
          {walletAddress ? (
            <button
              onClick={disconnectWallet}
              title="Click to disconnect"
              className="flex items-center gap-2 px-3 py-1.5 h-9 text-xs font-semibold font-mono bg-[#111] border border-[#00ff00] rounded-lg text-[#00ff00] hover:bg-[rgba(0,255,0,0.1)] transition-all"
            >
              <span className="w-1.5 h-1.5 bg-[#00ff00] rounded-full animate-blink"></span>
              {walletAddress}
            </button>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 px-3 py-1.5 h-9 text-xs font-semibold bg-gradient-to-r from-[#00ff00] to-[#00cc00] border-none rounded-lg text-black hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(0,255,0,0.3)] transition-all disabled:opacity-70 disabled:cursor-wait"
            >
              {isConnecting ? (
                <span className="w-3.5 h-3.5 border-2 border-transparent border-t-black rounded-full animate-spin"></span>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                  <path d="M22 10h-4a2 2 0 0 0 0 4h4"/>
                </svg>
              )}
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-[#111] border-2 border-[#333] rounded-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 bg-[#0a0a0a] border-b border-[#333]">
              <h2 className="text-lg font-bold text-white tracking-widest">👤 PROFILE</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-[#666] hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00ff00] to-[#00aa00] flex items-center justify-center text-3xl font-bold text-black">
                  A
                </div>
                <span className="text-sm text-[#888]">Anonymous User</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                  <span className="text-2xl font-bold text-[#00ff00]">0</span>
                  <span className="text-xs text-[#666] uppercase tracking-wider mt-1">Items Read</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                  <span className="text-2xl font-bold text-[#00ff00]">0</span>
                  <span className="text-xs text-[#666] uppercase tracking-wider mt-1">Knowledge</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                  <span className="text-2xl font-bold text-[#00ff00]">--</span>
                  <span className="text-xs text-[#666] uppercase tracking-wider mt-1">Session</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(0, 255, 0, 0);
          }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .animate-pulse-glow {
          animation: pulse-glow 1s infinite;
        }

        .animate-blink {
          animation: blink 2s infinite;
        }
      `}</style>
    </>
  );
}
