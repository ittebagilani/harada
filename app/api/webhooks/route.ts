import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { createId } from '@paralleldrive/cuid2'


export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name } = evt.data;

      await sql`
        INSERT INTO "User" (id, "clerkId", email, name, "isFirstUser", "createdAt")
        VALUES (
          ${createId()},
          ${id},
          ${email_addresses[0].email_address},
          ${first_name || null},
          true,
          NOW()
        )
      `;

      console.log("User created:", id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
