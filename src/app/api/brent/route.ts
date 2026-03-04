import { NextResponse } from "next/server";
import { getBrentSnapshot } from "@/lib/brent";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snapshot = await getBrentSnapshot();

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=120"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to load Brent rates",
        details: message
      },
      { status: 502 }
    );
  }
}
