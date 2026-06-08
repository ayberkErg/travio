'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'
import { signUpWithEmail, signInWithGoogle, signInWithApple } from '@/lib/auth'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M14.94 13.16c-.28.65-.62 1.25-.99 1.8-.52.75-1.05 1.25-1.57 1.5-.63.3-1.3.45-2.02.44-.52 0-1.14-.15-1.87-.44-.73-.3-1.4-.44-2.02-.44-.65 0-1.35.15-2.08.44-.73.3-1.32.45-1.77.46-.7.02-1.38-.15-2.05-.5-.56-.3-1.1-.83-1.62-1.59-.56-.82-1.02-1.77-1.37-2.85C.18 11.13 0 10.04 0 8.97c0-1.23.26-2.28.78-3.17.41-.72.95-1.28 1.64-1.7.69-.41 1.43-.62 2.23-.63.55 0 1.27.17 2.16.5.89.34 1.46.51 1.71.51.19 0 .83-.2 1.9-.6 1.02-.37 1.87-.52 2.57-.46 1.9.15 3.33.9 4.27 2.26-1.7 1.03-2.54 2.47-2.52 4.32.02 1.44.54 2.64 1.55 3.59.46.44.97.78 1.54 1.02-.12.36-.26.7-.39 1.01zM11.5.88c0 1.13-.41 2.18-1.23 3.15-.99 1.15-2.18 1.82-3.47 1.71-.02-.13-.02-.27-.02-.4 0-1.08.47-2.24 1.3-3.19C8.53 1.62 9.14 1.18 9.87.79c.73-.38 1.42-.59 2.07-.63.02.24.03.48.03.72H11.5z"/>
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Şifre en az 8 karakter olmalı')
    setLoading(true)
    try {
      const { user, token } = await signUpWithEmail(form.email, form.password, form.full_name)
      setUser(user)
      setToken(token)
      router.push('/auth/onboarding')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kayıt başarısız')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setOauthLoading('google')
    try {
      await signInWithGoogle()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google girişi başarısız')
      setOauthLoading(null)
    }
  }

  async function handleApple() {
    setOauthLoading('apple')
    try {
      await signInWithApple()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Apple girişi başarısız')
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--night)' }}>

      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,130,10,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />

        <div className="w-full max-w-sm relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-12">
            <span className="font-serif text-2xl text-white tracking-tight">travio</span>
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }} />
          </Link>

          <div className="mb-8">
            <h1 className="font-serif text-3xl text-white mb-2">Gezmeye başla.</h1>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Ücretsiz hesap — ilk 3 plan bedava.
            </p>
          </div>

          {/* OAuth */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogle}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              {oauthLoading === 'google'
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <GoogleIcon />}
              Google ile kayıt ol
            </button>

            <button
              onClick={handleApple}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'white' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              {oauthLoading === 'apple'
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <AppleIcon />}
              Apple ile kayıt ol
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>ya da e-posta ile</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Ad Soyad
              </label>
              <input
                type="text"
                required
                className="input-night"
                placeholder="Adın Soyadın"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                E-posta
              </label>
              <input
                type="email"
                required
                className="input-night"
                placeholder="sen@ornek.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Şifre
                <span className="font-normal ml-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>en az 8 karakter</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                className="input-night"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !!oauthLoading}
              className="w-full py-3.5 rounded-xl text-base font-semibold transition-all disabled:opacity-60"
              style={{ background: 'var(--amber)', color: 'white', boxShadow: '0 4px 20px rgba(212,130,10,0.4)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Hesap oluşturuluyor...
                </span>
              ) : 'Hesap Oluştur →'}
            </button>
          </form>

          <p className="mt-4 text-xs text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Kayıt olarak{' '}
            <a href="#" className="underline" style={{ color: 'rgba(255,255,255,0.5)' }}>Kullanım Koşulları</a>
            {' '}ve{' '}
            <a href="#" className="underline" style={{ color: 'rgba(255,255,255,0.5)' }}>Gizlilik Politikası</a>
            &apos;nı kabul etmiş olursunuz.
          </p>

          <p className="mt-5 text-sm text-center font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Zaten hesabın var mı?{' '}
            <Link href="/auth/login" className="font-semibold" style={{ color: 'var(--amber)' }}>
              Giriş yap
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Decorative */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'var(--night-2)' }}
      >
        <div
          className="absolute top-20 right-20 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,130,10,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute bottom-20 left-20 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(109,50,224,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="max-w-sm text-center relative">
          {/* Floating flags */}
          <div className="flex justify-center gap-4 mb-10">
            {['🇯🇵', '🇫🇷', '🇮🇩', '🇹🇭', '🇮🇸'].map((flag, i) => (
              <span
                key={i}
                className="text-3xl animate-float"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {flag}
              </span>
            ))}
          </div>

          <p className="font-serif text-4xl text-white leading-snug mb-6">
            &ldquo;30 saniyede kişisel seyahat planın.&rdquo;
          </p>
          <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            AI seni tanır, tercihlerini öğrenir. Her seyahat daha kişisel olur.
          </p>

          <div className="flex justify-center gap-8">
            {[['3', 'Plan ücretsiz'], ['30sn', 'Plan süresi'], ['%100', 'Yerel mekan']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="font-serif text-2xl mb-1" style={{ color: 'var(--amber)' }}>{n}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
