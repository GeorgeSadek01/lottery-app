'use client';

import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { CSVRow } from '@/lib/types';
import Image from 'next/image';

interface CSVUploadProps {
  onUpload: (data: CSVRow[], headers: string[]) => void;
}

export default function CSVUpload({ onUpload }: CSVUploadProps) {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as CSVRow[];
          const headers = results.meta.fields || [];
          if (data.length > 0 && headers.length > 0) {
            onUpload(data, headers);
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          alert('خطأ في قراءة الملف. يرجى التحقق من صيغة الملف.');
        },
      });
    },
    [onUpload]
  );

  return (
    <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-zinc-700 rounded-3xl bg-zinc-900/50 hover:bg-zinc-800/50 transition-all duration-300">
      <div className="relative w-24 h-24 mb-6">
        <Image
          src="/logo-dark.png"
          alt="محمود علاء ستور"
          fill
          className="object-contain"
          priority
        />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">رفع ملف CSV</h2>
      <p className="text-zinc-400 mb-6 text-center">
          ابدأ السحب الآن 🔥
      </p>
      <label className="cursor-pointer">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <span className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-zinc-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block">
          اختر ملف CSV
        </span>
      </label>
    </div>
  );
}
