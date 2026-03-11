"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PriceChart } from "@/components/price-chart";
import { COMMODITIES, CommodityCode, normalizeCommodity } from "@/lib/commodities";
import { BrentSnapshot } from "@/lib/types";

type BrentDashboardProps = {
  initialData: BrentSnapshot | null;
  initialCommodity: CommodityCode;
};

const REFRESH_MS = 60_000;
const REFRESH_OPTIONS = [10_000, 30_000, 60_000, 300_000];

function formatSeconds(value: number): string {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

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

function downloadCsv(snapshot: BrentSnapshot): void {
  const header = "date,open,high,low,close,volume";
  const rows = snapshot.history.map((point) =>
    [point.date, point.open ?? "", point.high ?? "", point.low ?? "", point.close ?? "", point.volume ?? ""].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${snapshot.symbol}-history.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BrentDashboard({ initialData, initialCommodity }: BrentDashboardProps) {
  const [data, setData] = useState<BrentSnapshot | null>(initialData);
  const [isLoading, setIsLoading] = useState(initialData === null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityCode>(initialCommodity);
  const [selectedRefreshMs, setSelectedRefreshMs] = useState(30_000);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(Math.floor(selectedRefreshMs / 1000));

  const loadSnapshot = useCallback(async (commodity: CommodityCode) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/brent?commodity=${commodity}`, { cache: "no-store" });
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
      setSecondsUntilRefresh(Math.floor(selectedRefreshMs / 1000));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unknown fetch error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRefreshMs]);

  useEffect(() => {
    if (!initialData || selectedCommodity !== initialCommodity) {
      void loadSnapshot(selectedCommodity);
    }

    const intervalId = window.setInterval(() => {
      void loadSnapshot(selectedCommodity);
    }, REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [initialCommodity, initialData, loadSnapshot, selectedCommodity]);

  useEffect(() => {
    setSecondsUntilRefresh(Math.floor(selectedRefreshMs / 1000));

    const countdownId = window.setInterval(() => {
      setSecondsUntilRefresh((value) => {
        if (value <= 1) {
          return Math.floor(selectedRefreshMs / 1000);
        }

        return value - 1;
      });
    }, 1_000);

    return () => window.clearInterval(countdownId);
  }, [selectedRefreshMs, selectedCommodity]);

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
    { label: "Market State", value: data.marketState },
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
            <p className="text-xs text-[var(--muted)]">
              Data source: {data.dataSource === "yahoo-live" ? "Yahoo Finance (live)" : "Static fixture"}
            </p>
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

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Commodity Selection</p>
            <select
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              value={selectedCommodity}
              onChange={(event) => setSelectedCommodity(normalizeCommodity(event.target.value))}
            >
              {COMMODITIES.map((commodity) => (
                <option key={commodity.code} value={commodity.code}>
                  {commodity.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Refresh Interval</p>
            <select
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              value={selectedRefreshMs}
              onChange={(event) => setSelectedRefreshMs(Number(event.target.value))}
            >
              {REFRESH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option / 1000 >= 60 ? `${option / 60000} min` : `${option / 1000} sec`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted)]">Next refresh in {formatSeconds(secondsUntilRefresh)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Account</p>
            <div className="flex gap-2">
              <Link
                href="/login"
                className="inline-flex rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium"
              >
                Create account
              </Link>
            </div>
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

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Export</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadCsv(data)}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.alert("Excel export is not available in this build.")}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={() => window.alert("PDF report export is not available in this build.")}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <p>Source: market data feed (live and/or static fallback depending on environment mode).</p>
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
