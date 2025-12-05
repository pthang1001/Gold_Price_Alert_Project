# Backend Architecture Documentation

## System Overview

The Gold Price Alert backend follows a **Microservices Architecture** with 9 independent services communicating through:
1. **Synchronous**: HTTP via API Gateway
2. **Asynchronous**: RabbitMQ message queue

Each service has its own:
- PostgreSQL database
- Redis cache instance (separate DB)
- Container configuration
- Deployment configuration

## Architecture Diagram

```
┌─────────────────────────────────────┐
│         Client Applications         │
│      (Web, Mobile, Desktop)         │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │   API Gateway      │
        │    (Port 8000)      │
        │   HTTP Proxy       │
        └────────┬───────────┘
                 │
    ┌────────────┼────────────┬──────────────┬─────────────┐
    │            │            │              │             │
    ▼            ▼            ▼              ▼             ▼
┌────────┐ ┌──────────┐ ┌────────────┐ ┌────────┐  ┌──────────┐
│ Auth   │ │ User     │ │ Price      │ │ Alert  │  │ Email    │
│Service │ │ Service  │ │ Service    │ │Service │  │ Service  │
│3001    │ │ 3002     │ │ 3003       │ │ 3004   │  │ 3005     │
└────────┘ └──────────┘ └────────────┘ └────────┘  └──────────┘
    │            │            │              │             │
    ▼            ▼            ▼              ▼             ▼
┌────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (5432)                    │
│         8 Logical Databases (one per service)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ auth_db │ user_db │ price_db │ ... │ logging_db    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
    │
    ├─ Auth Service → auth_db (users, sessions, tokens)
    ├─ User Service → user_db (profiles, preferences)
    ├─ Price Service → price_db (prices, history)
    ├─ Alert Service → alert_db (alerts, thresholds)
    ├─ Email Service → email_db (emails, templates)
    ├─ Notification Service → notification_db (notifications)
    ├─ Admin Service → admin_db (settings, audit logs)
    └─ Logging Service → logging_db (application logs)

┌────────────────────────────────────┐
│     Redis Cache (6379)             │
│  Independent DB for each service   │
│  ┌──────────────────────────────┐  │
│  │ DB0  DB1  DB2  ...  DB7     │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   RabbitMQ Message Broker (5672)   │
│  Async communication between       │
│  services via exchanges & queues   │
└────────────────────────────────────┘
```

## Service Responsibilities

### 1. API Gateway (Port 8000)
- **Role**: Entry point for all client requests
- **Technology**: Express.js + http-proxy
- **Responsibilities**:
  - Route requests to appropriate microservices
  - Load balancing
  - Request/response logging
  - CORS handling
  - Health checks

**Routes**:
```
/auth    → http://auth-service:3001/api
/user    → http://user-service:3002/api
/price   → http://price-service:3003/api
/alert   → http://alert-service:3004/api
/email   → http://email-service:3005/api
/notification → http://notification-service:3006/api
/admin   → http://admin-service:3007/api
/logging → http://logging-service:3008/api
```

### 2. Auth Service (Port 3001)
- **Database**: auth_db
- **Responsibilities**:
  - User registration & login
  - JWT token generation & validation
  - Password hashing (bcrypt)
  - Session management
  - OAuth integration (future)

**Models**: User, Session, Token

### 3. User Service (Port 3002)
- **Database**: user_db
- **Responsibilities**:
  - User profile management
  - User preferences
  - Account settings
  - User deletion (GDPR)

**Models**: Profile, Preference, AccountSettings

### 4. Price Service (Port 3003)
- **Database**: price_db
- **Responsibilities**:
  - Fetch real-time gold prices
  - Cache prices in Redis
  - Historical price tracking
  - Price analytics

**Models**: Price, PriceHistory, Exchange

### 5. Alert Service (Port 3004)
- **Database**: alert_db
- **Responsibilities**:
  - Create/manage price alerts
  - Monitor price thresholds
  - Trigger alert events
  - Alert history

**Models**: Alert, AlertHistory, Threshold

