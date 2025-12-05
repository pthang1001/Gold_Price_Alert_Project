# Gold Price Alert System - Backend

**Status**: ✅ Ready for Development (95% Complete)

## Project Overview

A microservices-based backend for real-time gold price tracking and alert system. The backend consists of 9 independent Node.js services communicating through an API Gateway and message queue.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Port 8000)                  │
│                   http-proxy router to services              │
└──────────┬──────────────┬────────────────┬──────────────────┘
           │              │                │
      ┌────▼────┐    ┌────▼────┐    ┌────▼────┐    ┌─────────┐
      │  Auth   │    │   User   │    │  Price  │    │  Alert  │
      │ 3001    │    │  3002    │    │  3003   │    │  3004   │
      └─────────┘    └─────────┘    └─────────┘    └─────────┘
      
      ┌─────────┐    ┌─────────┐    ┌──────────────┐ ┌────────┐
      │  Email  │    │   Notif │    │   Admin      │ │Logging │
      │  3005   │    │  3006   │    │  3007        │ │ 3008   │
      └─────────┘    └─────────┘    └──────────────┘ └────────┘

┌─────────────────────────────────────────────────────────────┐
│          Shared Infrastructure (Docker Network)             │
├──────────────────────────────────────────────────────────────┤
│ PostgreSQL (5432) │ Redis (6379) │ RabbitMQ (5672)          │
│ 8 Databases       │ 8 DB Slots   │ Message Broker           │
│ (auth_db...       │ (DB 0-7)     │ (amqp)                   │
│  logging_db)      │              │                          │
└──────────────────────────────────────────────────────────────┘
```

## Services

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| API Gateway | 8000 | - | HTTP proxy to microservices |
| Auth | 3001 | auth_db | User authentication & JWT |
| User | 3002 | user_db | User management |
| Price | 3003 | price_db | Gold price tracking |
| Alert | 3004 | alert_db | Price alert management |
| Email | 3005 | email_db | Email sending (SMTP) |
| Notification | 3006 | notification_db | Real-time notifications (Socket.io) |
| Admin | 3007 | admin_db | Admin dashboard & operations |
| Logging | 3008 | logging_db | Application logging & monitoring |

## Tech Stack

- **Runtime**: Node.js v25+
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 14 + Sequelize ORM
- **Cache**: Redis 7
- **Message Queue**: RabbitMQ 3
- **Real-time**: Socket.io (Notification service)
- **Logging**: Winston 3
- **Linting**: ESLint + Prettier
- **Testing**: Jest
- **Containerization**: Docker + Docker Compose

## Prerequisites

- **Node.js** v25+ ([Download](https://nodejs.org))
- **Docker & Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com))

## Quick Start

### 1. Clone & Setup Project

```bash
# Clone repository
git clone <repository-url>
cd Gold_Price_Alert_Project

# Copy environment file
cp .env.example .env
```

### 2. Start Infrastructure (Docker)

```bash
# Start PostgreSQL, Redis, RabbitMQ, and all 9 microservices
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Install Dependencies (Per Service)

```bash
# Option A: Install all services at once (PowerShell)
Get-ChildItem -Path "backend/services" -Directory | ForEach-Object {
  $dir = $_.FullName
  Set-Location $dir
  npm install
  Set-Location -
}

# Option B: Install specific service
cd backend/services/auth
npm install
cd -
```

### 4. Development Mode (Non-Docker)

```bash
# Terminal 1: Start Auth Service (dev mode with nodemon)
cd backend/services/auth
npm run dev

# Terminal 2: Start User Service
cd backend/services/user
npm run dev

# Terminal 3: Start API Gateway
cd backend/services/api-gateway
npm run dev

# Services are now running:
# API Gateway: http://localhost:8000
# Auth Service: http://localhost:3001/api
# User Service: http://localhost:3002/api
```

### 5. Test API Gateway

```bash
# Health check
curl http://localhost:8000/health

# Route to Auth service
curl http://localhost:8000/auth/login

# Route to User service
curl http://localhost:8000/user/profile

# Direct to service (if needed)
curl http://localhost:3001/api/login
curl http://localhost:3002/api/profile
```

## Project Structure

```
Gold_Price_Alert_Project/
├── backend/
│   └── services/
│       ├── api-gateway/              # HTTP Proxy (8000)
│       ├── auth/                     # Authentication (3001)
│       ├── user/                     # User Management (3002)
│       ├── price/                    # Price Tracking (3003)
│       ├── alert/                    # Alert Management (3004)
│       ├── email/                    # Email Service (3005)
│       ├── notification/             # Notifications (3006)
│       ├── admin/                    # Admin Panel (3007)
│       └── logging/                  # Logging Service (3008)
│
├── frontend/                         # React/Vue frontend
├── docker-compose.yml                # Orchestrates all services
├── .env.example                      # Environment variables template
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .editorconfig                     # Editor configuration
└── README.md                         # This file
```

## Service Structure (Each Service)

```
backend/services/[service-name]/
├── src/
│   ├── server.js                 # Express app entry point
│   ├── config/
│   │   ├── database.js          # Sequelize PostgreSQL connection
│   │   ├── redis.js             # Redis client setup
│   │   └── messageQueue.js      # RabbitMQ AMQP setup
│   ├── middleware/
│   │   ├── auth.js              # JWT validation (auth service only)
│   │   ├── errorHandler.js      # Global error handling
│   │   └── logger.js            # Winston logging
│   ├── routes/
│   │   └── index.js             # API endpoint definitions
│   ├── controller/               # Request handlers (to implement)
│   ├── services/                # Business logic layer (to implement)
│   └── models/                  # Sequelize database models (to implement)
├── logs/                        # Application logs
├── package.json                 # Dependencies & scripts
├── .env                         # Service configuration
├── .dockerignore                # Docker build optimization
└── Dockerfile                   # Container build configuration
```

