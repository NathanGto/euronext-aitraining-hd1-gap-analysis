export type BrentHistoryPoint = {
  timestamp: number;
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
};

export type BrentSnapshot = {
  symbol: string;
  shortName: string;
  currency: string;
  exchange: string;
  marketState: string;
  regularMarketTime: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketOpen: number | null;
  regularMarketPreviousClose: number | null;
  regularMarketDayHigh: number | null;
  regularMarketDayLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  regularMarketVolume: number | null;
  history: BrentHistoryPoint[];
};
