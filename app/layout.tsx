import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import type React from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RoomAI - AI Interior Design Visualizer",
  description:
    "Transform your spaces with AI-powered interior design visualization. Upload a photo, choose a style, and see your room reimagined instantly.",
  generator: "v0.app",
  keywords: [
    "interior design",
    "AI",
    "home decor",
    "room visualization",
    "design tool",
  ],
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
