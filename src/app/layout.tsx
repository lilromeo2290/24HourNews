import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GhanaNewsHub - Your Trusted Source for Ghana & African News",
  description: "Latest breaking news, politics, business, sports, entertainment, technology and more from Ghana and across Africa. Stay informed with GhanaNewsHub.",
  keywords: ["Ghana news", "Africa news", "breaking news", "politics", "sports", "business", "entertainment", "technology"],
  authors: [{ name: "GhanaNewsHub" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "GhanaNewsHub - Your Trusted Source for Ghana & African News",
    description: "Latest breaking news, politics, business, sports, entertainment from Ghana and Africa.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GhanaNewsHub",
    description: "Your Trusted Source for Ghana & African News",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}