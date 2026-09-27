import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scam Radar - Spot Financial Scams, Stay Safe",
  description: "Learn to recognize financial scams before they cost you money. Practice with real examples, scan suspicious messages instantly.",
  keywords: ["scam detection", "financial literacy", "fraud prevention", "phishing", "security awareness"],
  authors: [{ name: "Scam Radar Team" }],
  openGraph: {
    title: "Scam Radar - Spot Financial Scams, Stay Safe",
    description: "Learn to recognize financial scams before they cost you money.",
    type: "website",
    locale: "en_US",
    siteName: "Scam Radar",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}