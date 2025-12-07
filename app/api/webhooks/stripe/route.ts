// app/api/webhooks/stripe/route.ts

import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Check for required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Stripe configuration error" },
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.client_reference_id;

        if (!clerkUserId) {
          console.error("Missing client_reference_id in session", session.id);
          return NextResponse.json(
            { error: "No user ID in session" },
            { status: 400 }
          );
        }

        // For subscription mode, customer and subscription should be available
        const customerId = session.customer;
        let subscriptionId = session.subscription;

        if (!customerId || typeof customerId !== "string") {
          console.error("Missing or invalid customer ID in session", session.id);
          return NextResponse.json(
            { error: "Invalid customer ID" },
            { status: 400 }
          );
        }

        // If subscription is not directly available, try to retrieve it
        if (!subscriptionId || typeof subscriptionId !== "string") {
          console.warn("Subscription ID not in session, attempting to retrieve...", session.id);
          
          // Try to retrieve the session with expanded subscription
          try {
            const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
              expand: ['subscription'],
            });
            subscriptionId = expandedSession.subscription as string | null;
          } catch (retrieveError: any) {
            console.error("Error retrieving session:", retrieveError);
          }

          // If still no subscription, log but continue (subscription.created event will handle it)
          if (!subscriptionId || typeof subscriptionId !== "string") {
            console.warn("Subscription ID still not available, will be set by subscription.created event");
            // Still update customer and premium status, subscription will be set later
            try {
              await sql`
                UPDATE "User"
                SET 
                  "isPremium" = true,
                  "stripeCustomerId" = ${customerId}
                WHERE "clerkId" = ${clerkUserId}
              `;
              console.log(`Updated user ${clerkUserId} to premium (subscription pending)`);
              return NextResponse.json({ received: true, note: "Subscription ID pending" });
            } catch (dbError: any) {
              console.error("Database error updating user:", dbError);
              return NextResponse.json(
                { error: "Database error", details: dbError.message },
                { status: 500 }
              );
            }
          }
        }

        try {
          await sql`
            UPDATE "User"
            SET 
              "isPremium" = true,
              "stripeCustomerId" = ${customerId},
              "stripeSubscriptionId" = ${subscriptionId}
            WHERE "clerkId" = ${clerkUserId}
          `;
          console.log(`Updated user ${clerkUserId} to premium with subscription ${subscriptionId}`);
        } catch (dbError: any) {
          console.error("Database error updating user:", dbError);
          return NextResponse.json(
            { error: "Database error", details: dbError.message },
            { status: 500 }
          );
        }
        break;
      }

      case "customer.subscription.created": {
        // Handle case where subscription is created after checkout
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer;

        if (!customerId || typeof customerId !== "string") {
          console.error("Invalid customer ID in subscription", subscription.id);
          break;
        }

        try {
          await sql`
            UPDATE "User"
            SET 
              "isPremium" = true,
              "stripeSubscriptionId" = ${subscription.id}
            WHERE "stripeCustomerId" = ${customerId}
              AND ("stripeSubscriptionId" IS NULL OR "stripeSubscriptionId" = '')
          `;
          console.log(`Updated subscription ID for customer ${customerId}`);
        } catch (dbError: any) {
          console.error("Database error updating subscription:", dbError);
        }
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer;

        if (!customerId || typeof customerId !== "string") {
          console.error("Invalid customer ID in subscription", subscription.id);
          return NextResponse.json(
            { error: "Invalid customer ID" },
            { status: 400 }
          );
        }

        const isActive = subscription.status === "active" || subscription.status === "trialing";

        try {
          await sql`
            UPDATE "User"
            SET "isPremium" = ${isActive}
            WHERE "stripeCustomerId" = ${customerId}
          `;
          console.log(`Updated subscription status for customer ${customerId}: ${isActive}`);
        } catch (dbError: any) {
          console.error("Database error updating subscription:", dbError);
          return NextResponse.json(
            { error: "Database error", details: dbError.message },
            { status: 500 }
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Unexpected webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: { bodyParser: false },
};