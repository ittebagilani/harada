import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import StartClient from "@/components/start-client";

export default async function StartPage({
  params,
  searchParams,
}: {
  params: Promise<{ index: string }>;
  searchParams?: Promise<{ newGoal?: string }>;
}) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    redirect("/sign-in");
  }

  // Await params and searchParams (Next.js 16+)
  const { index } = await params;
  const queryParams = await searchParams;

  // Check if user exists and their premium status
  const result = await sql`
    SELECT "isFirstUser", "isPremium" 
    FROM "User" 
    WHERE "clerkId" = ${clerkId}
    LIMIT 1
  `;

  const user = result[0];

  // If user doesn't exist, allow them through
  if (!user) {
    return <StartClient />;
  }

  // If user is premium and creating a new goal, allow them through
  const isNewGoalFlow = queryParams?.newGoal === "true";
  if (isNewGoalFlow && user.isPremium) {
    return <StartClient />;
  }

  // If user exists and is NOT a first-time user (and not premium creating new goal), redirect to dashboard
  if (user && !user.isFirstUser) {
    redirect("/dashboard");
  }

  return <StartClient />;
}