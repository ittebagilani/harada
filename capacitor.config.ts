import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.grid64.app',
  appName: 'grid64',
  // Use the static export output for bundling into the native shell
  webDir: 'out',
  server: {
    // Point to your Next dev server over LAN
    url: 'http://192.168.40.10:3000',
    // Needed for Android HTTP dev
    cleartext: true,
    // Allow navigation to the dev server (helps avoid blank screen on iOS)
    allowNavigation: ['192.168.40.10:3000'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#f5f5f3",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;

