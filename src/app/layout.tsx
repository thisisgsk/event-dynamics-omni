import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import { AppShell } from "@/components/providers/AppShell";
import { brand, seo } from "@/content/site";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: seo.title, template: `%s — ${brand.name}` },
  description: seo.description,
  applicationName: brand.name,
  keywords: ["event management", "corporate events", "weddings", "concerts", "gala dinners", brand.name],
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: seo.title,
    description: seo.description,
    url: brand.url,
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
};

export const viewport: Viewport = {
  themeColor: "#07070A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable} is-loading`} suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
