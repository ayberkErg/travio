'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Şifre en az 8 karakter olmalı')
    if (form.password !== form.confirm) return toast.error('Şifreler eşleşmiyor')

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, full_name: form.full_name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Kayıt başarısız')

      setUser(data.user)
      setToken(data.token)
      router.push('/auth/onboarding')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kayıt başarısız')
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
          <h1 className="font-serif text-3xl text-ink mb-2">Gezmeye başla.</h1>
          <p className="text-stone-500 mb-8 text-sm font-medium">Ücretsiz hesap — ilk 3 plan bedava.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Ad Soyad</label>
              <input type="text" required className="input-field" placeholder="Adın Soyadın"
                value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">E-posta</label>
              <input type="email" required className="input-field" placeholder="sen@ornek.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Şifre</label>
              <input type="password" required minLength={8} className="input-field" placeholder="En az 8 karakter"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Şifre Tekrar</label>
              <input type="password" required className="input-field" placeholder="Şifreni tekrarla"
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
              {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur →'}
            </button>
          </form>

          <p className="mt-6 text-sm text-stone-500 text-center font-medium">
            Zaten hesabın var mı?{' '}
            <Link href="/auth/login" className="text-amber font-semibold hover:underline">Giriş yap</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-ink items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-violet/10 rounded-full blur-3xl" />
        <div className="max-w-sm text-center relative">
          <p className="font-serif text-4xl text-white leading-snug mb-6">
            &ldquo;30 saniyede kişisel seyahat planın.&rdquo;
          </p>
          <p className="text-stone-500 text-sm leading-relaxed font-medium">
            AI seni tanır, tercihlerini öğrenir. Her seyahat daha kişisel olur.
          </p>
        </div>
      </div>
    </div>
  )
}
