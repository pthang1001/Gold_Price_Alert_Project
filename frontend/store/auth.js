import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  // State
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setTokens: (accessToken, refreshToken) =>
    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    }),

  // Load from localStorage on init
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      const user = localStorage.getItem('user')

      if (accessToken && user) {
        set({
          accessToken,
          user: JSON.parse(user),
          isAuthenticated: true,
        })
      }
    }
  },
}))
