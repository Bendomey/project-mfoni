import type { Metadata } from "next";
import { Inter } from 'next/font/google'

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/Theme-provider"

const inter = Inter({ subsets: ['latin'],  })


export const metadata: Metadata = {
  title: "mfoni admin",
  description: "mfoni admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
  className={`${inter.className} bg-background text-foreground  antialiased`}
        >
                     <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        {children}
          </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
