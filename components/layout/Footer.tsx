'use client';

import { TrendingUp, Activity, Users } from 'lucide-react';

export function Footer() {
  return (
    <footer className="h-18 bg-card border-t border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Navigation */}
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-text-secondary hover:text-green transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Trending</span>
          </button>
          <button className="flex items-center gap-2 text-text-secondary hover:text-green transition-colors">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Activity</span>
          </button>
          <button className="flex items-center gap-2 text-text-secondary hover:text-green transition-colors">
            <Users className="w-4 h-4" />
            <span className="text-sm">Community</span>
          </button>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Portfolio:</span>
            <span className="text-text font-semibold">$0.00</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">24h Change:</span>
            <span className="text-green font-semibold">+0.00%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
