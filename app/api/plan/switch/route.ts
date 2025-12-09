import { sql } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    // Get user
    const user = await sql`
      SELECT * FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1
    `;

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user[0].id;

    // Verify the plan belongs to this user
    const plan = await sql`
      SELECT * FROM "Plan" WHERE "id" = ${planId} AND "userId" = ${userId} LIMIT 1
    `;

    if (plan.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Deactivate all plans
    await sql`
      UPDATE "Plan" SET "isActive" = false WHERE "userId" = ${userId}
    `;

    // Activate the selected plan
    const updatedPlan = await sql`
      UPDATE "Plan" 
      SET "isActive" = true, "updatedAt" = ${new Date().toISOString()}
      WHERE "id" = ${planId} AND "userId" = ${userId}
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      plan: updatedPlan[0] 
    });
  } catch (error) {
    console.error("Error switching plan:", error);
    return NextResponse.json(
      { error: "Failed to switch plan" },
      { status: 500 }
    );
  }
}

