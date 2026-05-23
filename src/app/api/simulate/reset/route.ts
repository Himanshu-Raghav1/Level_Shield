import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store/db";

export async function POST(req: NextRequest) {
  try {
    // Clear the main session and replay nonce tables
    // Foreign key cascading will automatically clear all events, risks, canary tokens, and maze hit tables!
    db.prepare("DELETE FROM sessions").run();
    db.prepare("DELETE FROM good_bot_nonces").run();

    return NextResponse.json({
      success: true,
      message: "Database truncated successfully. All demo metrics have been reset."
    });
  } catch (error: any) {
    console.error("Error resetting database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
