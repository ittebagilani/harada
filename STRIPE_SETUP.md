# Stripe Subscription Setup Guide

This guide will help you set up Stripe subscriptions for your app. Paid users can generate multiple grids (plans), while free users are limited to one active plan.

## Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Your Stripe API keys (available in Stripe Dashboard)

## Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
   - For testing, use the **Test mode** keys
   - For production, use the **Live mode** keys

## Step 2: Set Up Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key (if needed for frontend)

# Stripe Webhook Secret (you'll get this in Step 4)
STRIPE_WEBHOOK_SECRET=whsec_...

# Your app URL (for redirects)
NEXT_PUBLIC_URL=http://localhost:3000  # Change to your production URL when deploying
```

## Step 3: Run Database Migration

Run the migration to add Stripe fields to your database:

```bash
npx prisma migrate deploy
```

Or if you're in development:

```bash
npx prisma migrate dev
```

This will add `stripeCustomerId` and `stripeSubscriptionId` columns to your User table.

## Step 4: Set Up Stripe Webhook

You need to configure a webhook endpoint in Stripe to handle subscription events.

### For Local Development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### For Production:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add it to your production environment variables

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the checkout flow:
   - Navigate to your dashboard
   - Click "New Goal" (if not premium)
   - You should see a premium modal
   - Click "Upgrade Now"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC

3. Verify webhook events:
   - Check your Stripe Dashboard → **Developers** → **Events** to see webhook events
   - Verify that `isPremium` is set to `true` in your database after successful payment

## Step 6: Create a Product in Stripe (Optional)

If you want to customize the subscription:

1. Go to **Products** in Stripe Dashboard
2. Create a new product named "Premium Plan"
3. Set the price to $4.99/month (or your desired price)
4. Update `app/api/create-checkout-session/route.ts` to use the price ID instead of `price_data`:

```typescript
line_items: [
  {
    price: 'price_...', // Your price ID from Stripe
    quantity: 1,
  },
],
```

## API Endpoints

The following API endpoints are available:

### Create Checkout Session
- **POST** `/api/create-checkout-session`
- Creates a Stripe checkout session for subscription
- Requires authentication

### Subscription Portal
- **POST** `/api/subscription/portal`
- Creates a Stripe billing portal session for managing subscriptions
- Users can cancel, update payment methods, view invoices, etc.

### Subscription Status
- **GET** `/api/subscription/status`
- Returns the user's premium status and subscription info

### Webhook Handler
- **POST** `/api/webhooks/stripe`
- Handles Stripe webhook events:
  - `checkout.session.completed` - Activates premium when payment succeeds
  - `customer.subscription.updated` - Updates premium status
  - `customer.subscription.deleted` - Deactivates premium when subscription ends

## Premium Features

- **Free users**: Can have 1 active plan/grid
- **Premium users**: Can have unlimited plans/grids

The premium check is enforced in:
- `/api/plan/create` - Creating new plans
- `/api/goal` - Setting new goals
- `/api/pillars` - Creating new pillars/plans

## Troubleshooting

### Webhook not working?
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check that webhook endpoint URL is correct in Stripe Dashboard
- For local development, make sure Stripe CLI is forwarding events
- Check server logs for webhook errors

### Users not getting premium after payment?
- Check Stripe Dashboard → Events to see if webhook was received
- Verify `client_reference_id` is being set in checkout session (should be Clerk user ID)
- Check database to see if `isPremium` and `stripeCustomerId` are set

### Migration errors?
- Make sure your database connection is working
- Check that Prisma schema matches your database
- Try running `npx prisma generate` to regenerate Prisma client

## Next Steps

1. Add a subscription management page in your UI (using `/api/subscription/portal`)
2. Add premium badges/indicators in your UI
3. Consider adding a free trial period
4. Set up email notifications for subscription events
5. Add analytics to track subscription conversions

