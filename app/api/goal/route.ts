// app/api/goal/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { goal } = await request.json()

    if (!goal || typeof goal !== 'string' || goal.trim().length < 3) {
      return NextResponse.json({ error: "Invalid goal" }, { status: 400 })
    }

    let user = await sql`
      SELECT * FROM "User" WHERE "clerkId" = ${clerkId}
    `

    if (user.length === 0) {
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || ""
      const name = clerkUser?.firstName && clerkUser?.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}` 
        : null

      const userId = createId()

      user = await sql`
        INSERT INTO "User" ("id", "clerkId", "email", "name")
        VALUES (${userId}, ${clerkId}, ${email}, ${name})
        RETURNING *
      `
    }

    const userId = user[0].id
    const isPremium = user[0].isPremium || false
    const now = new Date()

    // Check if user already has a plan
    const existingPlans = await sql`
      SELECT * FROM "Plan" WHERE "userId" = ${userId} AND "isActive" = true
    `

    let plan

    if (existingPlans.length > 0) {
      // Update existing active plan's goal
      plan = await sql`
        UPDATE "Plan" 
        SET "goal" = ${goal.trim()}, "updatedAt" = ${now.toISOString()}
        WHERE "id" = ${existingPlans[0].id}
        RETURNING *
      `
    } else {
      // Check plan limit for free users
      const allPlans = await sql`
        SELECT COUNT(*) as count FROM "Plan" WHERE "userId" = ${userId}
      `
      
      const planCount = parseInt(allPlans[0].count)
      
      if (!isPremium && planCount >= 1) {
        return NextResponse.json({ 
          error: "Free users can only have one plan",
          requiresUpgrade: true
        }, { status: 403 })
      }

      // Create new plan with goal
      const planId = createId()
      plan = await sql`
        INSERT INTO "Plan" ("id", "userId", "goal", "isActive", "createdAt", "updatedAt")
        VALUES (${planId}, ${userId}, ${goal.trim()}, ${true}, ${now.toISOString()}, ${now.toISOString()})
        RETURNING *
      `
    }

    return NextResponse.json({ 
      success: true, 
      plan: plan[0]
    })
  } catch (error) {
    console.error("Error saving goal:", error)
    return NextResponse.json({ error: "Failed to save goal" }, { status: 500 })
  }
}

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
      return NextResponse.json({ goal: null })
    }

    const userId = user[0].id

    const plan = await sql`
      SELECT "goal" FROM "Plan" 
      WHERE "userId" = ${userId} AND "isActive" = true
      ORDER BY "createdAt" DESC
      LIMIT 1
    `

    return NextResponse.json({ 
      goal: plan.length > 0 ? plan[0].goal : null
    })
  } catch (error) {
    console.error("Error fetching goal:", error)
    return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 })
  }
}