### 6. Email Service (Port 3005)
- **Database**: email_db
- **Responsibilities**:
  - Send emails via SMTP
  - Email template management
  - Retry logic for failed emails
  - Email tracking

**Models**: EmailTemplate, EmailLog

### 7. Notification Service (Port 3006)
- **Database**: notification_db
- **Responsibilities**:
  - Real-time notifications (Socket.io)
  - In-app notification storage
  - Push notifications (future)
  - Notification preferences

**Models**: Notification, NotificationPreference

### 8. Admin Service (Port 3007)
- **Database**: admin_db
- **Responsibilities**:
  - System configuration
  - User management (admin)
  - System monitoring
  - Audit logging

**Models**: AdminUser, SystemConfig, AuditLog

### 9. Logging Service (Port 3008)
- **Database**: logging_db
- **Responsibilities**:
  - Centralized application logging
  - Log aggregation
  - Log analysis
  - System monitoring

**Models**: ApplicationLog, SystemMetrics

## Communication Patterns

### Synchronous (REST API)
```
Client → API Gateway → Microservice → Response
```

**Example**: User login request
```
POST http://localhost:8000/auth/login
├── API Gateway routes to Auth Service
└── Auth Service returns JWT token
```

### Asynchronous (RabbitMQ)
```
Service A → RabbitMQ (publish event) → Service B (subscribe)
```

**Example**: Price alert triggered
```
Price Service publishes "price_alert_triggered"
├── Alert Service subscribes and processes
├── Email Service subscribes and sends email
└── Notification Service subscribes and notifies user
```

## Data Flow

### User Registration Flow
```
1. Client sends POST /auth/register
2. API Gateway routes to Auth Service
3. Auth Service:
   - Validates input
   - Hashes password (bcrypt)
   - Stores in auth_db
   - Publishes "user_registered" event
4. User Service (subscribing):
   - Creates user profile in user_db
   - Sets default preferences
5. Email Service (subscribing):
   - Sends welcome email
6. Response sent to client
```

### Price Alert Flow
```
1. User creates alert: PUT /alert
2. Alert Service stores in alert_db
3. Price Service fetches prices (every 5 min)
4. For each price update:
   - Check against all active alerts
   - If threshold met, publish event
5. Consuming services:
   - Email Service: Sends email notification
   - Notification Service: Sends in-app notification
   - Admin Service: Logs the alert trigger
6. User receives notifications
```

## Database Schema

Each service has its own schema in dedicated PostgreSQL database:

### Auth Service (auth_db)
```sql
- users (id, email, password_hash, created_at)
- sessions (id, user_id, token, expires_at)
- tokens (id, user_id, type, value, expires_at)
```

### User Service (user_db)
```sql
- profiles (id, user_id, name, avatar, bio)
- preferences (id, user_id, notifications, theme)
- account_settings (id, user_id, privacy, two_factor_enabled)
```

### Price Service (price_db)
```sql
- prices (id, gold_weight, currency, price, timestamp)
- price_history (id, price_id, old_value, new_value, changed_at)
- exchanges (id, name, region, api_url)
```

### Alert Service (alert_db)
```sql
- alerts (id, user_id, alert_type, threshold, active)
- alert_history (id, alert_id, triggered_at, value)
```

### Email Service (email_db)
```sql
- email_templates (id, name, subject, body)
- email_logs (id, recipient, subject, sent_at, status)
```

### Notification Service (notification_db)
```sql
- notifications (id, user_id, type, message, read_at)
- notification_preferences (id, user_id, email, in_app, push)
```

### Admin Service (admin_db)
```sql
- admin_users (id, email, role, created_at)
- system_config (id, key, value, updated_at)
- audit_logs (id, admin_id, action, target, timestamp)
```

### Logging Service (logging_db)
```sql
- application_logs (id, service, level, message, timestamp)
- system_metrics (id, service, cpu, memory, timestamp)
```

## Caching Strategy (Redis)

Each service uses isolated Redis DB (0-7):

