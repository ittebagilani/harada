import { sql } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goal } = await req.json();
    if (!goal) {
      return NextResponse.json({ error: "Goal required" }, { status: 400 });
    }

    // Get user from DB
    let user = await sql`
      SELECT * FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1
    `;

    let userId: string;

    if (user.length === 0) {
      // Create user if not found
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "";
      const name = clerkUser?.firstName && clerkUser?.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}` 
        : null;

      userId = createId();

      user = await sql`
        INSERT INTO "User" ("id", "clerkId", "email", "name")
        VALUES (${userId}, ${clerkId}, ${email}, ${name})
        RETURNING *
      `;
    } else {
      userId = user[0].id;
    }

    const isPremium = user[0]?.isPremium || false;

    // Check if user can create a new plan
    if (!isPremium) {
      // Free users can only have 1 active plan
      const existingPlans = await sql`
        SELECT COUNT(*) as count FROM "Plan"
        WHERE "userId" = ${userId} AND "isActive" = true
      `;

      if (existingPlans[0]?.count > 0) {
        return NextResponse.json(
          { 
            error: "Free users can only have one active plan. Upgrade to Premium to create multiple plans.",
            requiresPremium: true 
          },
          { status: 403 }
        );
      }
    }

    // Create plan
    const newPlan = await sql`
      INSERT INTO "Plan" ("id", "userId", "goal", "isActive", "createdAt", "updatedAt")
      VALUES (${createId()}, ${userId}, ${goal}, true, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json({ plan: newPlan[0] });

  } catch (err: any) {
    console.error("Error creating plan:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
