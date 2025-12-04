import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Cormorant_Garamond } from "next/font/google";


import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"], 
  variable: "--font-inter"

})

const garamond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-garamond"
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
          className={`antialiased bg-[#f5f5f3] ${garamond.className}`}
        >
          
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
