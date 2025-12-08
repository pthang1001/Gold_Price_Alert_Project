# Day 7-8: Price Service & Alert Service Implementation

## Overview
Hoàn thành triển khai **Price Service (Port 3003)** và **Alert Service (Port 3004)** - hai core microservices cho hệ thống cảnh báo giá vàng.

## Price Service (Port 3003)

### Tính năng đã triển khai:
✅ **Integrate Gold Price API**
- Kết nối với API imeta.priceapi.com/v1/spot/gold
- Fetch giá vàng thực tế từ bên ngoài
- Error handling và retry logic

✅ **Bull Queue Background Job**
- Cấu hình Bull Queue để fetch price mỗi 10 phút (configurable)
- Automatic retry on failure
- Job tracking và logging

✅ **Redis Caching**
- Cache giá vàng hiện tại với TTL 5 phút
- Giảm request tới external API
- Cache invalidation endpoints

✅ **Price Endpoints**
- `GET /prices/current` - Lấy giá vàng hiện tại (từ cache/live)
- `GET /prices/history` - Lịch sử giá (placeholder cho future DB)
- `GET /prices/statistics` - Thống kê giá (placeholder cho future DB)
- `POST /prices/refresh` - Làm mới giá theo yêu cầu

✅ **Event Publishing**
- Publish `price.updated` event tới RabbitMQ
- Alert Service sẽ lắng nghe sự kiện này

✅ **Configuration**
- Winston logger setup
- Redis client config
- RabbitMQ publisher setup
- Environment variables (.env.example)

### File Structure:
```
backend/services/price/
├── src/
│   ├── config/
│   │   ├── logger.js
│   │   ├── redis.js
│   │   └── rabbitmq.js
│   ├── controllers/
│   │   └── priceController.js
│   ├── routes/
│   │   └── priceRoutes.js
│   ├── services/
│   │   └── priceService.js
│   ├── jobs/
│   │   └── priceJobs.js
│   └── server.js
├── package.json
├── .env.example
└── logs/
```

---

## Alert Service (Port 3004)

### Tính năng đã triển khai:
✅ **Alert CRUD Operations**
- `POST /alerts` - Tạo alert mới
- `GET /alerts` - Danh sách alerts của user (pagination)
- `GET /alerts/:id` - Chi tiết alert
- `PUT /alerts/:id` - Cập nhật alert
- `DELETE /alerts/:id` - Xóa alert (soft delete)
- `GET /alerts/history` - Lịch sử trigger alerts

✅ **Alert Checking Logic**
- So sánh giá hiện tại với Min/Max price settings
- Support multiple alerts per user
- Alert deduplication - không gửi duplicate notification trong 5 phút
- Track lastTriggered timestamp

✅ **Event Handling**
- Consume `price.updated` events từ Price Service
- Auto-check all alerts khi có price update
- Publish `alert.triggered` event tới RabbitMQ

✅ **Validation**
- Joi validation cho request payload
- Min/Max price validation
- Status validation (active/paused/deleted)

✅ **Configuration**
- Winston logger setup
- RabbitMQ subscriber setup
- Environment variables (.env.example)

### File Structure:
```
backend/services/alert/
├── src/
│   ├── config/
│   │   ├── logger.js
│   │   └── rabbitmq.js
│   ├── controllers/
│   │   └── alertController.js
│   ├── routes/
│   │   └── alertRoutes.js
│   ├── services/
│   │   └── alertService.js
│   ├── jobs/
│   │   └── alertJobs.js
│   └── server.js
├── package.json
├── .env.example
└── logs/
```

---

## Database Schemas

### Price Database (price_db)

#### `gold_prices` Table
```sql
- id: INT PRIMARY KEY
- price: DECIMAL(10,2) - Giá vàng hiện tại
- currency: VARCHAR(3) - USD
- source: VARCHAR(50) - API source
- timestamp: TIMESTAMP - Khi lấy giá
- created_at, updated_at: TIMESTAMP
```

