// src/app/layout.tsx
import type { Metadata } from "next";
<<<<<<< HEAD
import "./globals.css";
import Sidebar from "@/components/Sidebar"; 
=======
//import { Geist, Geist_Mono } from "next/font/google";
//import { Playfair_Display } from "next/font/google";
import { ClientProvidersLayout } from "./ClientProvidersLayout"; 
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const playfair = Playfair_Display({
//   subsets: ["latin"],
//   variable: "--font-playfair",
// });
>>>>>>> feature/Client-Module

export const metadata: Metadata = {
  title: "Rachelli Custom Gowns",
  description: "CRM for custom gown business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body className="flex bg-slate-50 min-h-screen">
        {/* 1. Sidebar is always on the left */}
        <Sidebar />

        {/* 2. Main content area (where your pages go) */}
        <main className="flex-1 ml-80">
          {children} 
        </main>
=======
      <head>{/* This is instead of the font import code block */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body
        //className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
        className="antialiased"
      >
        <ClientProvidersLayout>{children}</ClientProvidersLayout>
>>>>>>> feature/Client-Module
      </body>
    </html>
  );
}