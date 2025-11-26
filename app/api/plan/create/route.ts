import { sql } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const { id: clerkId, emailAddresses, firstName } = user;
    const email = emailAddresses[0]?.emailAddress;

    const { goal } = await req.json();
    if (!goal) return new Response("Goal required", { status: 400 });

    // Ensure user exists in DB
    const existingUser = await sql`
      SELECT id, is_first_user FROM "User"
      WHERE clerk_id = ${clerkId}
      LIMIT 1;
    `;

    let userId: string;

    if (existingUser.length === 0) {
      // Create user if not found
      const created = await sql`
        INSERT INTO "User" (clerk_id, email, name)
        VALUES (${clerkId}, ${email}, ${firstName})
        RETURNING id, is_first_user;
      `;
      userId = created[0].id;
    } else {
      userId = existingUser[0].id;
    }

    // Create plan
    const newPlan = await sql`
      INSERT INTO "Plan" (user_id, goal)
      VALUES (${userId}, ${goal})
      RETURNING *;
    `;

    return Response.json({ plan: newPlan[0] });

  } catch (err) {
    console.error(err);
    return new Response("Server error", { status: 500 });
  }
}
