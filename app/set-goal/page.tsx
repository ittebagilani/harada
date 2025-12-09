import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import HomeClient from "@/components/home-client";

export default async function SetGoalPage() {
  const { userId: clerkId } = await auth();
  
  // If user is not signed in, show the goal entry page
  if (!clerkId) {
    return <HomeClient />;
  }

  // Check if user exists and their premium status
  const result = await sql`
    SELECT "id", "isPremium" 
    FROM "User" 
    WHERE "clerkId" = ${clerkId}
    LIMIT 1
  `;

  const user = result[0];

  // If user doesn't exist, show goal entry page
  if (!user) {
    return <HomeClient />;
  }

  // If user is premium, allow them to create new goals (show goal entry page)
  if (user.isPremium) {
    return <HomeClient />;
  }

  // If free user, check if they have an active plan
  const planResult = await sql`
    SELECT COUNT(*) as count
    FROM "Plan"
    WHERE "userId" = ${user.id} AND "isActive" = true
  `;

  const hasActivePlan = parseInt(planResult[0]?.count || "0") > 0;

  // If free user has an active plan, redirect to dashboard
  if (hasActivePlan) {
    redirect("/dashboard");
  }

  // Free user without a plan can use the goal entry page
  return <HomeClient />;
}

