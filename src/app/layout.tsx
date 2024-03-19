import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import Navbar from "@/components/nav-bar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `TUF Code Snippets`,
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "w-full h-full")}>
        <Providers>
          <Navbar />
          <div className="w-full h-full mt-16">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
