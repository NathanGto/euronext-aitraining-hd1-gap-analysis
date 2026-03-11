import { NextResponse } from "next/server";
import { getBrentSnapshotByCommodity } from "@/lib/brent";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const commodity = new URL(request.url).searchParams.get("commodity");
    const snapshot = await getBrentSnapshotByCommodity({ commodity });

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
