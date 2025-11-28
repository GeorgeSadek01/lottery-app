'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';

interface SpinningWheelProps {
  items: string[];
  isSpinning: boolean;
  onStop: (selectedIndex: number) => void;
  availableIndices: number[];
  spinPattern?: 'normal' | 'accelerate' | 'bounce' | 'random';
}

export default function SpinningWheel({
  items,
  isSpinning,
  onStop,
  availableIndices,
  spinPattern = 'random',
}: SpinningWheelProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isStopping, setIsStopping] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const speedRef = useRef(50);
  const currentPatternRef = useRef<string>('normal');

  const patterns = useMemo(() => ['normal', 'accelerate', 'bounce'], []);

  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopWheel = useCallback(() => {
    if (isStoppingRef.current || availableIndices.length === 0) return;
    isStoppingRef.current = true;
    setIsStopping(true);

    // Select a random winner from available indices
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const winnerIndex = availableIndices[randomIndex];

    clearCurrentInterval();

    // Different slowdown patterns
    const slowDown = () => {
      const pattern = currentPatternRef.current;
      
      if (pattern === 'bounce') {
        // Bounce pattern - speed varies
        speedRef.current += Math.random() > 0.5 ? 60 : 20;
      } else if (pattern === 'accelerate') {
        // Accelerate then slow - exponential slowdown
        speedRef.current = speedRef.current * 1.15;
      } else {
        // Normal linear slowdown
        speedRef.current += 40;
      }

      if (speedRef.current >= 500) {
        // Final stop
        clearCurrentInterval();
        setDisplayIndex(winnerIndex);
        setTimeout(() => {
          isStoppingRef.current = false;
          setIsStopping(false);
          hasStartedRef.current = false;
          speedRef.current = 50;
          onStop(winnerIndex);
        }, 300);
      } else {
        intervalRef.current = setInterval(() => {
          setDisplayIndex((prev) => (prev + 1) % items.length);
        }, speedRef.current);
        setTimeout(() => {
          clearCurrentInterval();
          slowDown();
        }, speedRef.current * 3);
      }
    };

    slowDown();
  }, [availableIndices, onStop, items.length, clearCurrentInterval]);

  useEffect(() => {
    if (isSpinning && !hasStartedRef.current) {
      hasStartedRef.current = true;
      isStoppingRef.current = false;
      
      // Select random pattern or use specified
      const selectedPattern = spinPattern === 'random' 
        ? patterns[Math.floor(Math.random() * patterns.length)]
        : spinPattern;
      currentPatternRef.current = selectedPattern;

      // Different initial speeds based on pattern
      if (selectedPattern === 'accelerate') {
        speedRef.current = 100; // Start slower
      } else if (selectedPattern === 'bounce') {
        speedRef.current = 40; // Start faster
      } else {
        speedRef.current = 50;
      }

      intervalRef.current = setInterval(() => {
        setDisplayIndex((prev) => (prev + 1) % items.length);
      }, speedRef.current);

      // For accelerate pattern, speed up initially
      if (selectedPattern === 'accelerate') {
        const accelerate = setInterval(() => {
          if (speedRef.current > 30) {
            speedRef.current -= 10;
            clearCurrentInterval();
            intervalRef.current = setInterval(() => {
              setDisplayIndex((prev) => (prev + 1) % items.length);
            }, speedRef.current);
          } else {
            clearInterval(accelerate);
          }
        }, 200);
      }
    }

    if (!isSpinning && !isStoppingRef.current) {
      hasStartedRef.current = false;
    }

    return () => {
      if (!isSpinning && !isStoppingRef.current) {
        clearCurrentInterval();
      }
    };
  }, [isSpinning, items.length, clearCurrentInterval, spinPattern, patterns]);

  const getVisibleItems = () => {
    const visibleCount = 7;
    const half = Math.floor(visibleCount / 2);
    const result = [];

    for (let i = -half; i <= half; i++) {
      const index = (displayIndex + i + items.length) % items.length;
      result.push({
        index,
        value: items[index],
        offset: i,
      });
    }

    return result;
  };

  const visibleItems = getVisibleItems();

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Wheel Container */}
      <div className="relative w-full max-w-2xl">
        {/* Side decorations */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-32 bg-white rounded-l-lg shadow-lg z-10 flex items-center justify-center">
          <span className="text-2xl text-black">◀</span>
        </div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-32 bg-white rounded-r-lg shadow-lg z-10 flex items-center justify-center">
          <span className="text-2xl text-black">▶</span>
        </div>

        {/* Wheel */}
        <div className="relative overflow-hidden h-96 mx-12 bg-zinc-900 rounded-2xl border-4 border-white shadow-2xl">
          {/* Gradient overlays for fade effect */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-zinc-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent z-10 pointer-events-none" />

          {/* Center highlight */}
          <div className="absolute top-1/2 left-0 right-0 h-16 -translate-y-1/2 bg-white/10 border-y-2 border-white z-5" />

          {/* Items */}
          <div className="flex flex-col items-center justify-center h-full py-4">
            {visibleItems.map((item, i) => {
              const isCenter = item.offset === 0;
              const opacity = 1 - Math.abs(item.offset) * 0.15;
              const scale = isCenter ? 1.2 : 1 - Math.abs(item.offset) * 0.08;
              const blur = Math.abs(item.offset) > 2 ? 'blur-sm' : '';

              return (
                <div
                  key={`${item.index}-${i}`}
                  className={`py-2 px-6 transition-all duration-75 ${blur}`}
                  style={{
                    opacity,
                    transform: `scale(${scale})`,
                  }}
                >
                  <span
                    className={`text-xl md:text-2xl font-bold whitespace-nowrap ${
                      isCenter
                        ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                        : 'text-zinc-400'
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Button */}
      {isSpinning && !isStopping && (
        <button
          onClick={stopWheel}
          className="px-12 py-6 bg-red-600 text-white font-bold text-2xl rounded-full shadow-2xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 animate-pulse"
        >
          🎯 توقف! 🎯
        </button>
      )}

      {/* Stopping indicator */}
      {isSpinning && isStopping && (
        <div className="px-12 py-6 bg-yellow-500 text-black font-bold text-2xl rounded-full shadow-2xl flex items-center gap-3">
          <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>جاري السحب...</span>
        </div>
      )}

      {/* Stats */}
      <div className="text-center text-zinc-400">
        <p className="text-lg">
          المتبقي: {availableIndices.length} مشترك
        </p>
      </div>
    </div>
  );
}
