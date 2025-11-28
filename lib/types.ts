export interface CSVRow {
  [key: string]: string;
}

export interface LotteryState {
  csvData: CSVRow[];
  headers: string[];
  displayColumn: string;
  selectedRows: Set<number>;
  skippedRows: Set<number>;
  currentWinner: number | null;
  isSpinning: boolean;
  showResult: boolean;
  isEnded: boolean;
}

export type LotteryAction = 
  | { type: 'SET_CSV_DATA'; payload: { data: CSVRow[]; headers: string[] } }
  | { type: 'SET_DISPLAY_COLUMN'; payload: string }
  | { type: 'START_SPINNING' }
  | { type: 'STOP_SPINNING'; payload: number }
  | { type: 'SELECT_WINNER' }
  | { type: 'SKIP_WINNER' }
  | { type: 'END_LOTTERY' }
  | { type: 'RESET' }
  | { type: 'HIDE_RESULT' };