## Environment Variables

Each service has a `.env` file. Update credentials before deployment:

```env
# Service Configuration
NODE_ENV=development
PORT=3001
SERVICE_NAME=auth-service

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=auth_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# Message Queue
AMQP_URL=amqp://guest:guest@rabbitmq:5672

# Service-specific (Auth)
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=24h

# Service-specific (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Common Commands

### Development

```bash
# Development mode (with hot reload via nodemon)
npm run dev

# Production mode
npm start

# Linting
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors

# Formatting
npm run format        # Format code with Prettier

# Testing
npm test              # Run Jest tests
```

### Docker

```bash
# Build specific service
docker build -t auth-service ./backend/services/auth

# Run service container
docker run -p 3001:3001 --env-file ./backend/services/auth/.env auth-service

# Full stack with Docker Compose
docker-compose up -d
docker-compose ps          # View services
docker-compose logs auth   # View logs
docker-compose down        # Stop all services
```

## Database Initialization

PostgreSQL is automatically initialized on first `docker-compose up`:

```bash
# View all databases
docker exec gold-price-postgres psql -U postgres -l

# Connect to auth database
docker exec -it gold-price-postgres psql -U postgres -d auth_db

# View tables
\dt

# Exit psql
\q
```

## Redis Cache

```bash
# Connect to Redis
docker exec -it gold-price-redis redis-cli

# View database
select 0  # Each service has own DB (0-7)

# View keys
keys *

# Exit redis-cli
exit
```

## RabbitMQ Management

```bash
# Web UI
http://localhost:15672
Default credentials: guest/guest

# View queues
docker exec gold-price-rabbitmq rabbitmqctl list_queues

# View exchanges
docker exec gold-price-rabbitmq rabbitmqctl list_exchanges
```

## Debugging

### View Service Logs

```bash
# Docker Compose
docker-compose logs auth-service -f

# Direct (development)
npm run dev  # Logs to console

# File logs
cat logs/error.log
cat logs/combined.log
```

### Health Checks

```bash
# All services
for port in 8000 3001 3002 3003 3004 3005 3006 3007 3008; do
  echo "Port $port: $(curl -s http://localhost:$port/health | jq .status)"
done
```

### Common Issues

**Port already in use**
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess
taskkill /PID <process-id> /F

# Linux/Mac
lsof -i :3001
kill -9 <process-id>
```

**Docker network issues**
```bash
docker network ls
docker network inspect gold-price-network
```

**Database connection failed**
```bash
# Check PostgreSQL
docker ps | grep postgres
docker logs gold-price-postgres
```

## Next Steps

### Phase 1: Implementation (Current)
- [ ] Implement controllers for each service
- [ ] Implement service layer (business logic)
- [ ] Implement database models (Sequelize)
- [ ] Create API documentation (Swagger/OpenAPI)

### Phase 2: Features
- [ ] User authentication & authorization
- [ ] Real-time price updates
- [ ] Price alert system
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Comprehensive logging

### Phase 3: Production
- [ ] Unit & Integration tests
- [ ] API documentation
- [ ] Performance optimization
- [ ] Security hardening
- [ ] CI/CD pipeline
- [ ] Deployment automation

## API Endpoints Structure

```
# Via API Gateway (Port 8000)
POST   http://localhost:8000/auth/login
POST   http://localhost:8000/auth/register
POST   http://localhost:8000/auth/logout

GET    http://localhost:8000/user/profile
PUT    http://localhost:8000/user/profile

GET    http://localhost:8000/price/current
GET    http://localhost:8000/price/history

GET    http://localhost:8000/alert
POST   http://localhost:8000/alert
PUT    http://localhost:8000/alert/:id

POST   http://localhost:8000/email/send
GET    http://localhost:8000/email/queue

GET    http://localhost:8000/notification
PUT    http://localhost:8000/notification/:id/read

GET    http://localhost:8000/admin/config
GET    http://localhost:8000/admin/users

GET    http://localhost:8000/logging/logs
POST   http://localhost:8000/logging/logs
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

## Code Style

- **Linting**: ESLint (see `.eslintrc.json`)
- **Formatting**: Prettier (see `.prettierrc`)
- **Indentation**: 2 spaces
- **Line endings**: LF
- **Quotes**: Single quotes

Run formatting before commit:
```bash
npm run format
npm run lint:fix
```

## Troubleshooting

### Service won't start
```bash
# Check Node version
node --version  # Should be v25+

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Docker build fails
```bash
# Clean Docker
docker system prune -a

# Rebuild
docker-compose build --no-cache

# Start
docker-compose up
```

### Database permission error
```bash
# Reset PostgreSQL permissions
docker exec -u postgres gold-price-postgres psql -c "ALTER USER postgres WITH SUPERUSER;"
```

## License

ISC

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact: [email/contact info]

---

**Project Status**: ✅ Backend Ready for Development  
**Last Updated**: December 4, 2025  
**Version**: 1.0.0-alpha


