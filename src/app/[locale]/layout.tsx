"use client";
import { I18nProviderClient } from "@/locale/client";
import { ReactElement, use } from "react";
import { Fraunces, Outfit } from "next/font/google";
import '../globals.css';

// Font setup
const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-serif",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-sans",
});

export default function Layout({
  children,
  params,
}: {
  children: ReactElement;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased min-h-screen bg-white">
        <I18nProviderClient locale={locale}>{children}</I18nProviderClient>
      </body>
    </html>
  );
}
