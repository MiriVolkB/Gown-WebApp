// src/app/layout.tsx
import type { Metadata } from "next";

import "@/app/globals.css";
import Sidebar from "@/components/Sidebar"; 
import Header from "@/components/Header";

import { ClientProvidersLayout } from "./ClientProvidersLayout"; 
import { ModalProvider } from "@/components/providers/modal-provider";

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
          {/* CHANGED: Matches the new sidebar widths! (md:ml-64 lg:ml-80) */}
          <div className="flex flex-col flex-1 md:pl-64 lg:ml-80 min-h-screen w-full transition-all duration-300">
            <ModalProvider />
            
            {/* 3. Global App Header */}
            <Header />

            {/* 4. Main content */}
            <main className="flex-1 p-4 md:p-8">
              {children} 
            </main>
          </div>
        </ClientProvidersLayout>
      </body>
    </html>
  );
}