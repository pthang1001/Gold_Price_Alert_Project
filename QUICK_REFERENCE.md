# 🚀 QUICK REFERENCE GUIDE

## What Was Done Today

### ✅ Fixed Issues
1. **Restored missing Zustand store** - `/frontend/store/auth.js`
2. **Completed frontend env vars** - Added Socket.io URL
3. **Created backend env templates** - 3 .env.example files

### ✅ Verified Systems
- 8 backend microservices ✓
- Frontend authentication flow ✓
- Database initialization ✓
- API Gateway routing ✓
- Message queue setup ✓

---

## 📁 Key Files Location

### Frontend Auth (FIXED)
```
/frontend/store/auth.js          ← Zustand store (FIXED TODAY)
/frontend/app/login/page.jsx
/frontend/app/register/page.jsx
/frontend/app/verify-otp/page.jsx
/frontend/app/dashboard/page.jsx
/frontend/.env.local             ← UPDATED TODAY
```

### Backend Services (VERIFIED)
```
/backend/services/auth/.env.example           ← NEW TODAY
/backend/services/user/.env.example           ← NEW TODAY
/backend/services/api-gateway/.env.example    ← NEW TODAY
/backend/services/price/.env.example
/backend/services/alert/.env.example
/backend/services/email/.env.example
/backend/services/notification/.env.example
/backend/services/admin/.env.example
/backend/services/logging/.env.example
```

### Audit Documents
```
/EXECUTIVE_SUMMARY.md                    ← START HERE
/AUDIT_COMPLETE_READY_TO_GO.md
/CODE_AUDIT_SUMMARY.md
/COMPLETE_CODE_INVENTORY.md
/AUDIT_REPORT_DEC_8_2025.md
```

---

## 🏃 How to Start

### 1. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### 2. Start Backend
```bash
# Option A: Individual services
cd backend/services/auth && npm install && npm run dev

# Option B: Docker (all at once)
docker-compose up
```

### 3. Test Auth Flow
- Register: `http://localhost:3000/register`
- Login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`

---

## 🔧 Zustand Store Usage

### In Your Pages:
```javascript
import { useAuthStore } from '@/store/auth'

export default function MyPage() {
  const { isAuthenticated, user, logout } = useAuthStore()
  
  // Access state
  if (!isAuthenticated) {
    // redirect to login
  }
  
  // Call actions
  logout()
}
```

### Store Methods:
- `setUser(user)` - Set user profile
- `setTokens(access, refresh)` - Set JWT tokens
- `logout()` - Clear auth data
- `setLoading(bool)` - Loading state
- `setError(msg)` - Error handling

---

## 📡 API Endpoints

**Base URL:** `http://localhost:8000`

### Auth Routes
- POST `/auth/register` - Register user
- POST `/auth/login` - Login user
- POST `/auth/verify-otp` - Verify OTP code
- POST `/auth/refresh-token` - Refresh JWT

### User Routes
- GET `/user/profile` - Get user profile
- PUT `/user/profile` - Update profile
- GET `/user/preferences` - Get preferences
- PUT `/user/preferences` - Update preferences

### Health Checks
- GET `/auth/health` - Auth service status
- GET `/user/health` - User service status
- GET `/price/health` - Price service status
- etc. (all 8 services have `/health`)

---

## 🔌 Socket.io Connection

```javascript
import io from 'socket.io-client'

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL,
  { 
    auth: { token: localStorage.getItem('accessToken') }
  }
)

socket.on('notification', (data) => {
  console.log('New notification:', data)
})
```

---

## 🗄️ Database Credentials

**Host:** localhost or `db` (docker)
**Port:** 3306 (MySQL) or 5432 (PostgreSQL)
**User:** root or specified user
**Password:** 123456

### Databases:
- `auth_db` - Authentication
- `user_db` - User data
- `price_db` - Price history
- `alert_db` - Price alerts
- `email_db` - Email logs
- `notification_db` - Notifications
- `admin_db` - Admin data
- `logging_db` - Application logs

---

## 📊 Port Map

| Service | Port |
|---------|------|
| Frontend | 3000 |
| Auth | 3001 |
| User | 3002 |
| Price | 3003 |
| Alert | 3004 |
| Email | 3005 |
| Notification | 3006 |
| Admin | 3007 |
| Logging | 3008 |
| API Gateway | 8000 |
| MySQL | 3306 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| RabbitMQ | 5672 |

---

## ⚡ Common Commands

```bash
# Frontend
npm run dev       # Development
npm run build     # Production build
npm start         # Start production
npm run lint      # Check code quality

# Backend (any service)
npm run dev       # Development with nodemon
npm start         # Production
npm test          # Run tests
npm run lint      # Check code quality
npm run format    # Format code
```

---

## 🆘 Troubleshooting

### "Cannot find module" error
→ Run `npm install` in that service/frontend

### "Port already in use"
→ Kill process: `lsof -i :PORT` then `kill -9 PID`

### API calls failing
→ Check API Gateway is running on port 8000

### Socket.io not connecting
→ Check NEXT_PUBLIC_SOCKET_URL in .env.local

### Database connection error
→ Ensure MySQL/PostgreSQL running on correct port

---

## 📚 Next Steps

**Days 18-19:**
- [ ] Add charts to dashboard (recharts)
- [ ] Display real-time price updates
- [ ] Add alert management UI

**Days 20-21:**
- [ ] Build admin dashboard
- [ ] User management interface
- [ ] Analytics & reporting

**Days 22+:**
- [ ] E2E testing
- [ ] Docker deployment
- [ ] CI/CD pipeline
- [ ] Documentation

---

**Status:** ✅ Ready to go!  
**Last Updated:** December 8, 2025  
**Audit Status:** All systems verified ✓
