'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { mapSupabaseUser } from '@/lib/auth'

function AuthSync() {
  const { setUser, setToken, logout } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Sayfa açılışında mevcut oturumu kontrol et (Google OAuth sonrası)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
        setToken(session.access_token)
      }
    })

    // Oturum değişikliklerini dinle (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
        setToken(session.access_token)
      } else {
        logout()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setToken, logout])

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
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
