// app/onboarding/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import OnboardingClient from "@/components/onboarding-client";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ newGoal?: string }>;
}) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    redirect("/sign-in");
  }

  // Check if user exists and their premium status
  const result = await sql`
    SELECT "isFirstUser", "isPremium" 
    FROM "User" 
    WHERE "clerkId" = ${clerkId}
    LIMIT 1
  `;

  const user = result[0];

  // If user doesn't exist, allow onboarding
  if (!user) {
    return <OnboardingClient />;
  }

  // Await searchParams (Next.js 16+)
  const params = await searchParams;
  
  // If user is premium and clicking "New Goal", allow them to create a new goal
  const isNewGoalFlow = params?.newGoal === "true";
  if (isNewGoalFlow && user.isPremium) {
    // Premium users can create multiple goals, so allow them through
    return <OnboardingClient />;
  }

  // If user exists and is NOT a first-time user (and not premium creating new goal), redirect to dashboard
  if (user && !user.isFirstUser) {
    redirect("/dashboard");
  }

  return <OnboardingClient />;
}
