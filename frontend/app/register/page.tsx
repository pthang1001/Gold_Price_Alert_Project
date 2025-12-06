'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  [key: string]: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const setAuthUser = useAuthStore((state) => state.setUser)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters'

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await authApi.register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )

      setSuccessMessage('✓ Registration successful! OTP sent to your email.')
      localStorage.setItem('pendingUserId', response.data.user_id)
      localStorage.setItem('pendingEmail', formData.email)

      // Redirect to OTP verification page after 2 seconds
      setTimeout(() => {
        router.push('/verify-otp')
      }, 2000)
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
            <Link href="/login" className="text-gray-300 hover:text-white">
              Already have an account? <span className="text-accent font-semibold">Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Register Form */}
      <div className="w-full max-w-md mt-20">
        <div className="bg-secondary/50 border border-yellow-500/20 rounded-lg p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2 text-center">Create Account</h1>
          <p className="text-gray-400 text-center mb-8">Join thousands of traders worldwide</p>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded text-green-300">
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="mb-6 p-4 bg-danger/20 border border-danger rounded text-red-300">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className={`w-full px-4 py-2 bg-primary border rounded transition ${
                  errors.firstName
                    ? 'border-danger'
                    : 'border-yellow-500/20 focus:border-accent'
                } text-white placeholder-gray-600 focus:outline-none`}
              />
              {errors.firstName && (
                <p className="text-danger text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={`w-full px-4 py-2 bg-primary border rounded transition ${
                  errors.lastName
                    ? 'border-danger'
                    : 'border-yellow-500/20 focus:border-accent'
                } text-white placeholder-gray-600 focus:outline-none`}
              />
              {errors.lastName && (
                <p className="text-danger text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 bg-primary border rounded transition ${
                  errors.confirmPassword
                    ? 'border-danger'
                    : 'border-yellow-500/20 focus:border-accent'
                } text-white placeholder-gray-600 focus:outline-none`}
              />
              {errors.confirmPassword && (
                <p className="text-danger text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-accent text-black font-semibold rounded hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-gray-400 text-center text-sm mt-6">
            By signing up, you agree to our <a href="#" className="text-accent hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  )
}
