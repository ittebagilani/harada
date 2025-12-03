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

    // Check if user already has an active plan
    const existingActivePlan = await sql`
      SELECT * FROM "Plan" WHERE "userId" = ${userId} AND "isActive" = true
    `

    let plan

    if (existingActivePlan.length > 0) {
      // Check if this plan has pillars (is it complete?)
      const existingPillars = await sql`
        SELECT COUNT(*) as count FROM "Pillar" WHERE "planId" = ${existingActivePlan[0].id}
      `

      const pillarCount = parseInt(existingPillars[0].count)

      if (pillarCount === 0) {
        // Plan exists but is incomplete (no pillars) - update it
        plan = await sql`
          UPDATE "Plan" 
          SET "goal" = ${goal.trim()}, "updatedAt" = ${now.toISOString()}
          WHERE "id" = ${existingActivePlan[0].id}
          RETURNING *
        `
      } else {
        // Plan is complete - check if user can create another
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

        // Deactivate existing plans and create new one
        await sql`
          UPDATE "Plan" SET "isActive" = false WHERE "userId" = ${userId}
        `

        const planId = createId()
        plan = await sql`
          INSERT INTO "Plan" ("id", "userId", "goal", "isActive", "createdAt", "updatedAt")
          VALUES (${planId}, ${userId}, ${goal.trim()}, ${true}, ${now.toISOString()}, ${now.toISOString()})
          RETURNING *
        `
      }
    } else {
      // No active plan exists - check total count
      const allPlans = await sql`
        SELECT COUNT(*) as count FROM "Plan" WHERE "userId" = ${userId}
      `
      
      const planCount = parseInt(allPlans[0].count)
      
      if (!isPremium && planCount >= 1) {
        // User has inactive plans - check if they have pillars
        const inactivePlans = await sql`
          SELECT p.* FROM "Plan" p
          WHERE p."userId" = ${userId}
          ORDER BY p."createdAt" DESC
          LIMIT 1
        `

        if (inactivePlans.length > 0) {
          const checkPillars = await sql`
            SELECT COUNT(*) as count FROM "Pillar" WHERE "planId" = ${inactivePlans[0].id}
          `

          if (parseInt(checkPillars[0].count) === 0) {
            // Reactivate incomplete plan
            plan = await sql`
              UPDATE "Plan" 
              SET "goal" = ${goal.trim()}, "isActive" = true, "updatedAt" = ${now.toISOString()}
              WHERE "id" = ${inactivePlans[0].id}
              RETURNING *
            `
          } else {
            return NextResponse.json({ 
              error: "Free users can only have one plan",
              requiresUpgrade: true
            }, { status: 403 })
          }
        } else {
          return NextResponse.json({ 
            error: "Free users can only have one plan",
            requiresUpgrade: true
          }, { status: 403 })
        }
      } else {
        // Create new plan
        const planId = createId()
        plan = await sql`
          INSERT INTO "Plan" ("id", "userId", "goal", "isActive", "createdAt", "updatedAt")
          VALUES (${planId}, ${userId}, ${goal.trim()}, ${true}, ${now.toISOString()}, ${now.toISOString()})
          RETURNING *
        `
      }
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