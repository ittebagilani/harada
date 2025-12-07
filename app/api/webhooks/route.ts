// app/api/webhooks/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Webhooks root. Use /clerk or /stripe",
    available: ["/api/webhooks/clerk", "/api/webhooks/stripe"],
  });
}