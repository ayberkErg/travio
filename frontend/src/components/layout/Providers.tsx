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
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const supabase = createClient()

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user))
          setToken(session.access_token)
        }
      }).catch(() => {})

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user))
          setToken(session.access_token)
        } else if (event === 'SIGNED_OUT') {
          // Only clear state on explicit sign-out, not on initial null session
          setUser(null)
          setToken(null)
        }
      })
      subscription = data.subscription
    } catch {
      // Supabase not configured — app runs without auth
    }

    return () => subscription?.unsubscribe()
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
