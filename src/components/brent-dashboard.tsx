"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PriceChart } from "@/components/price-chart";
import { BrentSnapshot } from "@/lib/types";

type BrentDashboardProps = {
  initialData: BrentSnapshot | null;
};

const REFRESH_MS = 60_000;

function formatMoney(value: number | null, currency: string): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
}

function formatSignedMoney(value: number, currency: string): string {
  return `${value >= 0 ? "+" : "-"}${formatMoney(Math.abs(value), currency)}`;
}

function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatNumber(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export function BrentDashboard({ initialData }: BrentDashboardProps) {
  const [data, setData] = useState<BrentSnapshot | null>(initialData);
  const [isLoading, setIsLoading] = useState(initialData === null);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/brent", { cache: "no-store" });
      if (!response.ok) {
        let message = `API request failed with status ${response.status}`;

        try {
          const payload = (await response.json()) as { error?: string; details?: string };
          message = payload.details ?? payload.error ?? message;
        } catch {
          // Keep default message when response body is not JSON.
        }

        throw new Error(message);
      }

      const payload = (await response.json()) as BrentSnapshot;
      setData(payload);
      setError(null);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unknown fetch error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      void loadSnapshot();
    }

    const intervalId = window.setInterval(() => {
      void loadSnapshot();
    }, REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [initialData, loadSnapshot]);

  const polarityClass = useMemo(() => {
    if (!data) {
      return "text-[var(--text)]";
    }

    return data.regularMarketChange >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]";
  }, [data]);

  if (!data && isLoading) {
    return <p className="text-sm text-[var(--muted)]">Loading Brent market data...</p>;
  }

  if (!data && error) {
    return (
      <div className="rounded-2xl border border-[var(--negative)] bg-white p-4 text-sm text-[var(--negative)]">
        Could not load Brent rates: {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    { label: "Open", value: formatMoney(data.regularMarketOpen, data.currency) },
    { label: "Prev Close", value: formatMoney(data.regularMarketPreviousClose, data.currency) },
    { label: "Day High", value: formatMoney(data.regularMarketDayHigh, data.currency) },
    { label: "Day Low", value: formatMoney(data.regularMarketDayLow, data.currency) },
    { label: "52W High", value: formatMoney(data.fiftyTwoWeekHigh, data.currency) },
    { label: "52W Low", value: formatMoney(data.fiftyTwoWeekLow, data.currency) },
    { label: "Volume", value: formatNumber(data.regularMarketVolume) },
    { label: "Market", value: data.exchange }
  ];

  return (
    <section className="w-full max-w-6xl space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Commodity</p>
            <h1 className="mt-1 text-2xl font-semibold">{data.shortName}</h1>
            <p className="text-sm text-[var(--muted)]">Ticker: {data.symbol}</p>
          </div>

          <div className="text-right">
            <p className="text-4xl font-bold">{formatMoney(data.regularMarketPrice, data.currency)}</p>
            <p className={`mt-1 text-base font-semibold ${polarityClass}`}>
              {formatSignedMoney(data.regularMarketChange, data.currency)} (
              {formatPercentage(data.regularMarketChangePercent)})
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Updated: {new Date(data.regularMarketTime).toLocaleString("en-US")}
            </p>
          </div>
        </div>
      </div>

      <PriceChart history={data.history} currency={data.currency} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{card.label}</p>
            <p className="mt-1 text-lg font-semibold">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <p>Source: Yahoo Finance market data feed, refreshed every minute.</p>
        {isLoading ? <p>Refreshing...</p> : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          Last refresh failed: {error}
        </div>
      ) : null}
    </section>
  );
}
