'use client';

import { useReducer, useCallback } from 'react';
import { LotteryState, LotteryAction, CSVRow } from './types';

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
};

function lotteryReducer(state: LotteryState, action: LotteryAction): LotteryState {
  switch (action.type) {
    case 'SET_CSV_DATA':
      return {
        ...initialState,
        csvData: action.payload.data,
        headers: action.payload.headers,
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
      const newSelected = new Set(state.selectedRows);
      newSelected.add(state.currentWinner);
      return {
        ...state,
        selectedRows: newSelected,
        showResult: false,
        currentWinner: null,
      };
    case 'SKIP_WINNER':
      if (state.currentWinner === null) return state;
      const newSkipped = new Set(state.skippedRows);
      newSkipped.add(state.currentWinner);
      return {
        ...state,
        skippedRows: newSkipped,
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
    return state.csvData
      .map((_, index) => index)
      .filter(index => !state.selectedRows.has(index) && !state.skippedRows.has(index));
  }, [state.csvData, state.selectedRows, state.skippedRows]);

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
  };
}
