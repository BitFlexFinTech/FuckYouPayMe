import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { SessionProvider } from "./session-provider";
import { PwaRegister } from "./pwa-register";

export const metadata: Metadata = {
  title: "FuckYouPayMe — Stop Chasing. Start Collecting.",
  description:
    "Aggressive invoicing and dunning platform for freelancers. You did the work. They didn't pay. We fix that.",
  openGraph: {
    title: "FuckYouPayMe",
    description: "Stop chasing. Start collecting.",
    siteName: "FuckYouPayMe",
    type: "website",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white min-h-screen">
        <SessionProvider>
          <AppProvider>{children}</AppProvider>
        </SessionProvider>
        <PwaRegister />
      </body>
    </html>
  );
}