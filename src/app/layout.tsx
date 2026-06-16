// src/app/layout.tsx
import type { Metadata } from "next";

import "./globals.css"; // Change to relative path
import Sidebar from "@/components/Sidebar"; 
import Header from "@/components/Header";

//import { Geist, Geist_Mono } from "next/font/google";
//import { Playfair_Display } from "next/font/google";
import { ClientProvidersLayout } from "./ClientProvidersLayout"; 
import { ModalProvider } from "@/components/providers/modal-provider";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased flex bg-slate-50 min-h-screen w-full overflow-x-hidden">
        {/* 1. Sidebar (Hidden on small screens, shown on desktop) */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* 2. Content Area Wrapper */}
        <ClientProvidersLayout>
          {/* CHANGED: ml-80 is now md:ml-80. It only pushes content over on desktop. */}
          <div className="flex flex-col flex-1 md:ml-80 min-h-screen w-full">
            <ModalProvider />
            
            {/* 3. Global App Header */}
            <Header />

            {/* 4. Main content (CHANGED: p-4 on mobile, md:p-8 on desktop) */}
            <main className="flex-1 p-4 md:p-8">
              {children} 
            </main>
          </div>
        </ClientProvidersLayout>
      </body>
    </html>
  );
}