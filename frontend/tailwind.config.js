const config = {
  content: [
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './pages/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e293b',
        secondary: '#0f172a',
        accent: '#fbbf24',
        success: '#10b981',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}

export default config
