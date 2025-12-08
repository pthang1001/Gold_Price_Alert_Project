# 🎯 DAYS 18-19: USER DASHBOARD IMPLEMENTATION GUIDE

**Dates:** Days 18-19 (Days 5-6 of frontend week)  
**Goal:** Build complete user dashboard with alerts, charts, and notifications  
**Estimated Time:** 2 full days

---

## 📋 CHECKLIST (What We're Building)

### Day 18 Morning: Dashboard Home Page
- [ ] Display current gold price (real-time via Socket.io)
- [ ] Show active alerts count
- [ ] Display recent notifications (top 5)
- [ ] Quick action buttons
- [ ] Price trend indicator
- [ ] Create a new `dashboard/home` page component

### Day 18 Afternoon: Alert Management Page
- [ ] Alert creation form (Min, Max price, frequency)
- [ ] List alerts table (sorting, filtering, pagination)
- [ ] Edit alert modal
- [ ] Delete alert with confirmation
- [ ] Status indicators (active, paused, triggered)
- [ ] Duplicate alert option
- [ ] Create `/alerts` page component

### Day 19 Morning: Price History & Charts
- [ ] Date range picker (7 days, 30 days, custom)
- [ ] Line chart for price trend (recharts)
- [ ] Price statistics (min, max, avg)
- [ ] Export to CSV button
- [ ] Create `/price-history` page component

### Day 19 Afternoon: Notifications & Settings
- [ ] Notification Center (list paginated notifications)
- [ ] Mark as read/unread functionality
- [ ] Delete notification option
- [ ] Filter by type (alert, system)
- [ ] Clear all notifications button
- [ ] Profile Settings page (password, theme, preferences)
- [ ] Create `/notifications` and `/profile` pages

---

## 🏗️ FILE STRUCTURE TO CREATE

```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── page.jsx              [MODIFY - Add home content]
│   │   ├── dashboard.module.css  [MODIFY - Add styling]
│   │   └── layout.jsx             [NEW - Dashboard layout wrapper]
│   ├── alerts/
│   │   ├── page.jsx              [NEW - Alert management]
│   │   ├── alerts.module.css     [NEW - Alert styling]
│   │   └── components/
│   │       ├── AlertForm.jsx      [NEW - Create/edit form]
│   │       ├── AlertTable.jsx     [NEW - List table]
│   │       └── DeleteModal.jsx    [NEW - Confirmation]
│   ├── price-history/
│   │   ├── page.jsx              [NEW - Charts page]
│   │   ├── price-history.module.css [NEW - Chart styling]
│   │   └── components/
│   │       ├── PriceChart.jsx     [NEW - Recharts]
│   │       └── DateRangePicker.jsx [NEW - Date selector]
│   ├── notifications/
│   │   ├── page.jsx              [NEW - Notification center]
│   │   └── notifications.module.css [NEW - Styling]
│   ├── profile/
│   │   ├── page.jsx              [MODIFY - Add settings]
│   │   └── profile.module.css    [MODIFY - Add styling]
│   └── layout.jsx                [KEEP - Root layout]
├── components/
│   ├── Dashboard/
│   │   ├── DashboardLayout.jsx    [NEW - Main wrapper]
│   │   ├── Navbar.jsx            [NEW - Top navigation]
│   │   ├── Sidebar.jsx           [NEW - Left sidebar]
│   │   ├── PriceCard.jsx         [NEW - Price display]
│   │   ├── StatsCard.jsx         [NEW - Stat cards]
│   │   └── DashboardLayout.module.css [NEW - Layout styling]
│   └── ...
├── lib/
│   └── api.js                     [VERIFY - Has price/alert endpoints]
├── store/
│   └── auth.js                    [VERIFY - Already has state]
└── styles/
    └── globals.css               [ALREADY EXISTS]
```

---

## 🔌 API ENDPOINTS NEEDED

### Check if These Endpoints Exist in `/lib/api.js`

```javascript
// Price endpoints
export const priceApi = {
  getCurrent: () => apiClient.get('/price/current'),
  getHistory: (days = 7) => apiClient.get(`/price/history?days=${days}`),
  getStatistics: () => apiClient.get('/price/statistics'),
}

// Alert endpoints
export const alertApi = {
  create: (data) => apiClient.post('/alert', data),
  getAll: (page = 1, limit = 10) => apiClient.get(`/alert?page=${page}&limit=${limit}`),
  getById: (id) => apiClient.get(`/alert/${id}`),
  update: (id, data) => apiClient.put(`/alert/${id}`, data),
  delete: (id) => apiClient.delete(`/alert/${id}`),
  getHistory: () => apiClient.get('/alert/history'),
}

// Notification endpoints
export const notificationApi = {
  getAll: (page = 1) => apiClient.get(`/notification?page=${page}`),
  markAsRead: (id) => apiClient.patch(`/notification/${id}/read`),
  delete: (id) => apiClient.delete(`/notification/${id}`),
  getSettings: () => apiClient.get('/notification/settings'),
  updateSettings: (data) => apiClient.put('/notification/settings', data),
  clearAll: () => apiClient.delete('/notification/all'),
}
```

**ACTION:** Check these exist in `/lib/api.js` before starting!

---

## 📱 COMPONENT TEMPLATES (Copy & Modify)

