'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    // Se parece com um CA (endereço Solana - geralmente 32-44 caracteres)
    if (trimmed.length >= 32) {
      console.log('[SearchBar] Opening token by CA:', trimmed);
      window.open(`https://pump.fun/coin/${trimmed}`, '_blank');
    } else {
      // Pesquisa por nome
      console.log('[SearchBar] Searching by name:', trimmed);
      window.open(`https://pump.fun/?search=${encodeURIComponent(trimmed)}`, '_blank');
    }

    // Clear input after search
    setQuery('');
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center">
      <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 gap-2 min-w-[300px] hover:border-[#444] transition-colors">
        <Search className="w-4 h-4 text-[#666] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by name or CA..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-[#666]"
        />
        <span className="bg-[#333] text-[#666] px-2 py-0.5 rounded text-xs flex-shrink-0">
          /
        </span>
      </div>
    </form>
  );
}
