import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/components/providers/language-provider";
import { CommandPalette } from "@/components/layout/command-palette";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";
import { WebSiteSchema } from "@/components/seo/structured-data";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SACA — الجالية السودانية الأمريكية · ولاية ميريلاند",
    template: "%s · SACA",
  },
  description:
    "Sudanese American Community Association — الجالية السودانية الأمريكية. منصة رقمية موحدة للجالية السودانية في الولايات المتحدة، بفرع رئيسي في ولاية ميريلاند. منظمات، فعاليات، اجتماعات مباشرة، أخبار، خريطة مجتمعية، ومساعد ذكي داخلي.",
  keywords: [
    "SACA",
    "Sudanese American Community Association",
    "الجالية السودانية الأمريكية",
    "ميريلاند",
    "Maryland",
    "Sudanese American",
    "منظمات سودانية",
    "خريطة الجالية",
  ],
  authors: [{ name: "SACA" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "SACA — الجالية السودانية الأمريكية · ولاية ميريلاند",
    description:
      "Sudanese American Community Association — منصة موحدة للجالية السودانية في الولايات المتحدة، بفرع رئيسي في ولاية ميريلاند.",
    type: "website",
    locale: "ar_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SACA | الجالية السودانية الأمريكية - ولاية ميريلاند",
    description:
      "Sudanese American Community Association — مركز رقمي موحد للجالية السودانية في الولايات المتحدة.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${tajawal.variable} antialiased bg-background text-foreground font-sans`}
      >
        <WebSiteSchema />
        <LanguageProvider>
          {children}
          <CommandPalette />
          <MobileBottomBar />
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
