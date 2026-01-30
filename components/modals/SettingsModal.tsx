'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const themes = [
  { name: 'Terminal', colors: { bg: '#0a0a0a', card: '#1a1a1a', accent: '#00ff00' } },
  { name: 'Dark', colors: { bg: '#0d0d0d', card: '#1a1a1a', accent: '#ffffff' } },
  { name: 'Grey', colors: { bg: '#1a1a1a', card: '#2a2a2a', accent: '#888888' } },
  { name: 'Green', colors: { bg: '#0a1a0a', card: '#1a2a1a', accent: '#00ff00' } },
  { name: 'Purple', colors: { bg: '#1a0a1a', card: '#2a1a2a', accent: '#b366ff' } },
  { name: 'Monokai', colors: { bg: '#272822', card: '#3e3d32', accent: '#f92672' } },
  { name: 'Violet', colors: { bg: '#1a0a2e', card: '#2a1a3e', accent: '#9d4edd' } },
  { name: 'Indigo', colors: { bg: '#0a0a2e', card: '#1a1a3e', accent: '#5e60ce' } },
  { name: 'Noir', colors: { bg: '#000000', card: '#111111', accent: '#ffffff' } },
  { name: 'Custom', colors: { bg: '#0a0a0a', card: '#1a1a1a', accent: '#00ff00' } },
];

const fonts = [
  { name: 'Padre', family: 'ui-monospace, monospace' },
  { name: 'Geist', family: 'var(--font-geist-sans), sans-serif' },
  { name: 'Inter', family: 'Inter, sans-serif' },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [selectedTheme, setSelectedTheme] = useState('Terminal');
  const [selectedFont, setSelectedFont] = useState('Geist');

  if (!isOpen) return null;

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName);
    const theme = themes.find((t) => t.name === themeName);
    if (theme) {
      document.documentElement.style.setProperty('--bg-primary', theme.colors.bg);
      document.documentElement.style.setProperty('--bg-card', theme.colors.card);
      document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
      localStorage.setItem('theme', themeName);
    }
  };

  const handleFontChange = (fontName: string) => {
    setSelectedFont(fontName);
    const font = fonts.find((f) => f.name === fontName);
    if (font) {
      document.documentElement.style.setProperty('--font-primary', font.family);
      localStorage.setItem('font', fontName);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#1a1a1a] transition-colors"
          >
            <X className="w-5 h-5 text-[#888]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Theme Section */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Theme</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className={`px-4 py-3 rounded border transition-all ${
                    selectedTheme === theme.name
                      ? 'border-[#00ff00] bg-[#1a1a1a]'
                      : 'border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full border border-[#333]"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <span className="text-sm font-medium text-white">{theme.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <div
                      className="w-full h-2 rounded"
                      style={{ backgroundColor: theme.colors.bg }}
                    />
                    <div
                      className="w-full h-2 rounded"
                      style={{ backgroundColor: theme.colors.card }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Font Section */}
          <section>
            <h3 className="text-sm font-semibold text-white mb-3">Font</h3>
            <div className="grid grid-cols-3 gap-2">
              {fonts.map((font) => (
                <button
                  key={font.name}
                  onClick={() => handleFontChange(font.name)}
                  className={`px-4 py-3 rounded border transition-all ${
                    selectedFont === font.name
                      ? 'border-[#00ff00] bg-[#1a1a1a]'
                      : 'border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#1a1a1a]'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  <span className="text-sm font-medium text-white">{font.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1a1a1a] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm font-medium rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
