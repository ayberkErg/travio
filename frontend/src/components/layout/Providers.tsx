'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1714', color: '#fafaf9', borderRadius: '10px' },
          success: { iconTheme: { primary: '#e8930a', secondary: '#fafaf9' } },
        }}
      />
    </QueryClientProvider>
  )
}
