export type Gift = 'airpods' | 'smart_watch' | 'iphone_17_pro_max';

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
  winnersByGift: Partial<Record<Gift, number | 'IPHONE_FIXED'>>;
  currentGift: Gift | null;
  fixedIphoneReservedIndex: number | null;
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
  | { type: 'HIDE_RESULT' }
  | { type: 'SET_GIFT'; payload: Gift | null }
  | { type: 'STOP_SPINNING_FOR_GIFT'; payload: { gift: Gift; index?: number } }
  | { type: 'SELECT_WINNER_FOR_GIFT'; payload: { gift: Gift } }
  | { type: 'SKIP_WINNER_FOR_GIFT'; payload: { gift: Gift } };
