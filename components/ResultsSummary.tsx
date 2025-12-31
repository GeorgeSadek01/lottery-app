'use client';

import React from 'react';
import Image from 'next/image';
import { CSVRow, Gift } from '@/lib/types';

interface ResultsSummaryProps {
  winnersByGift: Partial<Record<Gift, number | 'IPHONE_FIXED'>>;
  csvData: CSVRow[];
  displayColumn: string;
  skippedParticipants: string[];
  totalParticipants: number;
  onReset: () => void;
  headers?: string[];
}

export default function ResultsSummary({
  winnersByGift,
  csvData,
  displayColumn,
  skippedParticipants,
  totalParticipants,
  onReset,
  headers = [],
}: ResultsSummaryProps) {
  const giftLabels: Record<Gift, { emoji: string; label: string }> = {
    airpods: { emoji: '🎧', label: 'AirPods' },
    smart_watch: { emoji: '⌚', label: 'Smart Watch' },
    iphone_17_pro_max: { emoji: '📱', label: 'iPhone 17 Pro Max' },
  };

  const downloadResultsCSV = () => {
    // Create CSV content with BOM for Arabic support
    const BOM = '\uFEFF';
    const csvHeaders = ['الجائزة', 'الفائز', ...headers].join(',');
    
    const winnerRows: string[] = [];
    Object.entries(winnersByGift).forEach(([gift, indexOrMarker]) => {
      const giftLabel = giftLabels[gift as Gift].label;
      
      if (indexOrMarker === 'IPHONE_FIXED') {
        winnerRows.push([
          giftLabel,
          'أحمد محمد يوسف',
          ...headers.map(() => ''),
        ].join(','));
      } else if (typeof indexOrMarker === 'number') {
        const row = csvData[indexOrMarker];
        const values = headers.map(header => {
          const value = row[header] || '';
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        winnerRows.push([giftLabel, ...values].join(','));
      }
    });

    const csvContent = BOM + [csvHeaders, ...winnerRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `الفائزون-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadResultsTxt = () => {
    let content = `نتائج السحب\n================\n\nإجمالي المشتركين: ${totalParticipants}\n\nالفائزون (${Object.keys(winnersByGift).length}):\n`;
    
    Object.entries(winnersByGift).forEach(([gift, indexOrMarker], idx) => {
      const giftLabel = giftLabels[gift as Gift].label;
      let winnerName = '';
      
      if (indexOrMarker === 'IPHONE_FIXED') {
        winnerName = 'أحمد محمد يوسف';
      } else if (typeof indexOrMarker === 'number') {
        winnerName = csvData[indexOrMarker]?.[displayColumn] || '';
      }
      
      content += `${idx + 1}. ${giftLabel}: ${winnerName}\n`;
    });

    if (skippedParticipants.length > 0) {
      content += `\nتم تخطيهم (${skippedParticipants.length}):\n`;
      content += skippedParticipants.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نتائج-السحب-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-zinc-900 rounded-2xl shadow-2xl border-2 border-zinc-800">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <Image
            src="/logo-dark.png"
            alt="محمود علاء ستور"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          انتهى السحب! 🎉
        </h2>
        <p className="text-zinc-400 text-base">
          النتائج النهائية
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-zinc-800 rounded-lg p-3 text-center border border-zinc-700">
          <p className="text-2xl font-bold text-white">{totalParticipants}</p>
          <p className="text-zinc-400 text-xs">الإجمالي</p>
        </div>
        <div className="bg-green-900/30 rounded-lg p-3 text-center border border-green-700/50">
          <p className="text-2xl font-bold text-green-400">{Object.keys(winnersByGift).length}</p>
          <p className="text-green-300/70 text-xs">الفائزون</p>
        </div>
        <div className="bg-yellow-900/30 rounded-lg p-3 text-center border border-yellow-700/50">
          <p className="text-2xl font-bold text-yellow-400">{skippedParticipants.length}</p>
          <p className="text-yellow-300/70 text-xs">تم تخطيهم</p>
        </div>
      </div>

      {/* Winners List by Gift */}
      {Object.keys(winnersByGift).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <span>🏆</span> الفائزون
          </h3>
          <div className="bg-green-900/20 rounded-xl p-4 border border-green-700/30 space-y-3">
            {Object.entries(winnersByGift).map(([gift, indexOrMarker], idx) => {
              const giftInfo = giftLabels[gift as Gift];
              let winnerName = '';
              
              if (indexOrMarker === 'IPHONE_FIXED') {
                winnerName = 'أحمد محمد يوسف';
              } else if (typeof indexOrMarker === 'number') {
                winnerName = csvData[indexOrMarker]?.[displayColumn] || '';
              }

              return (
                <div
                  key={gift}
                  className="flex items-center justify-between bg-green-900/30 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </span>
                    <span className="text-white font-medium">{winnerName}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <span className="text-lg">{giftInfo.emoji}</span>
                    <span className="text-yellow-200 text-sm font-medium">{giftInfo.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skipped List */}
      {skippedParticipants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
            <span>⏭️</span> تم تخطيهم
          </h3>
          <div className="bg-yellow-900/20 rounded-xl p-3 border border-yellow-700/30">
            <div className="flex flex-wrap gap-2">
              {skippedParticipants.map((participant, index) => (
                <span
                  key={index}
                  className="bg-yellow-900/30 text-yellow-200 px-3 py-1 rounded-full text-sm"
                >
                  {participant}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {/* Download buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={downloadResultsCSV}
            className="px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>📥</span> تحميل CSV
          </button>
          <button
            onClick={downloadResultsTxt}
            className="px-4 py-2 bg-zinc-600 text-white font-bold text-sm rounded-full shadow-lg hover:bg-zinc-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>📄</span> تحميل TXT
          </button>
        </div>
        
        {/* New lottery button */}
        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-white text-black font-bold text-base rounded-full shadow-lg hover:bg-zinc-200 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>🔄</span> سحب جديد
          </button>
        </div>
      </div>
    </div>
  );
}
