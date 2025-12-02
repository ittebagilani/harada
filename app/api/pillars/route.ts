// app/api/pillars/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { createId } from "@paralleldrive/cuid2"

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get planId from query params (optional - for premium users with multiple plans)
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    let user = await sql`
      SELECT * FROM "User" WHERE "clerkId" = ${clerkId}
    `

    if (user.length === 0) {
      return NextResponse.json({ pillars: [] })
    }

    const userId = user[0].id

    // Get the appropriate plan
    let plan
    if (planId) {
      // Get specific plan (for premium users)
      plan = await sql`
        SELECT * FROM "Plan" 
        WHERE "userId" = ${userId} AND "id" = ${planId}
      `
    } else {
      // Get active plan (default behavior)
      plan = await sql`
        SELECT * FROM "Plan" 
        WHERE "userId" = ${userId} AND "isActive" = true
        ORDER BY "createdAt" DESC
        LIMIT 1
      `
    }

    if (plan.length === 0) {
      return NextResponse.json({ pillars: [] })
    }

    const activePlanId = plan[0].id

    // Get pillars for this plan
    const pillars = await sql`
      SELECT "id", "title" FROM "Pillar"
      WHERE "planId" = ${activePlanId}
      ORDER BY "createdAt"
    `

    return NextResponse.json({ 
      pillars: pillars.map((p: any) => p.title),
      planId: activePlanId
    })
  } catch (error) {
    console.error("Error fetching pillars:", error)
    return NextResponse.json({ error: "Failed to fetch pillars" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pillars, planId, goal } = await request.json()

    if (!Array.isArray(pillars) || pillars.length === 0) {
      return NextResponse.json({ error: "Invalid pillars data" }, { status: 400 })
    }

    // Validate pillars (basic check)
    const validPillars = pillars.filter(p => 
      typeof p === 'string' && p.trim().length > 0 && p.trim().length <= 100
    )

    if (validPillars.length === 0) {
      return NextResponse.json({ error: "No valid pillars provided" }, { status: 400 })
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

    let activePlanId: string

    if (planId) {
      // Updating an existing plan
      activePlanId = planId
      
      // Verify user owns this plan
      const planCheck = await sql`
        SELECT * FROM "Plan" WHERE "id" = ${planId} AND "userId" = ${userId}
      `
      
      if (planCheck.length === 0) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 })
      }

      // Delete existing pillars for this plan
      await sql`
        DELETE FROM "Pillar" WHERE "planId" = ${planId}
      `
    } else {
      // Check if user has an existing active plan without pillars (incomplete onboarding)
      const existingActivePlan = await sql`
        SELECT p.* FROM "Plan" p
        WHERE p."userId" = ${userId} AND p."isActive" = true
        ORDER BY p."createdAt" DESC
        LIMIT 1
      `

      if (existingActivePlan.length > 0) {
        // Check if this plan has pillars
        const existingPillars = await sql`
          SELECT COUNT(*) as count FROM "Pillar" WHERE "planId" = ${existingActivePlan[0].id}
        `

        const pillarCount = parseInt(existingPillars[0].count)

        if (pillarCount === 0) {
          // Plan exists but has no pillars - this is an incomplete onboarding, reuse it
          activePlanId = existingActivePlan[0].id
          
          // Update goal if provided
          if (goal) {
            await sql`
              UPDATE "Plan" 
              SET "goal" = ${goal}, "updatedAt" = ${now.toISOString()}
              WHERE "id" = ${activePlanId}
            `
          }
        } else {
          // Plan exists with pillars - check if user can create another plan
          const allPlans = await sql`
            SELECT COUNT(*) as count FROM "Plan" WHERE "userId" = ${userId}
          `
          
          const totalPlanCount = parseInt(allPlans[0].count)
          
          if (!isPremium && totalPlanCount >= 1) {
            return NextResponse.json({ 
              error: "Free users can only have one plan. Upgrade to premium for multiple goals.",
              requiresUpgrade: true
            }, { status: 403 })
          }

          // Deactivate all other plans and create new one
          await sql`
            UPDATE "Plan" SET "isActive" = false WHERE "userId" = ${userId}
          `

          const newPlanId = createId()
          const plan = await sql`
            INSERT INTO "Plan" ("id", "userId", "goal", "isActive", "createdAt", "updatedAt")
            VALUES (${newPlanId}, ${userId}, ${goal || "TBD"}, ${true}, ${now.toISOString()}, ${now.toISOString()})
            RETURNING *
          `
          activePlanId = plan[0].id
        }
      } else {
        // No active plan exists, check total plan count
        const allPlans = await sql`
          SELECT COUNT(*) as count FROM "Plan" WHERE "userId" = ${userId}
        `
        
        const totalPlanCount = parseInt(allPlans[0].count)
        
        if (!isPremium && totalPlanCount >= 1) {
          return NextResponse.json({ 
            error: "Free users can only have one plan. Upgrade to premium for multiple goals.",
            requiresUpgrade: true
          }, { status: 403 })
        }

        // Create new plan
        const newPlanId = createId()
        const plan = await sql`
          INSERT INTO "Plan" ("id", "userId", "goal", "isActive", "createdAt", "updatedAt")
          VALUES (${newPlanId}, ${userId}, ${goal || "TBD"}, ${true}, ${now.toISOString()}, ${now.toISOString()})
          RETURNING *
        `
        activePlanId = plan[0].id
      }
    }

    // Insert new pillars
    const insertedPillars = []
    for (const pillarTitle of validPillars) {
      const pillarId = createId()
      const result = await sql`
        INSERT INTO "Pillar" ("id", "planId", "title", "createdAt", "updatedAt")
        VALUES (${pillarId}, ${activePlanId}, ${pillarTitle.trim()}, ${now.toISOString()}, ${now.toISOString()})
        RETURNING *
      `
      insertedPillars.push(result[0])
    }

    return NextResponse.json({ 
      success: true, 
      pillars: insertedPillars,
      planId: activePlanId,
      message: `Saved ${insertedPillars.length} pillars`
    })
  } catch (error) {
    console.error("Error saving pillars:", error)
    return NextResponse.json({ error: "Failed to save pillars" }, { status: 500 })
  }
}