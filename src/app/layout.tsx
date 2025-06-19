import { DM_Sans } from "next/font/google";
import "@/assets/styles/globals.css";
import React from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
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
      { url: "/favicon-96x96.png", sizes: "96x96" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={dmSans.variable}>
        {children}
      </body>
    </html>
  );
}
