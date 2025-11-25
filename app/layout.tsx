import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local"

const hina = localFont({
  src: "../public/fonts/Hina-Mincho-Regular.ttf",
  variable: "--font-hina",
  display: "swap"
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
          className={`font-['Hina'] antialiased bg-[#f5f5f3]`}
        >
          
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
