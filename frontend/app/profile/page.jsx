'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { userApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, user, setUser, logout } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const [preferencesData, setPreferencesData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    priceAlerts: true,
    newsUpdates: true,
    darkMode: true,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Check if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }
    }
    
    fetchProfile()
  }, [isAuthenticated, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const profileData = await userApi.getProfile()
      const preferencesData = await userApi.getPreferences()

      console.log('📥 Profile API response:', profileData)
      console.log('📥 Profile data:', profileData.data.data)
      
      setProfile(profileData.data.data)
      setPreferences(preferencesData.data.data)

      setFormData({
        firstName: profileData.data.data.first_name || profileData.data.data.firstName || '',
        lastName: profileData.data.data.last_name || profileData.data.data.lastName || '',
        email: profileData.data.data.email || '',
        phone: profileData.data.data.phone || '',
      })

      setPreferencesData({
        emailNotifications: preferencesData.data.data?.emailNotifications ?? true,
        smsNotifications: preferencesData.data.data?.smsNotifications ?? false,
        priceAlerts: preferencesData.data.data?.priceAlerts ?? true,
        newsUpdates: preferencesData.data.data?.newsUpdates ?? true,
        darkMode: preferencesData.data.data?.darkMode ?? true,
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setErrors({ fetch: 'Failed to load profile information' })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      // Convert camelCase to snake_case for API
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      }
      const response = await userApi.updateProfile(payload)
      setProfile(response.data)
      setUser(response.data)
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to update profile',
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesChange = async (key) => {
    const newPreferences = {
      ...preferencesData,
      [key]: !preferencesData[key],
    }
    setPreferencesData(newPreferences)

    try {
      await userApi.updatePreferences(newPreferences)
      setSuccessMessage('Preferences updated!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('Failed to update preferences:', error)
      setErrors({ preferences: 'Failed to update preferences' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    logout()
    router.push('/')
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary">
      {/* Navigation */}
      <nav className="bg-secondary/95 backdrop-blur border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-accent">💰 GOLD</div>
            <div className="text-sm text-gray-400">Price Alert</div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-danger text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Profile</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

        {/* Error Messages */}
        {errors.fetch && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {errors.fetch}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-secondary/50 border border-yellow-500/20 rounded-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Profile Information</h2>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing)
                    setErrors({})
                  }}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    isEditing
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-accent text-black hover:bg-yellow-500'
                  }`}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 bg-primary/50 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent transition ${
                          errors.firstName
                            ? 'border-red-500'
                            : 'border-yellow-500/30'
                        }`}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 bg-primary/50 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent transition ${
                          errors.lastName
                            ? 'border-red-500'
                            : 'border-yellow-500/30'
                        }`}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 bg-primary/50 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent transition ${
                        errors.email ? 'border-red-500' : 'border-yellow-500/30'
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-primary/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent transition"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400">
                      {errors.submit}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-6 py-2 bg-accent text-black font-semibold rounded hover:bg-yellow-500 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">First Name</p>
                      <p className="text-white text-lg font-semibold">
                        {profile?.first_name || profile?.firstName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Last Name</p>
                      <p className="text-white text-lg font-semibold">
                        {profile?.last_name || profile?.lastName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white text-lg font-semibold">{profile?.email}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Phone Number</p>
                    <p className="text-white text-lg font-semibold">
                      {profile?.phone || 'Not provided'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-yellow-500/20">
                    <p className="text-gray-400 text-sm">Member Since</p>
                    <p className="text-white text-lg font-semibold">
                      {profile?.created_at || profile?.createdAt
                        ? new Date(profile.created_at || profile.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences Section */}
          <div>
            <div className="bg-secondary/50 border border-yellow-500/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Preferences</h2>

              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-3 bg-primary/30 rounded">
                  <div>
                    <p className="text-white font-semibold">Email Notifications</p>
                    <p className="text-gray-400 text-xs">Receive email updates</p>
                  </div>
                  <button
                    onClick={() => handlePreferencesChange('emailNotifications')}
                    className={`w-12 h-6 rounded-full transition ${
                      preferencesData.emailNotifications
                        ? 'bg-accent'
                        : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition transform ${
                        preferencesData.emailNotifications
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-3 bg-primary/30 rounded">
                  <div>
                    <p className="text-white font-semibold">SMS Notifications</p>
                    <p className="text-gray-400 text-xs">Receive SMS alerts</p>
                  </div>
                  <button
                    onClick={() => handlePreferencesChange('smsNotifications')}
                    className={`w-12 h-6 rounded-full transition ${
                      preferencesData.smsNotifications
                        ? 'bg-accent'
                        : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition transform ${
                        preferencesData.smsNotifications
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Price Alerts */}
                <div className="flex items-center justify-between p-3 bg-primary/30 rounded">
                  <div>
                    <p className="text-white font-semibold">Price Alerts</p>
                    <p className="text-gray-400 text-xs">Alert on price changes</p>
                  </div>
                  <button
                    onClick={() => handlePreferencesChange('priceAlerts')}
                    className={`w-12 h-6 rounded-full transition ${
                      preferencesData.priceAlerts
                        ? 'bg-accent'
                        : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition transform ${
                        preferencesData.priceAlerts
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* News Updates */}
                <div className="flex items-center justify-between p-3 bg-primary/30 rounded">
                  <div>
                    <p className="text-white font-semibold">News Updates</p>
                    <p className="text-gray-400 text-xs">Market news & tips</p>
                  </div>
                  <button
                    onClick={() => handlePreferencesChange('newsUpdates')}
                    className={`w-12 h-6 rounded-full transition ${
                      preferencesData.newsUpdates
                        ? 'bg-accent'
                        : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition transform ${
                        preferencesData.newsUpdates
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between p-3 bg-primary/30 rounded">
                  <div>
                    <p className="text-white font-semibold">Dark Mode</p>
                    <p className="text-gray-400 text-xs">Current theme</p>
                  </div>
                  <button
                    onClick={() => handlePreferencesChange('darkMode')}
                    className={`w-12 h-6 rounded-full transition ${
                      preferencesData.darkMode
                        ? 'bg-accent'
                        : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition transform ${
                        preferencesData.darkMode
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
