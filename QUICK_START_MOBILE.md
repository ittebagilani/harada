# Quick Start: Mobile App Setup

This is a condensed guide to get your app running on mobile quickly.

## Prerequisites Checklist

- [ ] macOS (for iOS development) or Windows/Linux (for Android only)
- [ ] Xcode installed (iOS) - [Download](https://apps.apple.com/us/app/xcode/id497799835)
- [ ] Android Studio installed (Android) - [Download](https://developer.android.com/studio)
- [ ] Apple Developer Account ($99/year) - [Sign up](https://developer.apple.com/programs/)
- [ ] Google Play Developer Account ($25 one-time) - [Sign up](https://play.google.com/console/signup)

## Step 1: Install Capacitor (5 minutes)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard @capacitor/app
```

## Step 2: Initialize Capacitor

```bash
npx cap init
```

**When prompted:**
- App name: `grid64`
- App ID: `com.grid64.app` (or your domain)
- Web dir: `.next`

## Step 3: Deploy Your Next.js App

**Important**: Mobile apps need your API to be accessible. Deploy to:
- Vercel (recommended): `vercel deploy`
- Railway: `railway up`
- Or any hosting service

After deployment, update `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NEXT_PUBLIC_URL=https://your-app.vercel.app
```

## Step 4: Add Mobile Platforms

```bash
# Add iOS (macOS only)
npx cap add ios

# Add Android
npx cap add android
```

## Step 5: Build and Sync

```bash
# Build your Next.js app
npm run build

# Copy to mobile projects
npx cap sync
```

## Step 6: Test on iOS (macOS only)

```bash
npx cap open ios
```

In Xcode:
1. Select a simulator (iPhone 15, etc.)
2. Click the Play button
3. App should launch!

## Step 7: Test on Android

```bash
npx cap open android
```

In Android Studio:
1. Create/start an emulator (or connect device)
2. Click Run
3. App should launch!

## Step 8: Configure for Production

### iOS Configuration

1. In Xcode, select your project
2. Go to "Signing & Capabilities"
3. Select your Apple Developer team
4. Update bundle identifier if needed

### Android Configuration

1. In Android Studio, open `android/app/build.gradle`
2. Update `applicationId` to match your package name
3. Configure signing for release builds

## Step 9: Build Release Versions

### iOS

```bash
npx cap open ios
```

In Xcode:
- Product → Archive
- Follow App Store Connect upload

### Android

```bash
cd android
./gradlew assembleRelease  # For APK
./gradlew bundleRelease     # For AAB (Play Store)
```

## Common Issues & Solutions

### "API routes not working"
- Make sure `NEXT_PUBLIC_API_URL` is set to your deployed app
- Check network connectivity on device

### "Authentication not working"
- Configure deep linking in Clerk dashboard
- Update redirect URLs for mobile app scheme

### "Build errors"
- Run `npm run build` before `npx cap sync`
- Clear `.next` folder and rebuild

### "Can't find Capacitor"
- Make sure you installed dependencies: `npm install`
- Check that `node_modules` exists

## Next Steps

1. **Test thoroughly** on real devices
2. **Add app icons** and splash screens
3. **Configure deep linking** for authentication
4. **Set up CI/CD** for automated builds
5. **Submit to app stores** (see MOBILE_SETUP.md for details)

## Need Help?

- Full guide: See `MOBILE_SETUP.md`
- Capacitor docs: https://capacitorjs.com/docs
- Next.js deployment: https://nextjs.org/docs/deployment

