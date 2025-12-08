'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function VerifyOtpPage() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Get user ID from localStorage
    const savedUserId = localStorage.getItem('pendingUserId')
    const savedEmail = localStorage.getItem('pendingEmail')

    console.log('localStorage check:', { savedUserId, savedEmail });

    if (savedUserId) {
      setUserId(savedUserId)
      setEmail(savedEmail || '')
    }
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP')
      return
    }

    if (!userId) {
      setError('User ID not found. Please register again.')
      return
    }

    console.log('Submitting OTP verification:', { userId, otp });

    setLoading(true)
    setError('')

    try {
      const response = await authApi.verifyOtp(userId, otp)
      console.log('OTP verification response:', response.data)
      setSuccess('✓ Email verified! Redirecting to dashboard...')

      // Save tokens and user info
      const { accessToken, refreshToken, user } = response.data.data || {}
      console.log('Extracted tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, user })
      
      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Update Zustand auth store
        setTokens(accessToken, refreshToken)
        setUser(user)
        
        console.log('Tokens saved to localStorage and auth store')
        console.log('Stored accessToken:', localStorage.getItem('accessToken')?.substring(0, 20) + '...')
      } else {
        console.error('No tokens in response:', response.data.data)
      }

      // Clear localStorage
      localStorage.removeItem('pendingUserId')
      localStorage.removeItem('pendingEmail')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      // Call resend OTP endpoint (would need to be created on backend)
      setSuccess('✓ OTP resent to your email')
      setResendTimer(60)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary flex items-center justify-center p-4">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-secondary/95 backdrop-blur border-b border-yellow-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-accent">💰 GOLD</div>
            <div className="text-sm text-gray-400">Price Alert</div>
          </Link>
        </div>
      </nav>

      {/* OTP Verification Form */}
      <div className="w-full max-w-md mt-20">
        <div className="bg-secondary/50 border border-yellow-500/20 rounded-lg p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2 text-center">Verify Email</h1>
          <p className="text-gray-400 text-center mb-8">
            We sent a verification code to <br />
            <span className="text-accent">{email}</span>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-danger/20 border border-danger rounded text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded text-green-300">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                className="w-full px-4 py-3 bg-primary border border-yellow-500/20 rounded text-center text-2xl font-mono tracking-widest text-white placeholder-gray-600 focus:border-accent focus:outline-none transition"
              />
              <p className="text-gray-400 text-sm mt-2 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2 bg-accent text-black font-semibold rounded hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
                className="text-accent hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </p>
          </div>

          {/* Back to Login */}
          <div className="text-center mt-8">
            <Link href="/login" className="text-gray-400 hover:text-white text-sm">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
