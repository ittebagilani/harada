import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local"
import { Cormorant_Garamond} from "next/font/google"

const hina = localFont({
  src: "../public/fonts/Hina-Mincho-Regular.ttf",
  variable: "--font-hina",
  display: "swap"
})

const garamond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "grid64",
  description: "achieve your goals with this method",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${garamond.className} antialiased bg-[#f5f5f3]`}
        >
          
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
