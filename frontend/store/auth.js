import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: true }),

  setTokens: (accessToken, refreshToken) =>
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

export default useAuthStore
