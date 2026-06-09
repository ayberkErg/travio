'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { usePlansStore, useUIStore, useAuthStore } from '@/store'
import { getCategoryConfig, formatCurrency, getSafetyColor } from '@/lib/utils'
import type { TravelPlan, ChatMessage, ActivityItem } from '@/types'

type Tab = 'plan' | 'budget' | 'checklist' | 'chat'

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const cfg = getCategoryConfig(activity.category)
  return (
    <div className="flex gap-4 py-4 border-b border-stone-100 last:border-0">
      <div className="text-xs text-stone-400 w-12 shrink-0 pt-0.5">{activity.time}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-pill font-medium ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          {activity.estimated_cost_try && (
            <span className="text-xs text-stone-400 ml-auto shrink-0">
              {formatCurrency(activity.estimated_cost_try)}
            </span>
          )}
        </div>
        <h4 className="font-medium text-ink text-sm">{activity.name}</h4>
        <p className="text-stone-500 text-xs mt-0.5 leading-relaxed">{activity.description}</p>
        {activity.location && (
          <p className="text-xs text-stone-400 mt-1">📍 {activity.location}</p>
        )}
        {activity.tips && (
          <p className="text-xs text-amber mt-1">💡 {activity.tips}</p>
        )}
        {activity.booking_url && (
          <a
            href={activity.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-teal hover:underline mt-1"
          >
            Rezervasyon →
          </a>
        )}
      </div>
    </div>
  )
}

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { plans, updatePlan } = usePlansStore()
  const { openPlusModal } = useUIStore()
  const { user } = useAuthStore()
  const isGuest = !user

  const [plan, setPlan] = useState<TravelPlan | null>(plans.find(p => p.id === id) || null)
  const [tab, setTab] = useState<Tab>('plan')
  const [activeDay, setActiveDay] = useState(0)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plan) {
      api.plans.get(id).then(setPlan).catch(() => {})
    }
  }, [id, plan, router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  async function toggleFavorite() {
    if (!plan) return
    try {
      const updated = await api.plans.toggleFavorite(id)
      setPlan(updated)
      updatePlan(id, { is_favorite: updated.is_favorite })
    } catch {
      toast.error('Favori güncellenemedi')
    }
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatInput('')

    const userMsg: ChatMessage = { role: 'user', content: msg, timestamp: new Date().toISOString() }
    const newHistory = [...chatHistory, userMsg]
    setChatHistory(newHistory)
    setChatLoading(true)

    try {
      const res = await api.chat.send({ message: msg, plan_id: id, history: newHistory })
      setChatHistory(h => [...h, res.message])
    } catch {
      toast.error('Mesaj gönderilemedi')
    } finally {
      setChatLoading(false)
    }
  }

  if (!plan || !plan.plan) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-4xl mb-4">✈️</div>
          <p className="text-stone-500">Plan yükleniyor...</p>
        </div>
      </div>
    )
  }

  const { plan: p } = plan
  const days = p.days || []
  const currentDay = days[activeDay]
  const safetyColor = getSafetyColor(p.safety_level)

  const budgetItems = [
    { label: 'Uçuş', value: p.budget.flights, emoji: '✈️' },
    { label: 'Konaklama', value: p.budget.accommodation, emoji: '🏨' },
    { label: 'Yemek', value: p.budget.food, emoji: '🍽️' },
    { label: 'Aktiviteler', value: p.budget.activities, emoji: '🎭' },
    { label: 'Ulaşım', value: p.budget.transport_local, emoji: '🚇' },
  ].filter(b => b.value)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Misafir banneri */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber to-coral rounded-2xl p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-sm">Planını kaydet, her yerden eriş</p>
            <p className="text-white/80 text-xs mt-0.5">Ücretsiz hesap ile planların kaybolmaz, AI concierge aktif olur.</p>
          </div>
          <Link href="/auth/register" className="shrink-0 bg-white text-amber font-bold text-sm px-4 py-2 rounded-pill hover:bg-off-white transition-colors">
            Kayıt Ol →
          </Link>
        </div>
      )}

      {/* Hero */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{p.flag_emoji}</span>
              <div>
                <h1 className="font-serif text-3xl text-ink">{p.destination}</h1>
                <p className="text-stone-500 text-sm">{p.country}</p>
              </div>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed max-w-2xl">{p.summary}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={toggleFavorite}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                plan.is_favorite ? 'bg-amber-light border-amber text-amber' : 'border-stone-200 text-stone-400 hover:border-stone-300'
              }`}
            >
              ★
            </button>
            <button
              onClick={() => openPlusModal('memory_book')}
              className="w-9 h-9 rounded-xl border border-stone-200 text-stone-400 hover:border-stone-300 flex items-center justify-center"
              title="PDF İndir (Plus)"
            >
              ↓
            </button>
          </div>
        </div>

        {/* Pratik bilgiler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Süre', value: `${p.duration_days} gün` },
            { label: 'Para Birimi', value: p.currency },
            { label: 'Dil', value: p.language },
            { label: 'Güvenlik', value: p.safety_level === 'safe' ? 'Güvenli' : p.safety_level === 'moderate' ? 'Orta' : 'Dikkatli' },
          ].map(info => (
            <div key={info.label} className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-400 mb-0.5">{info.label}</p>
              <p className={`text-sm font-medium ${info.label === 'Güvenlik' ? safetyColor : 'text-ink'}`}>
                {info.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sol — Ana içerik */}
        <div className="flex-1 min-w-0">
          {/* Sekmeler */}
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6">
            {([
              { key: 'plan', label: '🗓 Günlük Plan' },
              { key: 'budget', label: '💰 Bütçe' },
              { key: 'checklist', label: '✅ Hazırlık' },
              { key: 'chat', label: '💬 AI Asistan' },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium transition-all ${
                  tab === t.key ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Günlük Plan */}
          {tab === 'plan' && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {days.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeDay === i
                        ? 'bg-amber text-white'
                        : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    Gün {d.day_number}
                  </button>
                ))}
              </div>

              {currentDay && (
                <div className="card">
                  <div className="mb-4">
                    <h2 className="font-serif text-xl text-ink">{currentDay.title}</h2>
                    <p className="text-stone-500 text-sm">{currentDay.theme}</p>
                    {currentDay.weather_note && (
                      <p className="text-xs text-teal mt-1">🌤 {currentDay.weather_note}</p>
                    )}
                  </div>
                  {currentDay.activities.map((a, i) => (
                    <ActivityCard key={i} activity={a} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bütçe */}
          {tab === 'budget' && (
            <div className="card space-y-4">
              <h2 className="font-serif text-xl text-ink mb-2">Tahmini Bütçe</h2>
              {budgetItems.map(b => {
                const pct = Math.round(((b.value || 0) / p.budget.total_estimated) * 100)
                return (
                  <div key={b.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-ink">{b.emoji} {b.label}</span>
                      <span className="text-stone-500">{formatCurrency(b.value || 0)}</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-pill overflow-hidden">
                      <div className="h-full bg-amber rounded-pill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="pt-4 border-t border-stone-200 flex justify-between">
                <span className="font-medium text-ink">Toplam Tahmini</span>
                <span className="font-serif text-xl text-ink">
                  {formatCurrency(p.budget.total_estimated, p.budget.currency)}
                </span>
              </div>
            </div>
          )}

          {/* Hazırlık */}
          {tab === 'checklist' && (
            <div className="card">
              <h2 className="font-serif text-xl text-ink mb-4">Hazırlık Listesi</h2>
              <div className="space-y-2 mb-6">
                {p.pre_trip_checklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!checklist[item]}
                      onChange={e => setChecklist(c => ({ ...c, [item]: e.target.checked }))}
                      className="w-4 h-4 accent-amber"
                    />
                    <span className={`text-sm transition-all ${checklist[item] ? 'line-through text-stone-400' : 'text-ink'}`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>

              {p.safety_tips.length > 0 && (
                <div className="bg-amber-light rounded-xl p-4">
                  <p className="text-sm font-medium text-amber mb-2">⚠️ Güvenlik İpuçları</p>
                  <ul className="space-y-1">
                    {p.safety_tips.map((tip, i) => (
                      <li key={i} className="text-xs text-stone-600">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Chat */}
          {tab === 'chat' && (
            <div className="card flex flex-col h-[500px]">
              <h2 className="font-serif text-xl text-ink mb-4 shrink-0">AI Concierge</h2>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatHistory.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-3xl block mb-3">💬</span>
                    <p className="text-stone-500 text-sm">
                      Planın hakkında her şeyi sor.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {['En iyi restoran nerede?', 'Hava nasıl olur?', 'Ulaşım için ne önerirsin?'].map(q => (
                        <button
                          key={q}
                          onClick={() => setChatInput(q)}
                          className="text-xs bg-stone-50 border border-stone-200 text-stone-600 px-3 py-1.5 rounded-pill hover:border-stone-300"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-amber text-white rounded-br-sm'
                        : 'bg-stone-100 text-ink rounded-bl-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-stone-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-stone-400">
                      Yazıyor...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendChat} className="flex gap-2 shrink-0">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Bir şey sor..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                />
                <button type="submit" disabled={chatLoading} className="btn-primary px-4 py-2.5 disabled:opacity-60">
                  →
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sağ panel */}
        <div className="hidden xl:block w-72 shrink-0 space-y-4">
          {/* AI İpuçları */}
          {p.ai_tips.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-ink mb-3 text-sm">✨ AI İpuçları</h3>
              <ul className="space-y-2">
                {p.ai_tips.slice(0, 3).map((tip, i) => (
                  <li key={i} className="text-xs text-stone-500 leading-relaxed">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Yerel İçgörüler */}
          {p.local_insights.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-ink mb-3 text-sm">🏘️ Yerel İçgörüler</h3>
              <ul className="space-y-2">
                {p.local_insights.slice(0, 3).map((ins, i) => (
                  <li key={i} className="text-xs text-stone-500 leading-relaxed">• {ins}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Affiliate Kartlar */}
          {p.affiliate_offers.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-ink mb-3 text-sm">🤝 Öneriler</h3>
              <div className="space-y-3">
                {p.affiliate_offers.slice(0, 3).map((offer, i) => (
                  <a
                    key={i}
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => api.affiliate.click({
                      plan_id: id,
                      provider: offer.provider,
                      offer_type: offer.offer_type,
                      destination: p.destination,
                    }).catch(() => {})}
                    className="block p-3 bg-stone-50 rounded-xl hover:bg-amber-light transition-colors"
                  >
                    <p className="text-xs font-medium text-ink">{offer.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{offer.description}</p>
                    {offer.price_hint && (
                      <p className="text-xs text-amber mt-1">{offer.price_hint}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
