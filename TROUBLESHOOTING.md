# Troubleshooting: "No checkout URL returned"

If you're seeing the error "No checkout URL returned", it's likely due to missing environment variables. Follow these steps:

## Step 1: Check Your Environment Variables

Make sure you have a `.env.local` file in your project root with:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_URL=http://localhost:3000
```

**Important:** 
- For local development, use test keys (starting with `sk_test_`)
- Get your keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- The `NEXT_PUBLIC_URL` should match your local development URL

## Step 2: Restart Your Development Server

After adding/changing environment variables, you **must** restart your Next.js server:

1. Stop the server (Ctrl+C)
2. Start it again: `npm run dev`

Environment variables are only loaded when the server starts.

## Step 3: Verify the Error

With the updated error handling, you should now see a more specific error message. Check:

1. **Browser console** - Look for the error message
2. **Server logs** - Check your terminal where `npm run dev` is running
3. **Network tab** - In browser DevTools, check the response from `/api/create-checkout-session`

## Common Issues

### Issue: "STRIPE_SECRET_KEY is missing"
**Solution:** Add `STRIPE_SECRET_KEY` to your `.env.local` file

### Issue: "NEXT_PUBLIC_URL is missing"
**Solution:** Add `NEXT_PUBLIC_URL=http://localhost:3000` to your `.env.local` file

### Issue: "Unauthorized"
**Solution:** Make sure you're logged in with Clerk

### Issue: Stripe API error
**Solution:** 
- Verify your Stripe secret key is correct
- Make sure you're using test keys for development
- Check Stripe Dashboard for any account issues

## Testing

1. Make sure your `.env.local` file exists and has the correct values
2. Restart your dev server
3. Try the upgrade flow again
4. Check the browser console and server logs for specific error messages

## Still Having Issues?

1. Check server logs in your terminal for detailed error messages
2. Verify your Stripe account is active
3. Try creating a test checkout session directly in Stripe Dashboard to verify your account works
4. Check that your Stripe secret key has the correct permissions

