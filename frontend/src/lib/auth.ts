import { createClient } from '@/lib/supabase'
import type { User } from '@/types'

export function mapSupabaseUser(supabaseUser: {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}): User {
  const meta = supabaseUser.user_metadata ?? {}
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    full_name: (meta.full_name as string) || (meta.name as string) || '',
    subscription_tier: (meta.subscription_tier as User['subscription_tier']) || 'free',
    plans_generated_this_month: (meta.plans_generated_this_month as number) || 0,
  }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return { user: mapSupabaseUser(data.user), token: data.session.access_token }
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Kayıt başarısız')
  return { user: mapSupabaseUser(data.user), token: data.session?.access_token ?? null }
}

export async function signInWithGoogle() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw new Error(error.message)
}

export async function signInWithApple() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw new Error(error.message)
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getSession() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}
