import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LAT Assessment Platform | Competency-Based Assessments",
  description: "Advanced competency-based assessment platform supporting NEP 2020 and NCF 2023 frameworks with AI-generated questions and gap analysis.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: 'var(--font-inter), sans-serif' }} suppressHydrationWarning>{children}</body>
    </html>
  );
}
