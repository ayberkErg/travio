import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User,
  UserPersona,
  TravelPlan,
  ToastMessage,
  PlusModalTrigger,
} from '@/types'

// Auth Store
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'travio-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)

// Persona Store
interface PersonaState {
  persona: UserPersona | null
  setPersona: (persona: UserPersona | null) => void
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set) => ({
      persona: null,
      setPersona: (persona) => set({ persona }),
    }),
    { name: 'travio-persona' }
  )
)

// Plans Store
interface PlansState {
  plans: TravelPlan[]
  currentPlan: TravelPlan | null
  isGenerating: boolean
  setPlans: (plans: TravelPlan[]) => void
  addPlan: (plan: TravelPlan) => void
  updatePlan: (id: string, updates: Partial<TravelPlan>) => void
  removePlan: (id: string) => void
  setCurrentPlan: (plan: TravelPlan | null) => void
  setGenerating: (generating: boolean) => void
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set) => ({
      plans: [],
      currentPlan: null,
      isGenerating: false,
      setPlans: (plans) => set({ plans }),
      addPlan: (plan) => set((s) => ({ plans: [plan, ...s.plans] })),
      updatePlan: (id, updates) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          currentPlan: s.currentPlan?.id === id ? { ...s.currentPlan, ...updates } : s.currentPlan,
        })),
      removePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
      setCurrentPlan: (currentPlan) => set({ currentPlan }),
      setGenerating: (isGenerating) => set({ isGenerating }),
    }),
    { name: 'travio-plans', partialize: (s) => ({ plans: s.plans }) }
  )
)

// UI Store
interface UIState {
  sidebarOpen: boolean
  plusModalOpen: boolean
  plusModalTrigger: PlusModalTrigger | null
  toasts: ToastMessage[]
  setSidebarOpen: (open: boolean) => void
  openPlusModal: (trigger: PlusModalTrigger) => void
  closePlusModal: () => void
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  plusModalOpen: false,
  plusModalTrigger: null,
  toasts: [],
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  openPlusModal: (trigger) => set({ plusModalOpen: true, plusModalTrigger: trigger }),
  closePlusModal: () => set({ plusModalOpen: false, plusModalTrigger: null }),
  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
    })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
