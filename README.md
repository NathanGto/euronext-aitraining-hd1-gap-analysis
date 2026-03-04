# Brent Rates Dashboard (Next.js)

Modern full-stack Next.js app (App Router) that displays Brent crude oil rates with:

- Live quote (price, daily change, percent change)
- Key market stats (open, high, low, previous close, 52-week range, volume)
- 6-month historical trend chart
- Backend API route for market data aggregation

## Stack

- Next.js (App Router, TypeScript)
- React
- Tailwind CSS
- Route Handlers (`/api/brent`)

## Project Structure

- `src/app/page.tsx`: main dashboard page
- `src/components/brent-dashboard.tsx`: client dashboard logic/UI
- `src/components/price-chart.tsx`: SVG chart component
- `src/app/api/brent/route.ts`: backend API endpoint
- `src/lib/brent.ts`: market data fetching/parsing service

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## API

- Endpoint: `GET /api/brent`
- Provider: Yahoo Finance (`BZ=F`)
- Response: normalized JSON snapshot + historical series

## Notes

- Auto-refresh runs every 60 seconds on the client.
- You can override the market symbol via `BRENT_SYMBOL` in your environment.
