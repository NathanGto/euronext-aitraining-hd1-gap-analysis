import { BrentHistoryPoint, BrentSnapshot } from "@/lib/types";

const BRENT_SYMBOL = process.env.BRENT_SYMBOL ?? "BZ=F";
const QUOTE_URL = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
  BRENT_SYMBOL
)}`;
const CHART_URL = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
  BRENT_SYMBOL
)}?interval=1d&range=6mo`;

type YahooQuoteRecord = Record<string, unknown>;

type YahooQuoteResponse = {
  quoteResponse?: {
    result?: YahooQuoteRecord[];
  };
};

type YahooChartMeta = {
  symbol?: string;
  shortName?: string;
  currency?: string;
  exchangeName?: string;
  fullExchangeName?: string;
  marketState?: string;
  regularMarketTime?: number;
  regularMarketPrice?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
};

type YahooChartResult = {
  meta?: YahooChartMeta;
  timestamp?: number[];
  indicators?: {
    quote?: Array<{
      open?: Array<number | null>;
      high?: Array<number | null>;
      low?: Array<number | null>;
      close?: Array<number | null>;
      volume?: Array<number | null>;
    }>;
  };
};

type YahooChartResponse = {
  chart?: {
    result?: YahooChartResult[];
  };
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }

  return fallback;
}

function toIsoDate(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toISOString();
}

function firstNumber(values: Array<number | null | undefined>): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function parseHistory(chartResult: YahooChartResult | null): BrentHistoryPoint[] {
  const timestamps = chartResult?.timestamp;
  const quote = chartResult?.indicators?.quote?.[0];

  if (!timestamps || !quote) {
    return [];
  }

  return timestamps
    .map((timestamp, index) => {
      const close = quote.close?.[index] ?? null;
      if (close === null) {
        return null;
      }

      const open = quote.open?.[index] ?? null;
      const high = quote.high?.[index] ?? null;
      const low = quote.low?.[index] ?? null;
      const volume = quote.volume?.[index] ?? null;

      return {
        timestamp,
        date: toIsoDate(timestamp),
        open,
        high,
        low,
        close,
        volume
      };
    })
    .filter((point): point is BrentHistoryPoint => point !== null);
}

export async function getBrentSnapshot(): Promise<BrentSnapshot> {
  const requestInit: RequestInit = {
    cache: "no-store",
    headers: {
      accept: "application/json"
    }
  };

  const [quoteFetch, chartFetch] = await Promise.allSettled([
    fetch(QUOTE_URL, requestInit),
    fetch(CHART_URL, requestInit)
  ]);

  const diagnostics: string[] = [];
  let quote: YahooQuoteRecord | null = null;
  let chartResult: YahooChartResult | null = null;

  if (quoteFetch.status === "fulfilled") {
    if (quoteFetch.value.ok) {
      try {
        const quotePayload = (await quoteFetch.value.json()) as YahooQuoteResponse;
        quote = quotePayload.quoteResponse?.result?.[0] ?? null;
        if (!quote) {
          diagnostics.push("quote payload had no result");
        }
      } catch {
        diagnostics.push("quote payload parsing failed");
      }
    } else {
      diagnostics.push(`quote endpoint status ${quoteFetch.value.status}`);
    }
  } else {
    diagnostics.push("quote endpoint request failed");
  }

  if (chartFetch.status === "fulfilled") {
    if (chartFetch.value.ok) {
      try {
        const chartPayload = (await chartFetch.value.json()) as YahooChartResponse;
        chartResult = chartPayload.chart?.result?.[0] ?? null;
        if (!chartResult) {
          diagnostics.push("chart payload had no result");
        }
      } catch {
        diagnostics.push("chart payload parsing failed");
      }
    } else {
      diagnostics.push(`chart endpoint status ${chartFetch.value.status}`);
    }
  } else {
    diagnostics.push("chart endpoint request failed");
  }

  if (!quote && !chartResult) {
    throw new Error(`No market data available (${diagnostics.join("; ")})`);
  }

  const history = parseHistory(chartResult);
  const latestHistory = history.at(-1) ?? null;
  const previousHistory = history.length > 1 ? history[history.length - 2] : null;
  const meta = chartResult?.meta;

  const regularMarketPrice = firstNumber([
    asNumber(quote?.regularMarketPrice),
    asNumber(meta?.regularMarketPrice),
    latestHistory?.close
  ]);

  const regularMarketPreviousClose = firstNumber([
    asNumber(quote?.regularMarketPreviousClose),
    asNumber(meta?.previousClose),
    asNumber(meta?.chartPreviousClose),
    previousHistory?.close
  ]);

  if (regularMarketPrice === null) {
    throw new Error(`Missing market price (${diagnostics.join("; ")})`);
  }

  const computedChange =
    regularMarketPreviousClose !== null ? regularMarketPrice - regularMarketPreviousClose : null;

  const regularMarketChange = firstNumber([asNumber(quote?.regularMarketChange), computedChange]);
  if (regularMarketChange === null) {
    throw new Error(`Missing market change (${diagnostics.join("; ")})`);
  }

  const computedChangePercent =
    regularMarketPreviousClose !== null && regularMarketPreviousClose !== 0
      ? (regularMarketChange / regularMarketPreviousClose) * 100
      : null;

  const regularMarketChangePercent = firstNumber([
    asNumber(quote?.regularMarketChangePercent),
    computedChangePercent
  ]);

  if (regularMarketChangePercent === null) {
    throw new Error(`Missing market change percent (${diagnostics.join("; ")})`);
  }

  const marketTimeUnix = firstNumber([
    asNumber(quote?.regularMarketTime),
    asNumber(meta?.regularMarketTime),
    latestHistory?.timestamp,
    Math.floor(Date.now() / 1000)
  ]);

  return {
    symbol: asString(quote?.symbol, asString(meta?.symbol, BRENT_SYMBOL)),
    shortName: asString(
      quote?.shortName,
      asString(quote?.longName, asString(meta?.shortName, "Brent Crude Oil"))
    ),
    currency: asString(quote?.currency, asString(meta?.currency, "USD")),
    exchange: asString(
      quote?.fullExchangeName,
      asString(quote?.exchange, asString(meta?.fullExchangeName, asString(meta?.exchangeName, "N/A")))
    ),
    marketState: asString(quote?.marketState, asString(meta?.marketState, "UNKNOWN")),
    regularMarketTime: toIsoDate(marketTimeUnix ?? Math.floor(Date.now() / 1000)),
    regularMarketPrice,
    regularMarketChange,
    regularMarketChangePercent,
    regularMarketOpen: firstNumber([
      asNumber(quote?.regularMarketOpen),
      asNumber(meta?.regularMarketOpen),
      latestHistory?.open
    ]),
    regularMarketPreviousClose,
    regularMarketDayHigh: firstNumber([
      asNumber(quote?.regularMarketDayHigh),
      asNumber(meta?.regularMarketDayHigh),
      latestHistory?.high
    ]),
    regularMarketDayLow: firstNumber([
      asNumber(quote?.regularMarketDayLow),
      asNumber(meta?.regularMarketDayLow),
      latestHistory?.low
    ]),
    fiftyTwoWeekHigh: firstNumber([asNumber(quote?.fiftyTwoWeekHigh), asNumber(meta?.fiftyTwoWeekHigh)]),
    fiftyTwoWeekLow: firstNumber([asNumber(quote?.fiftyTwoWeekLow), asNumber(meta?.fiftyTwoWeekLow)]),
    regularMarketVolume: firstNumber([asNumber(quote?.regularMarketVolume), latestHistory?.volume]),
    history
  };
}
