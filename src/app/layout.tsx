import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Raleway, Outfit, Montserrat } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/react-query";
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({ subsets: ['latin'], variable: '--font-heading' });

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RD Fitness",
  description: "Moda fitness de alta qualidade para você alcançar seus objetivos com estilo e conforto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={cn("font-sans", outfit.variable, montserratHeading.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased light:bg-secondary dark:bg-background dark`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
