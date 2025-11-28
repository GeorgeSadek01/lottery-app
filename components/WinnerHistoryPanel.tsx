'use client';

import React from 'react';
import { CSVRow } from '@/lib/types';

interface WinnerHistoryPanelProps {
  winners: { index: number; data: CSVRow; displayValue: string }[];
  displayColumn: string;
  prizeColumn?: string;
  isFullscreen: boolean;
}

export default function WinnerHistoryPanel({
  winners,
  displayColumn,
  prizeColumn,
  isFullscreen,
}: WinnerHistoryPanelProps) {
  if (winners.length === 0) return null;

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed left-4 top-20 bottom-24 w-72 z-40'
          : 'fixed left-4 top-4 bottom-24 w-64'
      } bg-zinc-900/95 backdrop-blur-sm rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <span>🏆</span>
          <span>الفائزون ({winners.length})</span>
        </h3>
      </div>

      {/* Winners List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {winners.map((winner, idx) => {
          const prizeName = prizeColumn && prizeColumn !== '_skip_' 
            ? winner.data[prizeColumn] 
            : null;
          
          return (
            <div
              key={winner.index}
              className="bg-zinc-800/80 rounded-xl p-3 border border-zinc-700 hover:border-green-500/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">
                    {winner.displayValue}
                  </p>
                  {/* Show iPhone model if available */}
                  {prizeName && (
                    <p className="text-yellow-400 text-xs truncate mt-1 flex items-center gap-1">
                      <span>📱</span>
                      <span>{prizeName}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 bg-zinc-800/50 border-t border-zinc-700">
        <p className="text-zinc-400 text-sm text-center">
          إجمالي الفائزين: {winners.length}
        </p>
      </div>
    </div>
  );
}
