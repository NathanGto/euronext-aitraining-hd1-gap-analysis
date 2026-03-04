import { BrentHistoryPoint } from "@/lib/types";

type PriceChartProps = {
  history: BrentHistoryPoint[];
  currency: string;
};

const CHART_WIDTH = 960;
const CHART_HEIGHT = 300;
const PADDING = 28;

function getValidCloseValues(history: BrentHistoryPoint[]): BrentHistoryPoint[] {
  return history.filter((point) => point.close !== null);
}

function formatAxisValue(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
}

export function PriceChart({ history, currency }: PriceChartProps) {
  const series = getValidCloseValues(history);

  if (series.length < 2) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm text-[var(--muted)]">Not enough historical data to draw the chart.</p>
      </div>
    );
  }

  const prices = series.map((point) => point.close as number);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = series
    .map((point, index) => {
      const x = PADDING + (index / (series.length - 1)) * (CHART_WIDTH - PADDING * 2);
      const normalizedY = ((point.close as number) - min) / range;
      const y = CHART_HEIGHT - PADDING - normalizedY * (CHART_HEIGHT - PADDING * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const lastPoint = series[series.length - 1];
  const firstPoint = series[0];
  const isPositive = (lastPoint.close as number) - (firstPoint.close as number) >= 0;
  const lineColor = isPositive ? "var(--positive)" : "var(--negative)";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">6M Price Trend</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Daily close</span>
      </div>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label="Brent price history"
        className="h-64 w-full"
      >
        <rect x="0" y="0" width={CHART_WIDTH} height={CHART_HEIGHT} fill="var(--surface-2)" rx="16" />
        <line
          x1={PADDING}
          x2={CHART_WIDTH - PADDING}
          y1={PADDING}
          y2={PADDING}
          stroke="var(--border)"
          strokeDasharray="4 6"
        />
        <line
          x1={PADDING}
          x2={CHART_WIDTH - PADDING}
          y1={CHART_HEIGHT - PADDING}
          y2={CHART_HEIGHT - PADDING}
          stroke="var(--border)"
          strokeDasharray="4 6"
        />
        <polyline points={points} fill="none" stroke={lineColor} strokeWidth="4" strokeLinecap="round" />
      </svg>

      <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{new Date(firstPoint.date).toLocaleDateString("en-US")}</span>
        <span>{new Date(lastPoint.date).toLocaleDateString("en-US")}</span>
      </div>

      <div className="mt-1 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Low: {formatAxisValue(min, currency)}</span>
        <span>High: {formatAxisValue(max, currency)}</span>
      </div>
    </div>
  );
}