#### `price_history` Table
```sql
- id: INT PRIMARY KEY
- gold_price_id: INT FK
- price: DECIMAL(10,2)
- currency: VARCHAR(3)
- recorded_at: TIMESTAMP - Khi ghi lại
```

### Alert Database (alert_db)

#### `alerts` Table
```sql
- id: INT PRIMARY KEY
- user_id: VARCHAR(100)
- min_price, max_price: DECIMAL(10,2)
- status: ENUM(active, paused, deleted)
- last_triggered: TIMESTAMP
- created_at, updated_at, deleted_at: TIMESTAMP
```

#### `alert_history` Table
```sql
- id: INT PRIMARY KEY
- alert_id: INT FK
- user_id: VARCHAR(100)
- current_price: DECIMAL(10,2)
- min_price, max_price: DECIMAL(10,2)
- triggered_at: TIMESTAMP
```

#### `alert_subscriptions` Table
```sql
- id: INT PRIMARY KEY
- alert_id: INT FK
- user_id: VARCHAR(100)
- channel: VARCHAR(50) - email, sms, push
- recipient: VARCHAR(255)
- is_active: BOOLEAN
```

---

## Architecture & Communication

### RabbitMQ Event Flow:
```
Price Service (Port 3003)
  ↓ (publishes)
  price.updated event
  ↓ (routed via topic exchange)
Alert Service (Port 3004) ← (subscribes)
  ↓ (process alert check)
  ↓ (publishes if triggered)
  alert.triggered event
  ↓
Email/Notification Services (future)
```

### Redis Caching Strategy:
```
GET /prices/current
  ↓
Check Redis cache (key: 'current_gold_price')
  ├─ HIT: Return cached price (TTL: 5 min)
  └─ MISS: 
     ├─ Fetch from external API
     ├─ Cache for 5 minutes
     ├─ Publish price.updated event
     └─ Return fresh price
```

---

## Environment Variables

### Price Service (.env)
```
PORT=3003
SERVICE_NAME=Price Service
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=2
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
PRICE_UPDATE_INTERVAL=600000 (10 minutes)
LOG_LEVEL=info
```

### Alert Service (.env)
```
PORT=3004
SERVICE_NAME=Alert Service
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
ALERT_DEDUPLICATION_MINUTES=5
LOG_LEVEL=info
```

---

## Next Steps (Day 9-10)

### Email Service
- SMTP setup (Gmail with app password)
- Email template management
- Queue with retry logic
- Send alert notifications

### Notification Service
- In-app notifications CRUD
- Socket.io real-time notifications
- Notification preferences
- Real-time price updates

---

## Running Services

### Price Service
```bash
cd backend/services/price
npm install
npm run dev
# Service starts on http://localhost:3003
```

### Alert Service
```bash
cd backend/services/alert
npm install
npm run dev
# Service starts on http://localhost:3004
```

### Testing Endpoints

#### Price Service
```bash
# Get current gold price
curl http://localhost:3003/prices/current

# Refresh price
curl -X POST http://localhost:3003/prices/refresh

# Health check
curl http://localhost:3003/health
```

#### Alert Service
```bash
# Create alert
curl -X POST http://localhost:3004/alerts \
  -H "Content-Type: application/json" \
  -d '{"minPrice": 1800, "maxPrice": 2000}'

# Get all alerts
curl http://localhost:3004/alerts

# Get alert history
curl http://localhost:3004/alerts/history

# Health check
curl http://localhost:3004/health
```

---

## Notes

1. **Current Storage**: Both services use in-memory storage for now. Database integration will be completed after migrations are applied.

2. **Authentication**: JWT token handling placeholder in controllers. Will be implemented with Auth Service integration.

3. **Error Handling**: Comprehensive error handling and logging with Winston.

4. **Scalability**: Services are containerized and ready for Docker deployment.

5. **Event-Driven**: Both services communicate via RabbitMQ for loose coupling and scalability.
