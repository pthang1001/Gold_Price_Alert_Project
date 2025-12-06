import '../styles/globals.css'

export const metadata = {
  title: 'Gold Price Alert - Real-time Trading Dashboard',
  description: 'Monitor gold prices in real-time with advanced alerts and analytics',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
