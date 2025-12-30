'use client';

import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Gift } from '@/lib/types';

interface WinnerDisplayProps {
  winner: string;
  winnerData?: { [key: string]: string };
  gift: Gift;
  onSelect: () => void;
  onSkip: () => void;
  onEnd: () => void;
}

export default function WinnerDisplay({
  winner,
  winnerData,
  gift,
  onSelect,
  onSkip,
  onEnd,
}: WinnerDisplayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fire colorful confetti for longer duration
    const duration = 8000; // 8 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 100 };

    // Vibrant rainbow colors
    const colors = [
      '#FF0000', '#FF4500', '#FF6347', // Reds
      '#FFD700', '#FFA500', '#FFFF00', // Yellows/Golds
      '#00FF00', '#32CD32', '#7CFC00', // Greens
      '#00FFFF', '#1E90FF', '#00BFFF', // Blues
      '#FF00FF', '#DA70D6', '#EE82EE', // Purples/Pinks
      '#FF1493', '#FF69B4', '#FFB6C1', // Pinks
    ];

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Multiple confetti launchers for variety
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 80 * (timeLeft / duration);

      // Left side burst
      confetti({
        ...defaults,
        particleCount: particleCount / 2,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: colors,
        shapes: ['circle', 'square'],
        scalar: randomInRange(0.8, 1.2),
      });

      // Right side burst
      confetti({
        ...defaults,
        particleCount: particleCount / 2,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: colors,
        shapes: ['circle', 'square'],
        scalar: randomInRange(0.8, 1.2),
      });

      // Center celebration burst (less frequent)
      if (Math.random() > 0.5) {
        confetti({
          ...defaults,
          particleCount: particleCount / 3,
          origin: { x: 0.5, y: 0.5 },
          colors: colors,
          shapes: ['circle'],
          scalar: 1.5,
          gravity: 0.8,
        });
      }
    }, 150);

    // Initial big burst
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { x: 0.5, y: 0.6 },
      colors: colors,
      startVelocity: 60,
      ticks: 200,
      zIndex: 100,
    });

    // Play celebration sound
    try {
      audioRef.current = new Audio('/celebration.mp3');
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        // Audio play failed, probably user hasn't interacted yet
      });
    } catch (e) {
      // Audio not supported
      console.log('Audio not supported', e);
    }

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const giftLabels: Record<Gift, { emoji: string; label: string }> = {
    airpods: { emoji: '🎧', label: 'AirPods' },
    smart_watch: { emoji: '⌚', label: 'Smart Watch' },
    iphone_17_pro_max: { emoji: '📱', label: 'iPhone 17 Pro Max' },
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-xl">
        {/* Glowing background */}
        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-50 animate-pulse" />
        
        {/* Main card - wider for better readability */}
        <div className="relative bg-zinc-900 rounded-2xl p-8 shadow-2xl border-4 border-white">
          {/* Trophy */}
          <div className="text-7xl text-center mb-4 animate-bounce">
            🏆
          </div>
          
          {/* Winner label */}
          <h2 className="text-2xl font-bold text-white text-center mb-4 tracking-wider">
            ✨ الفائز ✨
          </h2>
          
          {/* Winner name */}
          <div className="bg-white rounded-xl p-6 shadow-inner mb-4">
            <p className="text-3xl font-bold text-black text-center break-words">
              {winner}
            </p>
          </div>
          
          {/* Prize display - Gift label */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 mb-6 shadow-lg">
            <p className="text-sm text-white/80 text-center mb-1">🎁 الجائزة</p>
            <p className="text-2xl font-bold text-white text-center break-words">
              {giftLabels[gift].emoji} {giftLabels[gift].label}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col gap-3 justify-center">
            <button
              onClick={onSelect}
              className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>تم الاختيار</span>
              <span className="text-xl">✅</span>
            </button>
            
            <button
              onClick={onSkip}
              className="px-8 py-4 bg-yellow-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-yellow-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>تخطي</span>
              <span className="text-xl">⏭️</span>
            </button>
            
            <button
              onClick={onEnd}
              className="px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>إنهاء</span>
              <span className="text-xl">🏁</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
