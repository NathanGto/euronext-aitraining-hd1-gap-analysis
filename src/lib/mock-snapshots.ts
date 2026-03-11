import { CommodityCode } from "@/lib/commodities";
import { BrentHistoryPoint, BrentSnapshot } from "@/lib/types";

function createHistory(seed: number, startIso: string): BrentHistoryPoint[] {
  const start = new Date(startIso).getTime();
  const points: BrentHistoryPoint[] = [];

  for (let index = 0; index < 120; index += 1) {
    const timestamp = Math.floor((start + index * 24 * 60 * 60 * 1000) / 1000);
    const drift = Math.sin(index / 8) * 2.1 + Math.cos(index / 19) * 1.3;
    const close = Number((seed + drift).toFixed(2));
    const open = Number((close + Math.sin(index / 5) * 0.4).toFixed(2));
    const high = Number((Math.max(open, close) + 0.7).toFixed(2));
    const low = Number((Math.min(open, close) - 0.6).toFixed(2));
    const volume = Math.max(0, Math.round(150000 + Math.sin(index / 6) * 24000 + index * 420));

    points.push({
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      open,
      high,
      low,
      close,
      volume
    });
  }

  return points;
}

function createStaticSnapshot(
  commodity: CommodityCode,
  shortName: string,
  seedPrice: number,
  currency: string
): BrentSnapshot {
  const history = createHistory(seedPrice, "2025-09-01T00:00:00.000Z");
  const latest = history.at(-1);
  const previous = history.at(-2);

  if (!latest || !previous) {
    throw new Error("Static history seed failure");
  }

  const regularMarketPrice = latest.close ?? seedPrice;
  const regularMarketPreviousClose = previous.close ?? regularMarketPrice;
  const regularMarketChange = Number((regularMarketPrice - regularMarketPreviousClose).toFixed(2));
  const regularMarketChangePercent = Number(
    ((regularMarketChange / regularMarketPreviousClose) * 100).toFixed(2)
  );

  return {
    commodity,
    dataSource: "static-fixture",
    symbol: commodity === "WTI" ? "CL=F" : commodity === "OPEC" ? "OPEC_BASKET" : "BZ=F",
    shortName,
    currency,
    exchange: commodity === "OPEC" ? "OPEC Daily Reference" : "ICE Futures Europe",
    marketState: "CLOSED",
    regularMarketTime: "2025-12-15T16:30:00.000Z",
    regularMarketPrice,
    regularMarketChange,
    regularMarketChangePercent,
    regularMarketOpen: latest.open,
    regularMarketPreviousClose,
    regularMarketDayHigh: latest.high,
    regularMarketDayLow: latest.low,
    fiftyTwoWeekHigh: Number((seedPrice + 7.5).toFixed(2)),
    fiftyTwoWeekLow: Number((seedPrice - 9.2).toFixed(2)),
    regularMarketVolume: latest.volume,
    history
  };
}

const STATIC_FIXTURES: Record<CommodityCode, BrentSnapshot> = {
  BRENT: createStaticSnapshot("BRENT", "Brent Crude Oil", 78.4, "USD"),
  WTI: createStaticSnapshot("WTI", "WTI Crude Oil", 74.8, "USD"),
  OPEC: createStaticSnapshot("OPEC", "OPEC Basket Price", 76.1, "USD")
};

export function getStaticSnapshot(commodity: CommodityCode): BrentSnapshot {
  const source = STATIC_FIXTURES[commodity];

  return {
    ...source,
    history: source.history.map((point) => ({ ...point }))
  };
}
