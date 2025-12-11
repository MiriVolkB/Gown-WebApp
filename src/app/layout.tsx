// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; 

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
      <body className="flex bg-slate-50 min-h-screen">
        {/* 1. Sidebar is always on the left */}
        <Sidebar />

        {/* 2. Main content area (where your pages go) */}
        <main className="flex-1 ml-80">
          {children} 
        </main>
      </body>
    </html>
  );
}