import { NextResponse } from "next/server";

// Stub route: accepts page-view telemetry events from the frontend.
// In production this will be handled by the backend risk engine.
export async function POST() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
