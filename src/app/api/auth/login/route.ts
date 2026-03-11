import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Authentication service not configured",
      details: "Training environment does not provide user identity services."
    },
    { status: 501 }
  );
}