### DashboardLayout Component
```jsx
// components/Dashboard/DashboardLayout.jsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ children, activeTab }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className={styles.container}>
      <Navbar user={user} />
      <div className={styles.main}>
        <Sidebar activeTab={activeTab} />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
```

### PriceCard Component
```jsx
// components/Dashboard/PriceCard.jsx
'use client'

import { useEffect, useState } from 'react'
import { priceApi } from '@/lib/api'
import styles from './DashboardLayout.module.css'

export default function PriceCard() {
  const [price, setPrice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trend, setTrend] = useState(null)

  useEffect(() => {
    fetchPrice()
  }, [])

  const fetchPrice = async () => {
    try {
      const response = await priceApi.getCurrent()
      setPrice(response.data.data)
      setTrend(response.data.data.trend || 'up') // from API
      setLoading(false)
    } catch (error) {
      console.error('Error fetching price:', error)
      setLoading(false)
    }
  }

  if (loading) return <div>Loading price...</div>

  return (
    <div className={styles.priceCard}>
      <h2>Gold Price</h2>
      <div className={styles.priceDisplay}>
        <span className={styles.price}>
          ${price?.current || 'N/A'}
        </span>
        <span className={`${styles.trend} ${styles[trend]}`}>
          {trend === 'up' ? '↑' : '↓'} {price?.change}%
        </span>
      </div>
      <button onClick={fetchPrice} className={styles.refresh}>
        Refresh
      </button>
    </div>
  )
}
```

---

## 🎨 TAILWIND CLASSES TO USE

```css
/* Colors (already in tailwind.config.js) */
primary: #1e293b
secondary: #0f172a
accent: #fbbf24
success: #10b981
danger: #ef4444

/* Cards */
bg-secondary border border-accent/20 rounded-lg p-4 shadow-lg

/* Buttons */
bg-accent text-black hover:bg-yellow-500 px-4 py-2 rounded

/* Tables */
border-collapse w-full border border-gray-700

/* Forms */
input: bg-secondary text-white border border-accent/30 rounded px-3 py-2
```

---

## 📦 DEPENDENCIES ALREADY INSTALLED

Check if these are in `package.json`:
- ✅ axios (HTTP client)
- ✅ zustand (state management)
- ✅ tailwindcss (styling)
- ✅ react-hook-form (form management)
- ✅ zod (validation)

### MAY NEED TO INSTALL
```bash
npm install recharts date-fns  # For charts and date picking
```

---

## 🧪 TESTING CHECKLIST

### Day 18 - End of Day
- [ ] Dashboard page loads without errors
- [ ] Alerts page displays (even if empty)
- [ ] Can create new alert (test with mock API)
- [ ] No console errors
- [ ] Responsive on desktop

### Day 19 - End of Day  
- [ ] Price chart displays
- [ ] Date range selector works
- [ ] Notifications page loads
- [ ] Profile settings page works
- [ ] All pages responsive on mobile/tablet

---

## 🔑 KEY IMPLEMENTATION NOTES

### Using Zustand Store
```javascript
import { useAuthStore } from '@/store/auth'

export default function Component() {
  const { user, isAuthenticated } = useAuthStore()
  
  // Use these in your component
}
```

### Fetching Data with Zustand Pattern
```javascript
const [data, setData] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await apiCall()
      setData(response.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }
  fetchData()
}, [])
```

### Form Handling
```javascript
import { useForm } from 'react-hook-form'

const { register, handleSubmit, formState: { errors } } = useForm()

const onSubmit = async (data) => {
  try {
    await apiCall(data)
  } catch (error) {
    // Handle error
  }
}
```

### Charts (Recharts)
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const data = [
  { date: '2024-12-01', price: 1950 },
  // ...
]

return (
  <LineChart width={600} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="price" stroke="#fbbf24" />
  </LineChart>
)
```

---

## ⚡ QUICK START

1. **Read existing code first:**
   ```bash
   cat frontend/app/login/page.jsx    # See auth flow pattern
   cat frontend/lib/api.js             # See API structure
   ```

2. **Verify API endpoints exist:**
   ```bash
   npm run dev  # Start frontend
   # Test in browser console:
   # fetch('/api/price/current').then(r => r.json())
   ```

3. **Start with Dashboard Home:**
   - Create `dashboard/layout.jsx` (dashboard wrapper)
   - Modify `dashboard/page.jsx` (home content)
   - Create `PriceCard` component
   - Test price fetching

4. **Then build Alerts:**
   - Create `alerts/page.jsx`
   - Create `AlertForm` component
   - Create `AlertTable` component
   - Test alert CRUD

5. **Continue with other pages**

---

## ⚠️ COMMON PITFALLS

1. **Don't use Redux** - We're using Zustand only
2. **Don't hardcode API URLs** - Use .env variables
3. **Don't forget error handling** - Always try/catch API calls
4. **Don't create duplicate components** - Check if it exists first
5. **Don't commit without testing** - Test locally first

---

## 📞 NEED HELP?

Check these files:
- `QUICK_REFERENCE.md` - Developer guide
- `frontend/app/login/page.jsx` - Auth pattern example
- `frontend/lib/api.js` - API client setup
- `frontend/store/auth.js` - State management pattern

---

**Ready to start?** Begin with reading existing code, then create dashboard layout!
