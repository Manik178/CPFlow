import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CPFlow - The Ultimate Competitive Programming Workspace",
  description: "Solve, learn, and track your competitive programming progress with AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
