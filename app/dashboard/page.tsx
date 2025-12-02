import { sql } from "@/lib/db";
import DashboardClient from "@/components/dashboard-client";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  // Query your DB directly
  const dbUser = await sql`
    SELECT "isFirstUser" 
    FROM "User" 
    WHERE "clerkId" = ${user.id}
    LIMIT 1
  `;

  // If user not found, force onboarding
  if (!dbUser[0]) redirect("/onboarding");

  // If first-time → go to onboarding
  if (dbUser[0].isFirstUser) redirect("/onboarding");

  // Otherwise → show dashboard
  return <DashboardClient />;
}