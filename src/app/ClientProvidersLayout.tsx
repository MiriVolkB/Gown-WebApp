'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



// Create a QueryClient instance
const queryClient = new QueryClient();

interface ClientProvidersLayoutProps {
  children: ReactNode;
}

export function ClientProvidersLayout({ children }: ClientProvidersLayoutProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
