'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const setAuthUser = useAuthStore((state) => state.setUser)
  const setTokens = useAuthStore((state) => state.setTokens)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format'

    if (!formData.password) newErrors.password = 'Password is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await authApi.login(formData.email, formData.password)

      const { access_token, refresh_token, user } = response.data

      // Save tokens
      localStorage.setItem('accessToken', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }

      // Update auth store
      setTokens(access_token, refresh_token)
      setAuthUser(user)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Login failed. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary flex items-center justify-center p-4">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-secondary/95 backdrop-blur border-b border-yellow-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-accent">💰 GOLD</div>
            <div className="text-sm text-gray-400">Price Alert</div>
          </Link>
          <div>
            <Link href="/register" className="text-gray-300 hover:text-white">
              Don't have an account? <span className="text-accent font-semibold">Sign Up</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="w-full max-w-md mt-20">
        <div className="bg-secondary/50 border border-yellow-500/20 rounded-lg p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-400 text-center mb-8">Login to your account</p>

          {errors.submit && (
            <div className="mb-6 p-4 bg-danger/20 border border-danger rounded text-red-300">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-2 bg-primary border rounded transition ${
                  errors.email
                    ? 'border-danger'
                    : 'border-yellow-500/20 focus:border-accent'
                } text-white placeholder-gray-600 focus:outline-none`}
              />
              {errors.email && (
                <p className="text-danger text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 bg-primary border rounded transition ${
                  errors.password
                    ? 'border-danger'
                    : 'border-yellow-500/20 focus:border-accent'
                } text-white placeholder-gray-600 focus:outline-none`}
              />
              {errors.password && (
                <p className="text-danger text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded accent-yellow-400"
                />
                <span className="text-gray-400">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-accent hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-accent text-black font-semibold rounded hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-yellow-500/20"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-yellow-500/20"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button className="w-full py-2 border border-yellow-500/20 rounded hover:bg-secondary/50 transition flex items-center justify-center gap-2">
              <span>🔒</span>
              <span>Continue with Google</span>
            </button>
            <button className="w-full py-2 border border-yellow-500/20 rounded hover:bg-secondary/50 transition flex items-center justify-center gap-2">
              <span>🐙</span>
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-gray-400 text-center text-sm mt-6">
            Don't have an account? <Link href="/register" className="text-accent font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
