'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    logout()
    router.push('/')
  }

  if (!isAuthenticated) {
    return null
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
          <div className="flex items-center gap-6">
            <Link href="/profile" className="text-gray-300 hover:text-accent transition">
              Profile
            </Link>
            <span className="text-gray-300">{user?.email}</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome, <span className="text-accent">{user?.firstName}</span>!
          </h1>
          <p className="text-gray-400">Ready to trade gold?</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Current Price', value: '$2,095.50', change: '+2.5%', positive: true },
            { label: '24h High', value: '$2,125.30', change: 'View' },
            { label: '24h Low', value: '$2,055.20', change: 'View' },
            { label: 'Your Alerts', value: '5 Active', change: 'Manage' },
          ].map((stat, idx) => (
            <div key={idx} className="p-6 bg-secondary/50 border border-yellow-500/20 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold mb-2">{stat.value}</p>
              <p className={`text-sm ${stat.positive ? 'text-green-400' : 'text-gray-400'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Alert */}
          <div className="p-8 bg-secondary/50 border border-yellow-500/20 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Create Price Alert</h2>
            <p className="text-gray-400 mb-6">Set up alerts when gold reaches your target price</p>
            <button className="px-6 py-2 bg-accent text-black font-semibold rounded hover:bg-yellow-500 transition">
              New Alert
            </button>
          </div>

          {/* View Chart */}
          <div className="p-8 bg-secondary/50 border border-yellow-500/20 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Market Analysis</h2>
            <p className="text-gray-400 mb-6">View advanced charts and technical analysis</p>
            <button className="px-6 py-2 border border-accent text-accent rounded hover:bg-accent/10 transition">
              Open Chart
            </button>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 p-8 bg-secondary/50 border border-yellow-500/20 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['📊 Advanced Charts', '🤖 AI Predictions', '📱 Mobile App'].map((feature, idx) => (
              <div key={idx} className="p-4 bg-primary/50 rounded text-center">
                <p className="text-gray-400">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
