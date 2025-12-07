// app/api/subscription/status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await sql`
      SELECT 
        "isPremium",
        "stripeCustomerId",
        "stripeSubscriptionId"
      FROM "User" 
      WHERE "clerkId" = ${clerkId} 
      LIMIT 1
    `;

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      isPremium: user[0].isPremium || false,
      hasSubscription: !!user[0].stripeSubscriptionId,
    });
  } catch (err: any) {
    console.error("Error fetching subscription status:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

