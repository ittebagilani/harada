import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import StartClient from "@/components/start-client";

export default async function StartPage() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    redirect("/sign-in");
  }

  // Check if user exists and if they're a first-time user
  const result = await sql`
    SELECT "isFirstUser" 
    FROM "User" 
    WHERE "clerkId" = ${clerkId}
    LIMIT 1
  `;

  const user = result[0];

  // If user exists and is NOT a first-time user, redirect to dashboard
  if (user && !user.isFirstUser) {
    redirect("/dashboard");
  }

  return <StartClient />;
}