// src/app/layout.tsx
import type { Metadata } from "next";

import "./globals.css";
import Sidebar from "@/components/Sidebar"; 
import Header from "@/components/Header";

//import { Geist, Geist_Mono } from "next/font/google";
//import { Playfair_Display } from "next/font/google";
import { ClientProvidersLayout } from "./ClientProvidersLayout"; 
import "./globals.css";
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
      <body className="antialiased flex bg-slate-50 min-h-screen">
        {/* 1. Sidebar (Fixed width on the left) */}
        <Sidebar />

        {/* 2. Content Area Wrapper */}
        <ClientProvidersLayout>
          {/* ml-80 matches the sidebar width. flex-col stacks Header + Main */}
          <div className="flex flex-col flex-1 ml-80 min-h-screen">
            <ModalProvider />
            {/* 3. Global App Header */}
            <Header />

            {/* 4. Main content (Remove ml-80 from here) */}
            <main className="flex-1 p-8">
              {children} 
            </main>
          </div>
        </ClientProvidersLayout>
      </body>
    </html>
  );
}