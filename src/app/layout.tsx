import { DM_Sans } from "next/font/google";
import "@/globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  // preload defaults to true; with a single variable font that's fine.
});

export const metadata = {
  title: "MRUHacks 2025",
  description:
    "Join the premier hackathon at Mount Royal University. 24 hours of coding, collaboration, and innovation with prizes and networking opportunities.",
  keywords: [
    "hackathon",
    "MRU",
    "Mount Royal University",
    "coding competition",
    "student hackathon",
    "Calgary tech event",
    "Calgary hackathon",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16" },
      { url: "/favicon-32x32.png", sizes: "32x32" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={dmSans.variable}>
        <Navbar />
        {children}
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
