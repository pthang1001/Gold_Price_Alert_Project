import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const authApi = {
  register: (email: string, password: string, firstName: string, lastName: string) =>
    apiClient.post('/auth/register', { email, password, firstName, lastName }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  verifyOtp: (userId: string, otpCode: string) =>
    apiClient.post('/auth/verify-otp', { user_id: userId, otp_code: otpCode }),

  refreshToken: () =>
    apiClient.post('/auth/refresh-token'),
}

export const userApi = {
  getProfile: () =>
    apiClient.get('/users/profile'),

  updateProfile: (data: Record<string, any>) =>
    apiClient.put('/users/profile', data),

  getPreferences: () =>
    apiClient.get('/users/preferences'),

  updatePreferences: (data: Record<string, any>) =>
    apiClient.put('/users/preferences', data),
}

export default apiClient
