import { sql } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sql`
      SELECT "isPremium", "email", "name", "stripeSubscriptionId"
      FROM "User"
      WHERE "clerkId" = ${clerkId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result[0];

    return NextResponse.json({
      isPremium: user.isPremium || false,
      email: user.email,
      name: user.name,
      hasSubscription: !!user.stripeSubscriptionId,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
