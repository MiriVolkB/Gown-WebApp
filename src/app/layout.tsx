import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ClientProvidersLayout } from "./ClientProvidersLayout";

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
      {/* Miri's Font Links */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>

      {/* Combined Classes: Your layout styling + Miri's font smoothing */}
      <body className="flex bg-slate-50 min-h-screen antialiased">
        
        {/* Wrap everything in Miri's Providers so the app has access to data/theme */}
        <ClientProvidersLayout>
          
          {/* Your Sidebar Layout */}
          <Sidebar />

          <main className="flex-1 ml-80">
            {children}
          </main>

        </ClientProvidersLayout>
      </body>
    </html>
  );
}