import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Registration service not configured",
      details: "Training environment does not persist user accounts."
    },
    { status: 501 }
  );
}
