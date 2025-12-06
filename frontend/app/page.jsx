'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-secondary/95 backdrop-blur border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-accent">💰 GOLD</div>
            <div className="text-sm text-gray-400">Price Alert</div>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-accent text-black font-semibold rounded hover:bg-yellow-500 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Real-Time Gold Price <span className="text-accent">Monitoring</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Track gold prices, set smart alerts, and make informed trading decisions
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
            >
              Get Started Free
            </Link>
            <button className="px-6 py-3 border border-accent text-accent rounded-lg hover:bg-accent/10 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              title: '📊 Real-Time Charts',
              desc: 'Live gold price charts with advanced technical analysis tools',
            },
            {
              title: '🔔 Smart Alerts',
              desc: 'Get instant notifications when price hits your target levels',
            },
            {
              title: '💡 Trading Analytics',
              desc: 'Historical data, trends, and predictions powered by AI',
            },
            {
              title: '🌍 Global Coverage',
              desc: 'Monitor gold prices from markets worldwide',
            },
            {
              title: '📱 Mobile Ready',
              desc: 'Full-featured mobile app for on-the-go trading',
            },
            {
              title: '🔒 Secure & Fast',
              desc: 'Enterprise-grade security with sub-millisecond latency',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-secondary/50 border border-yellow-500/10 rounded-lg hover:border-yellow-500/30 transition"
            >
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: 'Free',
                features: ['5 Price Alerts', '1 Day History', 'Email Notifications'],
              },
              {
                name: 'Professional',
                price: '$9.99/mo',
                features: ['50 Price Alerts', '1 Year History', 'SMS + Email', 'Advanced Charts'],
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: '$29.99/mo',
                features: ['Unlimited Alerts', 'Full History', 'API Access', '24/7 Support'],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-lg border transition ${
                  plan.highlighted
                    ? 'border-accent bg-accent/10 ring-2 ring-accent'
                    : 'border-yellow-500/10 bg-secondary/50'
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-accent mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <span className="text-accent">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2 rounded font-semibold transition ${
                    plan.highlighted
                      ? 'bg-accent text-black hover:bg-yellow-500'
                      : 'border border-accent text-accent hover:bg-accent/10'
                  }`}
                >
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/50 border-t border-yellow-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Follow</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-yellow-500/10 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Gold Price Alert. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
