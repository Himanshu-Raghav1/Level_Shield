import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BehaviorTracker from "@/components/BehaviorTracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Level Shield – AI-Era Anti-Scraping Firewall",
  description:
    "Level Shield detects scraping intent, protects real users, traps bots, and proves data theft using canary salary tokens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <BehaviorTracker />
        {children}
      </body>
    </html>
  );
}
