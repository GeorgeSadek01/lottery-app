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
import { Gift } from '@/lib/types';

export default function Home() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

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
    stopSpinningForGift,
    selectWinnerForGift,
    skipWinnerForGift,
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.headers, state.displayColumn]);

  const items = useMemo(() => {
    if (!state.displayColumn || state.csvData.length === 0) return [];
    return state.csvData.map((row) => row[state.displayColumn] || '');
  }, [state.csvData, state.displayColumn]);

  const availableIndices = getAvailableRows();
  const canSpin = items.length > 0 && availableIndices.length > 0 && !state.isSpinning && selectedGift !== null;

  // Wrapper for stopSpinning to handle gift-aware logic
  const handleStopSpinning = useCallback((winnerIndex: number) => {
    if (!selectedGift) return;
    
    // For iPhone, always show fixed name regardless of wheel result
    if (selectedGift === 'iphone_17_pro_max') {
      stopSpinningForGift(selectedGift);
    } else {
      stopSpinningForGift(selectedGift, winnerIndex);
    }
  }, [selectedGift, stopSpinningForGift]);

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
      if (e.code === 'Enter' && state.showResult && state.currentGift) {
        e.preventDefault();
        selectWinnerForGift(state.currentGift);
      }

      // S to skip
      if (e.code === 'KeyS' && state.showResult && state.currentGift) {
        e.preventDefault();
        skipWinnerForGift(state.currentGift);
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
  }, [canSpin, state.showResult, state.isSpinning, state.currentGift, startSpinning, selectWinnerForGift, skipWinnerForGift, endLottery, toggleFullscreen]);

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
    const history: Array<{ index: number | null; data: any; displayValue: string; gift: Gift }> = [];
    
    // Collect winners from winnersByGift
    Object.entries(state.winnersByGift).forEach(([gift, indexOrMarker]) => {
      if (indexOrMarker === 'IPHONE_FIXED') {
        history.push({
          index: null,
          data: { 'الاسم الكامل': 'أحمد محمد يوسف' },
          displayValue: 'أحمد محمد يوسف',
          gift: gift as Gift,
        });
      } else if (typeof indexOrMarker === 'number') {
        history.push({
          index: indexOrMarker,
          data: state.csvData[indexOrMarker],
          displayValue: state.csvData[indexOrMarker]?.[state.displayColumn] || '',
          gift: gift as Gift,
        });
      }
    });
    
    return history;
  }, [state.winnersByGift, state.csvData, state.displayColumn]);

  const currentWinnerName = state.currentGift === 'iphone_17_pro_max'
    ? 'أحمد محمد يوسف'
    : state.currentWinner !== null
    ? state.csvData[state.currentWinner]?.[state.displayColumn] || ''
    : '';

  const currentWinnerData = state.currentGift === 'iphone_17_pro_max'
    ? { 'الاسم الكامل': 'أحمد محمد يوسف' }
    : state.currentWinner !== null
    ? state.csvData[state.currentWinner]
    : undefined;

  // Show ended state
  if (state.isEnded) {
    return (
      <div className="min-h-screen bg-black py-8 px-4">
        <ResultsSummary
          winnersByGift={state.winnersByGift}
          csvData={state.csvData}
          displayColumn={state.displayColumn}
          skippedParticipants={skippedParticipants}
          totalParticipants={state.csvData.length}
          onReset={reset}
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

  // Main lottery view
  return (
    <div className={`min-h-screen bg-black flex flex-col items-center ${isFullscreen ? 'py-2 px-2' : 'py-4 px-4'}`}>
      {/* Fullscreen toggle button */}
      <div className="fixed top-2 left-2 z-50 flex gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors border border-zinc-700 text-sm"
          title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
        {winnerHistory.length > 0 && (
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={`p-2 rounded-lg text-white transition-colors border text-sm ${
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
          isFullscreen={isFullscreen}
        />
      )}

      {/* Header */}
      <div className={`relative ${isFullscreen ? 'w-12 h-12' : 'w-16 h-16'} mb-2`}>
        <Image
          src="/logo-dark.png"
          alt="محمود علاء ستور"
          fill
          className="object-contain"
          priority
        />
      </div>
      <h1 className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-bold text-white mb-1 text-center`}>
        عجلة السحب
      </h1>
      <p className="text-zinc-400 text-sm mb-3">
        اضغط على زر السحب لاختيار فائز!
      </p>

      {/* Gift selector dropdown */}
      <div className="mb-3 w-full max-w-md">
        <select
          value={selectedGift || ''}
          onChange={(e) => setSelectedGift(e.target.value as Gift)}
          className="w-full px-4 py-3 bg-zinc-800 text-white border-2 border-zinc-700 rounded-xl font-medium text-base focus:border-white focus:outline-none transition-colors"
        >
          <option value="" disabled>اختر الجائزة...</option>
          <option value="airpods">🎧 AirPods</option>
          <option value="smart_watch">⌚ Smart Watch</option>
          <option value="iphone_17_pro_max">📱 iPhone 17 Pro Max</option>
        </select>
      </div>

      {/* Spinning Wheel */}
      <div className={`w-full ${showHistoryPanel && winnerHistory.length > 0 ? 'max-w-md' : 'max-w-lg'} mb-4`}>
        <SpinningWheel
          items={items}
          isSpinning={state.isSpinning}
          onStop={handleStopSpinning}
          availableIndices={availableIndices}
          spinPattern="random"
        />
      </div>

      {/* Spin Button */}
      {!state.isSpinning && !state.showResult && (
        <button
          onClick={startSpinning}
          disabled={!canSpin}
          className={`px-8 py-4 text-white font-bold text-xl rounded-full shadow-2xl transition-all duration-300 transform ${
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
        <div className="text-center mt-4">
          <p className="text-yellow-400 text-lg font-bold mb-3">
            لا يوجد مشتركين متبقين!
          </p>
          <button
            onClick={endLottery}
            className="px-6 py-3 bg-white text-black font-bold text-base rounded-full shadow-lg hover:bg-zinc-200 transition-all duration-300 transform hover:scale-105"
          >
            عرض النتائج 🏁
          </button>
        </div>
      )}

      {/* Winner Display Modal */}
      {state.showResult && state.currentGift && (
        <WinnerDisplay
          winner={currentWinnerName}
          winnerData={currentWinnerData}
          gift={state.currentGift}
          onSelect={() => selectWinnerForGift(state.currentGift!)}
          onSkip={() => skipWinnerForGift(state.currentGift!)}
          onEnd={endLottery}
        />
      )}

      {/* Stats bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-sm p-2 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-white text-xs">
          <div className="flex gap-3">
            <span className="text-green-400">
              ✅ الفائزون: {Object.keys(state.winnersByGift).length}
            </span>
            <span className="text-yellow-400">
              ⏭️ تخطي: {state.skippedRows.size}
            </span>
            <span className="text-zinc-400">
              📊 متبقي: {availableIndices.length}
            </span>
          </div>
          <button
            onClick={endLottery}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium transition-colors"
          >
            إنهاء السحب
          </button>
        </div>
      </div>
    </div>
  );
}
