'use client';

import React from 'react';

interface ColumnSelectorProps {
  headers: string[];
  selectedColumn: string;
  onSelect: (column: string) => void;
}

export default function ColumnSelector({
  headers,
  selectedColumn,
  onSelect,
}: ColumnSelectorProps) {
  return (
    <div className="flex flex-col items-center p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800">
      <h2 className="text-2xl font-bold text-white mb-6">
        اختر العمود للعرض
      </h2>
      <p className="text-zinc-400 mb-6 text-center">
        اختر العمود الذي سيتم عرضه أثناء السحب
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
        {headers.map((header) => (
          <button
            key={header}
            onClick={() => onSelect(header)}
            className={`p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              selectedColumn === header
                ? 'bg-white text-black shadow-lg'
                : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            {header}
          </button>
        ))}
      </div>
      {selectedColumn && (
        <div className="mt-8 text-center">
          <p className="text-zinc-300 text-lg">
            تم الاختيار: <span className="font-bold text-white">{selectedColumn}</span>
          </p>
        </div>
      )}
    </div>
  );
}
