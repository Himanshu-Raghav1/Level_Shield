import { NextResponse } from "next/server";

// Stub route: accepts behavior telemetry events (mouse velocity, scroll, keystrokes).
// In production this will be handled by the backend risk engine.
export async function POST() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
