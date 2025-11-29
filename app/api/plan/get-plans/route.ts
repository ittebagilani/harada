
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let user = await sql`
      SELECT * FROM "User" WHERE "clerkId" = ${clerkId}
    `

    if (user.length === 0) {
      return NextResponse.json({ plans: [] })
    }

    const userId = user[0].id

    const plans = await sql`
      SELECT "id", "goal", "isActive", "createdAt", "updatedAt"
      FROM "Plan"
      WHERE "userId" = ${userId}
      ORDER BY "isActive" DESC, "createdAt" DESC
    `

    return NextResponse.json({ 
      plans,
      isPremium: user[0].isPremium || false
    })
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}