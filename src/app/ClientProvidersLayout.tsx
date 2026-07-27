'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { GuestWelcomeModal } from '@/components/GuestWelcomeModal';

const queryClient = new QueryClient();

interface ClientProvidersLayoutProps {
  children: ReactNode;
}

export function ClientProvidersLayout({ children }: ClientProvidersLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <GuestWelcomeModal />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
