'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Giriş başarısız')

      setUser(data.user)
      setToken(data.token)
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-off-white">
        <div className="w-full max-w-sm">
          <Link href="/landing" className="font-serif text-2xl text-ink block mb-8">
            travio<span className="inline-block w-1.5 h-1.5 rounded-full bg-amber mb-1 ml-0.5" />
          </Link>
          <h1 className="font-serif text-3xl text-ink mb-2">Tekrar hoş geldin.</h1>
          <p className="text-stone-500 mb-8 text-sm font-medium">Seyahat planların seni bekliyor.</p>

          {/* Demo bilgisi */}
          <div className="bg-amber-light border border-amber/20 rounded-xl p-3 mb-6">
            <p className="text-xs font-bold text-amber mb-1">🧪 Test hesabı</p>
            <p className="text-xs text-stone-600 font-mono">demo@travio.app</p>
            <p className="text-xs text-stone-600 font-mono">demo1234</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">E-posta</label>
              <input type="email" required className="input-field" placeholder="demo@travio.app"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Şifre</label>
              <input type="password" required className="input-field" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>
          </form>

          <p className="mt-6 text-sm text-stone-500 text-center font-medium">
            Hesabın yok mu?{' '}
            <Link href="/auth/register" className="text-amber font-semibold hover:underline">Kayıt ol</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-ink items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-amber/10 rounded-full blur-3xl" />
        <div className="max-w-sm text-center relative">
          <p className="font-serif text-4xl text-white leading-snug mb-6">
            &ldquo;Seyahatin kişisel asistanı.&rdquo;
          </p>
          <p className="text-stone-500 text-sm leading-relaxed font-medium">
            Zevklerini öğrenen bir AI. Konser, maç, festival, lokal lezzetler — hepsi sana özel, 30 saniyede.
          </p>
        </div>
      </div>
    </div>
  )
}
