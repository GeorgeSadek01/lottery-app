'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import CSVUpload from '@/components/CSVUpload';
import ColumnSelector from '@/components/ColumnSelector';
import SpinningWheel from '@/components/SpinningWheel';
import WinnerDisplay from '@/components/WinnerDisplay';
import ResultsSummary from '@/components/ResultsSummary';
import WinnerHistoryPanel from '@/components/WinnerHistoryPanel';
import { useLottery } from '@/lib/useLottery';

export default function Home() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [prizeColumn, setPrizeColumn] = useState<string>('');

  const {
    state,
    setCSVData,
    setDisplayColumn,
    getAvailableRows,
    startSpinning,
    stopSpinning,
    selectWinner,
    skipWinner,
    endLottery,
    reset,
  } = useLottery();

  // Fullscreen handlers
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.log('Fullscreen not supported:', e);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-select columns when CSV is loaded
  useEffect(() => {
    if (state.headers.length > 0) {
      // Auto-select name column if not set
      if (!state.displayColumn) {
        const nameColumn = state.headers.find(h => h === 'الاسم الكامل');
        if (nameColumn) {
          setDisplayColumn(nameColumn);
        }
      }
      // Auto-select prize/iPhone column if display column is set but prize is not
      if (state.displayColumn && !prizeColumn) {
        const iphoneColumn = state.headers.find(h => h === 'موديل الآيفون');
        if (iphoneColumn) {
          setPrizeColumn(iphoneColumn);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.headers, state.displayColumn]);

  const items = useMemo(() => {
    if (!state.displayColumn || state.csvData.length === 0) return [];
    return state.csvData.map((row) => row[state.displayColumn] || '');
  }, [state.csvData, state.displayColumn]);

  const availableIndices = getAvailableRows();
  const canSpin = items.length > 0 && availableIndices.length > 0 && !state.isSpinning;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space to spin (when not spinning and no result showing)
      if (e.code === 'Space' && canSpin && !state.showResult) {
        e.preventDefault();
        startSpinning();
      }

      // Enter to select winner
      if (e.code === 'Enter' && state.showResult) {
        e.preventDefault();
        selectWinner();
      }

      // S to skip
      if (e.code === 'KeyS' && state.showResult) {
        e.preventDefault();
        skipWinner();
      }

      // E to end lottery
      if (e.code === 'KeyE' && state.showResult) {
        e.preventDefault();
        endLottery();
      }

      // F for fullscreen
      if (e.code === 'KeyF' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canSpin, state.showResult, state.isSpinning, startSpinning, selectWinner, skipWinner, endLottery, toggleFullscreen]);

  const selectedWinners = useMemo(() => {
    return Array.from(state.selectedRows).map(
      (index) => state.csvData[index]?.[state.displayColumn] || ''
    );
  }, [state.selectedRows, state.csvData, state.displayColumn]);

  const skippedParticipants = useMemo(() => {
    return Array.from(state.skippedRows).map(
      (index) => state.csvData[index]?.[state.displayColumn] || ''
    );
  }, [state.skippedRows, state.csvData, state.displayColumn]);

  // Full data for CSV export
  const winnersFullData = useMemo(() => {
    return Array.from(state.selectedRows).map((index) => state.csvData[index]);
  }, [state.selectedRows, state.csvData]);

  const skippedFullData = useMemo(() => {
    return Array.from(state.skippedRows).map((index) => state.csvData[index]);
  }, [state.skippedRows, state.csvData]);

  // Winner history for sidebar
  const winnerHistory = useMemo(() => {
    return Array.from(state.selectedRows).map((index) => ({
      index,
      data: state.csvData[index],
      displayValue: state.csvData[index]?.[state.displayColumn] || '',
    }));
  }, [state.selectedRows, state.csvData, state.displayColumn]);

  const currentWinnerName = state.currentWinner !== null
    ? state.csvData[state.currentWinner]?.[state.displayColumn] || ''
    : '';

  const currentWinnerData = state.currentWinner !== null
    ? state.csvData[state.currentWinner]
    : undefined;

  // Show ended state
  if (state.isEnded) {
    return (
      <div className="min-h-screen bg-black py-8 px-4">
        <ResultsSummary
          selectedWinners={selectedWinners}
          skippedParticipants={skippedParticipants}
          totalParticipants={state.csvData.length}
          onReset={reset}
          winnersFullData={winnersFullData}
          skippedFullData={skippedFullData}
          headers={state.headers}
        />
      </div>
    );
  }

  // Show CSV upload
  if (state.csvData.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
        <div className="relative w-32 h-32 mb-6">
          <Image
            src="/logo-dark.png"
            alt="محمود علاء ستور"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center">
          عجلة السحب
        </h1>
        <p className="text-zinc-400 text-xl mb-12 text-center">
          ابدأ السحب الآن 🔥
        </p>
        <CSVUpload onUpload={setCSVData} />
      </div>
    );
  }

  // Show column selector
  if (!state.displayColumn) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
        <div className="relative w-24 h-24 mb-6">
          <Image
            src="/logo-dark.png"
            alt="محمود علاء ستور"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
          عجلة السحب
        </h1>
        <p className="text-zinc-400 text-lg mb-6 text-center">
          اختر العمود الذي يحتوي على أسماء المشتركين
        </p>
        <ColumnSelector
          headers={state.headers}
          selectedColumn={state.displayColumn}
          onSelect={setDisplayColumn}
        />
      </div>
    );
  }

  // Show prize column selector
  if (!prizeColumn) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
        <div className="relative w-24 h-24 mb-6">
          <Image
            src="/logo-dark.png"
            alt="محمود علاء ستور"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
          عجلة السحب
        </h1>
        <p className="text-zinc-400 text-lg mb-6 text-center">
          اختر العمود الذي يحتوي على الجائزة (موديل الايفون)
        </p>
        <ColumnSelector
          headers={state.headers}
          selectedColumn={prizeColumn}
          onSelect={setPrizeColumn}
        />
        <button
          onClick={() => setPrizeColumn('_skip_')}
          className="mt-6 px-6 py-3 text-zinc-400 hover:text-white transition-colors underline"
        >
          تخطي (بدون عرض الجائزة)
        </button>
      </div>
    );
  }

  // Main lottery view
  return (
    <div className={`min-h-screen bg-black flex flex-col items-center py-8 px-4 ${isFullscreen ? 'pt-4' : ''}`}>
      {/* Fullscreen toggle button */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white transition-colors border border-zinc-700"
          title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
        {winnerHistory.length > 0 && (
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={`p-3 rounded-xl text-white transition-colors border ${
              showHistoryPanel 
                ? 'bg-green-600 hover:bg-green-700 border-green-500' 
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
            }`}
            title={showHistoryPanel ? 'إخفاء لوحة الفائزين' : 'عرض لوحة الفائزين'}
          >
            🏆
          </button>
        )}
      </div>

      {/* Winner History Panel */}
      {showHistoryPanel && winnerHistory.length > 0 && (
        <WinnerHistoryPanel
          winners={winnerHistory}
          displayColumn={state.displayColumn}
          prizeColumn={prizeColumn}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Header */}
      <div className={`relative ${isFullscreen ? 'w-16 h-16' : 'w-20 h-20'} mb-4`}>
        <Image
          src="/logo-dark.png"
          alt="محمود علاء ستور"
          fill
          className="object-contain"
          priority
        />
      </div>
      <h1 className={`${isFullscreen ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'} font-bold text-white mb-2 text-center`}>
        عجلة السحب
      </h1>
      <p className="text-zinc-400 text-lg mb-8">
        اضغط على زر السحب لاختيار فائز!
      </p>

      {/* Spinning Wheel */}
      <div className={`w-full ${showHistoryPanel && winnerHistory.length > 0 ? 'max-w-2xl mr-0 md:mr-32' : 'max-w-3xl'} mb-8`}>
        <SpinningWheel
          items={items}
          isSpinning={state.isSpinning}
          onStop={stopSpinning}
          availableIndices={availableIndices}
          spinPattern="random"
        />
      </div>

      {/* Spin Button */}
      {!state.isSpinning && !state.showResult && (
        <button
          onClick={startSpinning}
          disabled={!canSpin}
          className={`px-16 py-6 text-white font-bold text-3xl rounded-full shadow-2xl transition-all duration-300 transform ${
            canSpin
              ? 'bg-white text-black hover:bg-zinc-200 hover:scale-105'
              : 'bg-zinc-700 cursor-not-allowed text-zinc-500'
          }`}
        >
          🎲 اسحب! 🎲
        </button>
      )}

      {/* No more participants message */}
      {availableIndices.length === 0 && !state.showResult && (
        <div className="text-center mt-8">
          <p className="text-yellow-400 text-2xl font-bold mb-4">
            لا يوجد مشتركين متبقين!
          </p>
          <button
            onClick={endLottery}
            className="px-8 py-4 bg-white text-black font-bold text-xl rounded-full shadow-lg hover:bg-zinc-200 transition-all duration-300 transform hover:scale-105"
          >
            عرض النتائج 🏁
          </button>
        </div>
      )}

      {/* Winner Display Modal */}
      {state.showResult && state.currentWinner !== null && (
        <WinnerDisplay
          winner={currentWinnerName}
          winnerData={currentWinnerData}
          prizeColumn={prizeColumn}
          onSelect={selectWinner}
          onSkip={skipWinner}
          onEnd={endLottery}
        />
      )}

      {/* Stats bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-sm p-4 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-white">
          <div className="flex gap-6">
            <span className="text-green-400">
              ✅ الفائزون: {state.selectedRows.size}
            </span>
            <span className="text-yellow-400">
              ⏭️ تم تخطيهم: {state.skippedRows.size}
            </span>
            <span className="text-zinc-400">
              📊 المتبقي: {availableIndices.length}
            </span>
          </div>
          <button
            onClick={endLottery}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            إنهاء السحب
          </button>
        </div>
      </div>
    </div>
  );
}
