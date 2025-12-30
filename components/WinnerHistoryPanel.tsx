'use client';

import React from 'react';
import { CSVRow, Gift } from '@/lib/types';

interface WinnerHistoryPanelProps {
  winners: { index: number | null; data: CSVRow; displayValue: string; gift: Gift }[];
  displayColumn: string;
  isFullscreen: boolean;
}

export default function WinnerHistoryPanel({
  winners,
  displayColumn,
  isFullscreen,
}: WinnerHistoryPanelProps) {
  if (winners.length === 0) return null;

  const giftLabels: Record<Gift, { emoji: string; label: string }> = {
    airpods: { emoji: '🎧', label: 'AirPods' },
    smart_watch: { emoji: '⌚', label: 'Watch' },
    iphone_17_pro_max: { emoji: '📱', label: 'iPhone 17' },
  };

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed left-2 top-16 bottom-20 w-56 z-40'
          : 'fixed left-2 top-2 bottom-20 w-52'
      } bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-zinc-700 shadow-2xl overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <span>🏆</span>
          <span>الفائزون ({winners.length})</span>
        </h3>
      </div>

      {/* Winners List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {winners.map((winner, idx) => {
          const giftInfo = giftLabels[winner.gift];
          
          return (
            <div
              key={`${winner.index}-${winner.gift}`}
              className="bg-zinc-800/80 rounded-lg p-2 border border-zinc-700 hover:border-green-500/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate text-xs">
                    {winner.displayValue}
                  </p>
                  {/* Show gift label */}
                  <p className="text-yellow-400 text-xs truncate mt-0.5 flex items-center gap-1">
                    <span>{giftInfo.emoji}</span>
                    <span>{giftInfo.label}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 bg-zinc-800/50 border-t border-zinc-700">
        <p className="text-zinc-400 text-xs text-center">
          إجمالي: {winners.length}
        </p>
      </div>
    </div>
  );
}
