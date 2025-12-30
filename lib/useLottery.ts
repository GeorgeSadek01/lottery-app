'use client';

import { useReducer, useCallback } from 'react';
import { LotteryState, LotteryAction, CSVRow, Gift } from './types';

const FIXED_IPHONE_WINNER = 'يوسف محمد عبداللطيف';

const initialState: LotteryState = {
  csvData: [],
  headers: [],
  displayColumn: '',
  selectedRows: new Set(),
  skippedRows: new Set(),
  currentWinner: null,
  isSpinning: false,
  showResult: false,
  isEnded: false,
  winnersByGift: {},
  currentGift: null,
  fixedIphoneReservedIndex: null,
};

function lotteryReducer(state: LotteryState, action: LotteryAction): LotteryState {
  switch (action.type) {
    case 'SET_CSV_DATA':
      // Find the fixed iPhone winner in CSV if exists
      let fixedIphoneIndex: number | null = null;
      if (action.payload.headers.length > 0) {
        const displayCol = action.payload.headers.find(h => h === 'الاسم الكامل') || action.payload.headers[0];
        fixedIphoneIndex = action.payload.data.findIndex(row => row[displayCol] === FIXED_IPHONE_WINNER);
        if (fixedIphoneIndex === -1) fixedIphoneIndex = null;
      }
      return {
        ...initialState,
        csvData: action.payload.data,
        headers: action.payload.headers,
        fixedIphoneReservedIndex: fixedIphoneIndex,
      };
    case 'SET_DISPLAY_COLUMN':
      return {
        ...state,
        displayColumn: action.payload,
      };
    case 'START_SPINNING':
      return {
        ...state,
        isSpinning: true,
        showResult: false,
        currentWinner: null,
      };
    case 'STOP_SPINNING':
      return {
        ...state,
        isSpinning: false,
        currentWinner: action.payload,
        showResult: true,
      };
    case 'SELECT_WINNER':
      if (state.currentWinner === null) return state;
      const newSelectedLegacy = new Set(state.selectedRows);
      newSelectedLegacy.add(state.currentWinner);
      return {
        ...state,
        selectedRows: newSelectedLegacy,
        showResult: false,
        currentWinner: null,
      };
    case 'SKIP_WINNER':
      if (state.currentWinner === null) return state;
      const newSkippedLegacy = new Set(state.skippedRows);
      newSkippedLegacy.add(state.currentWinner);
      return {
        ...state,
        skippedRows: newSkippedLegacy,
        showResult: false,
        currentWinner: null,
      };
    case 'END_LOTTERY':
      return {
        ...state,
        isEnded: true,
        showResult: false,
      };
    case 'HIDE_RESULT':
      return {
        ...state,
        showResult: false,
      };
    case 'SET_GIFT':
      return {
        ...state,
        currentGift: action.payload,
      };
    case 'STOP_SPINNING_FOR_GIFT':
      // For iPhone gift, always use fixed winner (no index from wheel)
      if (action.payload.gift === 'iphone_17_pro_max') {
        return {
          ...state,
          isSpinning: false,
          currentWinner: state.fixedIphoneReservedIndex, // May be null if not in CSV
          showResult: true,
          currentGift: action.payload.gift,
        };
      }
      return {
        ...state,
        isSpinning: false,
        currentWinner: action.payload.index ?? null,
        showResult: true,
        currentGift: action.payload.gift,
      };
    case 'SELECT_WINNER_FOR_GIFT':
      if (state.currentGift === null) return state;
      const gift = action.payload.gift || state.currentGift;
      const newWinnersByGift = { ...state.winnersByGift };
      const newSelected = new Set(state.selectedRows);
      
      if (gift === 'iphone_17_pro_max') {
        // Mark iPhone as fixed
        newWinnersByGift[gift] = 'IPHONE_FIXED';
        // Also add reserved index to selectedRows if exists
        if (state.fixedIphoneReservedIndex !== null) {
          newSelected.add(state.fixedIphoneReservedIndex);
        }
      } else if (state.currentWinner !== null) {
        newWinnersByGift[gift] = state.currentWinner;
        newSelected.add(state.currentWinner);
      }
      
      return {
        ...state,
        winnersByGift: newWinnersByGift,
        selectedRows: newSelected,
        showResult: false,
        currentWinner: null,
        currentGift: null,
      };
    case 'SKIP_WINNER_FOR_GIFT':
      if (state.currentWinner === null && state.currentGift !== 'iphone_17_pro_max') return state;
      const newSkipped = new Set(state.skippedRows);
      if (state.currentWinner !== null) {
        newSkipped.add(state.currentWinner);
      }
      return {
        ...state,
        skippedRows: newSkipped,
        showResult: false,
        currentWinner: null,
        currentGift: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useLottery() {
  const [state, dispatch] = useReducer(lotteryReducer, initialState);

  const setCSVData = useCallback((data: CSVRow[], headers: string[]) => {
    dispatch({ type: 'SET_CSV_DATA', payload: { data, headers } });
  }, []);

  const setDisplayColumn = useCallback((column: string) => {
    dispatch({ type: 'SET_DISPLAY_COLUMN', payload: column });
  }, []);

  const getAvailableRows = useCallback(() => {
    // Collect all winner indices from winnersByGift
    const usedIndices = new Set<number>();
    Object.values(state.winnersByGift).forEach(val => {
      if (typeof val === 'number') {
        usedIndices.add(val);
      }
    });
    // Also include fixedIphoneReservedIndex if iPhone not yet awarded
    if (state.fixedIphoneReservedIndex !== null && !state.winnersByGift.iphone_17_pro_max) {
      usedIndices.add(state.fixedIphoneReservedIndex);
    }
    
    return state.csvData
      .map((_, index) => index)
      .filter(index => 
        !state.selectedRows.has(index) && 
        !state.skippedRows.has(index) &&
        !usedIndices.has(index)
      );
  }, [state.csvData, state.selectedRows, state.skippedRows, state.winnersByGift, state.fixedIphoneReservedIndex]);

  const startSpinning = useCallback(() => {
    dispatch({ type: 'START_SPINNING' });
  }, []);

  const stopSpinning = useCallback((winnerIndex: number) => {
    dispatch({ type: 'STOP_SPINNING', payload: winnerIndex });
  }, []);

  const selectWinner = useCallback(() => {
    dispatch({ type: 'SELECT_WINNER' });
  }, []);

  const skipWinner = useCallback(() => {
    dispatch({ type: 'SKIP_WINNER' });
  }, []);

  const endLottery = useCallback(() => {
    dispatch({ type: 'END_LOTTERY' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setGift = useCallback((gift: Gift | null) => {
    dispatch({ type: 'SET_GIFT', payload: gift });
  }, []);

  const stopSpinningForGift = useCallback((gift: Gift, winnerIndex?: number) => {
    dispatch({ type: 'STOP_SPINNING_FOR_GIFT', payload: { gift, index: winnerIndex } });
  }, []);

  const selectWinnerForGift = useCallback((gift: Gift) => {
    dispatch({ type: 'SELECT_WINNER_FOR_GIFT', payload: { gift } });
  }, []);

  const skipWinnerForGift = useCallback((gift: Gift) => {
    dispatch({ type: 'SKIP_WINNER_FOR_GIFT', payload: { gift } });
  }, []);

  return {
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
    setGift,
    stopSpinningForGift,
    selectWinnerForGift,
    skipWinnerForGift,
  };
}
