## Capacitor setup & testing

### Prereqs
- Xcode (for iOS) / Android Studio + SDK (for Android)
- Java 17+ for Android builds
- `npm install` (includes Capacitor deps)

### Dev workflow (fast reload from web dev server)
1) Start Next dev server on LAN IP:
   ```bash
   npm run dev
   # find your LAN IP, e.g. 192.168.x.x
   ```
2) Set `server.url` in `capacitor.config.ts` to `http://<LAN_IP>:3000` and `cleartext: true` (for Android HTTP).
3) Copy assets (still needed for native project setup):
   ```bash
   npx cap copy
   ```
4) Open and run:
   - iOS: `npx cap open ios` → run in Xcode (simulator or device)
   - Android: `npx cap open android` → run in Android Studio (emulator/device)

### Production-like test (bundled assets)
1) Export static web bundle:
   ```bash
   npm run mobile:sync    # runs next build && next export, then cap sync
   ```
2) Open native projects:
   ```bash
   npm run mobile:ios
   # or
   npm run mobile:android
   ```
3) Run from Xcode/Android Studio. The app serves from `out/` (configured via `webDir`).

### Notes
- `webDir` is `out` (static export). If you need server-only features, point the app to your hosted API via env vars and keep static pages client-side.
- After changing Capacitor config or adding plugins: `npx cap sync`.
- For Android HTTP dev, ensure `cleartext: true` in `server` config; for iOS, allow arbitrary loads in dev if hitting HTTP.
- To add plugins: `npm install @capacitor/<plugin> && npx cap sync`.

### Troubleshooting
- Black/blank screen: ensure `mobile:sync` ran and `out/` exists, or that `server.url` is reachable from device/emulator.
- Device cannot reach dev server: use LAN IP (not localhost), ensure same network, and open firewall for port 3000.

