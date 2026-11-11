import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Montserrat, Unbounded } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/react-query";
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({ subsets: ['latin'], variable: '--font-heading' });

const notoSans = Noto_Sans({ subsets: ['latin'], weight: ["200", "300", "400", "500", "600", "700", "800", "900"], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Use Mana",
  description: "Moda fitness de alta qualidade para você alcançar seus objetivos com estilo e conforto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={cn("font-sans", notoSans.className)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased light:bg-secondary dark:bg-background dark`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
