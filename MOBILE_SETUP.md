# Mobile App Setup Guide (iOS & Android)

This guide will help you publish your Next.js app to iOS and Android using **Capacitor** - the easiest way to convert your existing web app into native mobile apps.

## Why Capacitor?

- ✅ **Minimal code changes** - Your existing Next.js app works as-is
- ✅ **Native features** - Access to device APIs (camera, notifications, etc.)
- ✅ **Single codebase** - Maintain one codebase for web, iOS, and Android
- ✅ **Native performance** - Apps run in native containers
- ✅ **App Store ready** - Can publish to Apple App Store and Google Play Store

## Prerequisites

- **macOS** (required for iOS development) - You can build Android on Windows/Mac/Linux
- **Xcode** (for iOS) - Download from Mac App Store (free, but requires Apple Developer account for publishing)
- **Android Studio** (for Android) - Download from [developer.android.com](https://developer.android.com/studio)
- **Apple Developer Account** ($99/year) - Required to publish to App Store
- **Google Play Developer Account** ($25 one-time) - Required to publish to Play Store

## Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

## Step 2: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- **App name**: grid64 (or your app name)
- **App ID**: com.yourcompany.grid64 (use reverse domain notation)
- **Web dir**: .next (or `out` if using static export)

## Step 3: Configure Next.js for Mobile

### Option A: Static Export (Recommended for Mobile)

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable server-side features that won't work in static export
  // You'll need to handle API routes differently (see below)
}

module.exports = nextConfig
```

**⚠️ Important**: Static export means your API routes won't work. You have two options:

1. **Keep API routes on server** - Deploy your Next.js API to a server (Vercel, Railway, etc.) and point mobile app to that URL
2. **Use Capacitor HTTP plugin** - Make API calls to your deployed backend

### Option B: Keep Server-Side (Hybrid Approach)

Keep your Next.js app as-is and point mobile app to your deployed web URL. This is simpler but requires internet connection.

Update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.grid64',
  appName: 'grid64',
  webDir: '.next',
  server: {
    // Point to your deployed Next.js app
    url: 'https://your-app.vercel.app',
    cleartext: true
  }
};

export default config;
```

## Step 4: Add Mobile Platforms

```bash
# Add iOS platform (macOS only)
npx cap add ios

# Add Android platform
npx cap add android
```

## Step 5: Install Required Plugins

For your app, you'll likely need:

```bash
# HTTP requests (if using API routes)
npm install @capacitor-community/http

# Status bar styling
npm install @capacitor/status-bar

# Splash screen
npm install @capacitor/splash-screen

# Keyboard handling
npm install @capacitor/keyboard

# App state (background/foreground)
npm install @capacitor/app

# Network status
npm install @capacitor/network
```

## Step 6: Update Your Code for Mobile

### Handle API Routes

Since mobile apps can't use Next.js API routes directly, update your API calls:

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}/api${endpoint}`;
  return fetch(url, options);
}
```

Set `NEXT_PUBLIC_API_URL` to your deployed Next.js URL in production.

### Update Clerk for Mobile

Clerk works with Capacitor, but you may need to configure deep linking:

1. Update Clerk dashboard with your app's URL scheme
2. Configure redirect URLs for mobile

### Update Stripe for Mobile

Stripe Checkout works in mobile webview, but you may want to use Stripe's native SDKs for better UX:

```bash
npm install @stripe/stripe-react-native
```

## Step 7: Build Your App

```bash
# Build Next.js app
npm run build

# Copy web assets to native projects
npx cap copy

# Sync native projects
npx cap sync
```

## Step 8: Configure iOS

1. Open Xcode:
   ```bash
   npx cap open ios
   ```

2. Configure signing:
   - Select your project in Xcode
   - Go to "Signing & Capabilities"
   - Select your team (requires Apple Developer account)

3. Configure app settings:
   - Update bundle identifier
   - Set version and build number
   - Configure app icons and splash screens

4. Test on simulator:
   - Select a simulator and click Run

## Step 9: Configure Android

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. Configure signing:
   - Create a keystore for release builds
   - Configure signing in `android/app/build.gradle`

3. Update app settings:
   - Update package name in `AndroidManifest.xml`
   - Set version code and version name
   - Configure app icons and splash screens

4. Test on emulator or device

## Step 10: Handle Mobile-Specific Features

### Update Dashboard Client for Mobile

```typescript
// components/dashboard-client.tsx
import { Capacitor } from '@capacitor/core';

// Check if running on mobile
const isMobile = Capacitor.isNativePlatform();

// Adjust UI for mobile
const padding = isMobile ? 'px-4' : 'px-8';
```

### Handle Deep Links

Configure deep linking for authentication redirects:

```typescript
// In your app initialization
import { App } from '@capacitor/app';

App.addListener('appUrlOpen', (event) => {
  // Handle authentication redirects
  if (event.url.includes('auth-callback')) {
    // Process authentication
  }
});
```

## Step 11: Build for Production

### iOS

1. In Xcode:
   - Select "Any iOS Device" or your connected device
   - Product → Archive
   - Follow App Store Connect upload process

2. Or use command line:
   ```bash
   xcodebuild -workspace ios/App.xcworkspace -scheme App -configuration Release archive
   ```

### Android

1. Generate signed APK/AAB:
   ```bash
   cd android
   ./gradlew assembleRelease  # For APK
   ./gradlew bundleRelease     # For AAB (Play Store)
   ```

2. Find your build:
   - APK: `android/app/build/outputs/apk/release/app-release.apk`
   - AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Step 12: Publish to App Stores

### Apple App Store

1. Create app in App Store Connect
2. Upload build using Xcode or Transporter
3. Fill in app information, screenshots, description
4. Submit for review

### Google Play Store

1. Create app in Google Play Console
2. Upload AAB file
3. Fill in store listing, screenshots, description
4. Submit for review

## Alternative: Progressive Web App (PWA)

If you want a simpler approach without native app stores:

1. Add PWA support to Next.js:
   ```bash
   npm install next-pwa
   ```

2. Update `next.config.js`:
   ```javascript
   const withPWA = require('next-pwa')({
     dest: 'public'
   });

   module.exports = withPWA({
     // your config
   });
   ```

3. Add `manifest.json` and service worker
4. Users can "Add to Home Screen" from browser

## Troubleshooting

### Build Errors
- Make sure you've run `npm run build` before `npx cap sync`
- Clear `.next` folder and rebuild if issues persist

### API Routes Not Working
- Deploy your Next.js API to a server
- Update `NEXT_PUBLIC_API_URL` environment variable
- Use Capacitor HTTP plugin for API calls

### Authentication Issues
- Configure deep linking in Clerk dashboard
- Update redirect URLs for mobile app scheme
- Test authentication flow on device

### Performance Issues
- Optimize images (use Next.js Image component with proper sizing)
- Lazy load components
- Minimize bundle size

## Recommended Next Steps

1. **Start with Android** - Easier to test and deploy
2. **Test on real devices** - Simulators don't catch all issues
3. **Set up CI/CD** - Automate builds and deployments
4. **Add analytics** - Track app usage and crashes
5. **Add crash reporting** - Use Sentry or similar
6. **Optimize for mobile** - Touch targets, responsive design, offline support

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

