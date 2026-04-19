import { create } from 'zustand'

import type { ClerkUser } from '@/types/user'

interface AuthState {
  user: ClerkUser | null
  isLoading: boolean
  error: string | null
  setUser: (user: ClerkUser | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useUserStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ user: null, isLoading: false, error: null }),
}))
