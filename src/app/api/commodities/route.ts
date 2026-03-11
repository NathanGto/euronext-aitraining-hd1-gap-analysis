import { NextResponse } from "next/server";
import { COMMODITIES } from "@/lib/commodities";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    items: COMMODITIES,
    comparisonEnabled: false
  });
}