| Service | DB | Data Cached | TTL |
|---------|----|-----------|----|
| Auth | 0 | JWT blacklist, sessions | 24h |
| User | 1 | User profiles, preferences | 1h |
| Price | 2 | Current gold prices, historical | 5min |
| Alert | 3 | Active alerts, thresholds | 30min |
| Email | 4 | Email templates | 24h |
| Notification | 5 | User notification count | 15min |
| Admin | 6 | System config, stats | 1h |
| Logging | 7 | Recent logs, metrics | 24h |

## Message Queue (RabbitMQ)

### Exchanges
- `events.users` - User-related events
- `events.prices` - Price-related events
- `events.alerts` - Alert-related events
- `events.notifications` - Notification events
- `events.emails` - Email events

### Queues & Subscribers
```
user_registered
├── user-service: Create profile
├── email-service: Send welcome email
└── notification-service: Send welcome notification

price_updated
├── alert-service: Check thresholds
└── logging-service: Log update

alert_triggered
├── email-service: Send alert email
├── notification-service: Send in-app notification
└── logging-service: Log event

email_sent
├── notification-service: Notify user
└── logging-service: Log delivery
```

## Deployment Architecture

### Development
- Each service runs locally with `npm run dev`
- Services communicate via localhost
- Shared PostgreSQL, Redis, RabbitMQ via Docker

### Production (Docker Compose)
- All services run in containers
- Internal Docker network for inter-service communication
- Shared infrastructure containers (DB, Cache, MQ)
- Health checks for all services
- Automatic restart policies

### Future (Kubernetes)
- Each service in separate pod
- Service mesh (Istio) for communication
- Auto-scaling per service
- Centralized logging (ELK stack)
- Distributed tracing (Jaeger)

## Security Architecture

### Authentication & Authorization
```
Client Request
    ↓
API Gateway (CORS check)
    ↓
Auth Service (validate JWT)
    ↓
Service (verify permissions)
```

### Data Protection
- Passwords: bcrypt hashing
- Sensitive data: encrypted at rest
- HTTPS: TLS 1.3 in production
- Secrets: Environment variables (not in code)

### Network Security
- Internal Docker network (services to services)
- Exposed ports: 8000 (API), 5432 (DB), 6379 (Cache), 5672 (MQ)
- Firewall rules for production deployment

## Monitoring & Observability

### Logging
- Winston logger for application logs
- Centralized in Logging Service
- Log levels: debug, info, warn, error, fatal

### Metrics
- Service health checks (/health endpoints)
- Response time tracking
- Error rate monitoring
- Database query performance

### Tracing
- Request correlation IDs
- Service-to-service trace tracking
- Future: Distributed tracing with Jaeger

## Scalability Considerations

### Horizontal Scaling
- Services can run multiple instances
- Load balancer distributes requests
- Shared database & cache
- Message queue broadcasts to all subscribers

### Performance Optimization
- Redis caching for frequent queries
- Database indexing on critical fields
- Connection pooling (5-10 connections per service)
- Pagination for large datasets

### Rate Limiting
- Per-service rate limiting
- Per-user API quotas
- Exponential backoff for retries

## Error Handling

### Service-to-Service Errors
```javascript
try {
  const response = await axios.get(`http://auth-service:3001/api/validate`);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    // Service unavailable, use circuit breaker
  }
  // Retry with exponential backoff
}
```

### Database Errors
- Retry with exponential backoff
- Connection pool management
- Timeout handling
- Error logging

### Message Queue Errors
- Dead letter queues for failed messages
- Retry policies
- Manual intervention triggers

## Future Enhancements

1. **API Versioning**: /api/v1, /api/v2
2. **Service Discovery**: Consul or Eureka
3. **API Gateway Features**: Rate limiting, throttling, caching
4. **Authentication**: OAuth 2.0, OpenID Connect
5. **Distributed Tracing**: Jaeger or Zipkin
6. **Service Mesh**: Istio for advanced traffic management
7. **Kubernetes Deployment**: Production orchestration
8. **GraphQL Gateway**: Alternative to REST API
9. **Webhooks**: For external integrations
10. **Analytics Pipeline**: Big data processing

---

**Last Updated**: December 4, 2025  
**Version**: 1.0.0-alpha
