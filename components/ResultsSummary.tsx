'use client';

import React from 'react';
import Image from 'next/image';
import { CSVRow } from '@/lib/types';

interface ResultsSummaryProps {
  selectedWinners: string[];
  skippedParticipants: string[];
  totalParticipants: number;
  onReset: () => void;
  // Full data for CSV export
  winnersFullData?: CSVRow[];
  skippedFullData?: CSVRow[];
  headers?: string[];
}

export default function ResultsSummary({
  selectedWinners,
  skippedParticipants,
  totalParticipants,
  onReset,
  winnersFullData = [],
  skippedFullData = [],
  headers = [],
}: ResultsSummaryProps) {
  const downloadResultsTxt = () => {
    const content = `نتائج السحب
================

إجمالي المشتركين: ${totalParticipants}

الفائزون (${selectedWinners.length}):
${selectedWinners.map((w, i) => `${i + 1}. ${w}`).join('\n')}

تم تخطيهم (${skippedParticipants.length}):
${skippedParticipants.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

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

  const downloadWinnersCSV = () => {
    if (winnersFullData.length === 0 || headers.length === 0) {
      downloadResultsTxt();
      return;
    }

    // Create CSV content with BOM for Arabic support
    const BOM = '\uFEFF';
    const csvHeaders = ['رقم الفائز', ...headers].join(',');
    const csvRows = winnersFullData.map((row, index) => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma or newline
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      return [index + 1, ...values].join(',');
    });

    const csvContent = BOM + [csvHeaders, ...csvRows].join('\n');
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

  const downloadAllResultsCSV = () => {
    if (headers.length === 0) {
      downloadResultsTxt();
      return;
    }

    // Create CSV content with BOM for Arabic support
    const BOM = '\uFEFF';
    const csvHeaders = ['الحالة', 'الترتيب', ...headers].join(',');
    
    const winnerRows = winnersFullData.map((row, index) => {
      const values = headers.map(header => {
        const value = row[header] || '';
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      return ['فائز', index + 1, ...values].join(',');
    });

    const skippedRows = skippedFullData.map((row, index) => {
      const values = headers.map(header => {
        const value = row[header] || '';
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      return ['تم تخطيه', index + 1, ...values].join(',');
    });

    const csvContent = BOM + [csvHeaders, ...winnerRows, ...skippedRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `جميع-النتائج-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-zinc-900 rounded-3xl shadow-2xl border-2 border-zinc-800">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <Image
            src="/logo-dark.png"
            alt="محمود علاء ستور"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          انتهى السحب! 🎉
        </h2>
        <p className="text-zinc-400 text-lg">
          النتائج النهائية
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-800 rounded-xl p-4 text-center border border-zinc-700">
          <p className="text-4xl font-bold text-white">{totalParticipants}</p>
          <p className="text-zinc-400 text-sm">الإجمالي</p>
        </div>
        <div className="bg-green-900/30 rounded-xl p-4 text-center border border-green-700/50">
          <p className="text-4xl font-bold text-green-400">{selectedWinners.length}</p>
          <p className="text-green-300/70 text-sm">الفائزون</p>
        </div>
        <div className="bg-yellow-900/30 rounded-xl p-4 text-center border border-yellow-700/50">
          <p className="text-4xl font-bold text-yellow-400">{skippedParticipants.length}</p>
          <p className="text-yellow-300/70 text-sm">تم تخطيهم</p>
        </div>
      </div>

      {/* Winners List */}
      {selectedWinners.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span>🏆</span> الفائزون
          </h3>
          <div className="bg-green-900/20 rounded-xl p-4 border border-green-700/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedWinners.map((winner, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-green-900/30 rounded-lg p-3"
                >
                  <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-white font-medium">{winner}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skipped List */}
      {skippedParticipants.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <span>⏭️</span> تم تخطيهم
          </h3>
          <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-700/30">
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
      <div className="flex flex-col gap-4">
        {/* Download buttons row */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={downloadWinnersCSV}
            className="px-6 py-3 bg-green-600 text-white font-bold text-base rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>📥</span> تحميل الفائزون (CSV)
          </button>
          <button
            onClick={downloadAllResultsCSV}
            className="px-6 py-3 bg-blue-600 text-white font-bold text-base rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>📊</span> تحميل جميع النتائج (CSV)
          </button>
          <button
            onClick={downloadResultsTxt}
            className="px-6 py-3 bg-zinc-600 text-white font-bold text-base rounded-full shadow-lg hover:bg-zinc-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>📄</span> تحميل ملخص (TXT)
          </button>
        </div>
        
        {/* New lottery button */}
        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full shadow-lg hover:bg-zinc-200 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>🔄</span> سحب جديد
          </button>
        </div>
      </div>
    </div>
  );
}
