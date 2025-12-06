import { create } from 'zustand'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  status: 'active' | 'inactive' | 'suspended'
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setUser: (user: User) =>
    set({ user, isAuthenticated: true }),

  setTokens: (accessToken: string, refreshToken: string) =>
    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    }),
}))
