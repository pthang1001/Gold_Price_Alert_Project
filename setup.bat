@echo off
REM Gold Price Alert - Quick Setup Script (Windows)

echo.
echo ========================================
echo  Gold Price Alert - Backend Setup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Download from: https://www.docker.com/products/docker-desktop
    exit /b 1
)

echo ✓ Docker is installed

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Download from: https://nodejs.org
    exit /b 1
)

echo ✓ Node.js is installed: $(node --version)

REM Create .env if not exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo ✓ .env created
)

echo.
echo ========================================
echo  Starting Docker Services
echo ========================================
echo.

REM Start Docker Compose
docker-compose up -d

if errorlevel 1 (
    echo ERROR: Failed to start Docker services
    exit /b 1
)

echo ✓ Docker services started

echo.
echo ========================================
echo  Installing Dependencies
echo ========================================
echo.

REM Install dependencies for each service
for /d %%D in (backend\services\*) do (
    if exist "%%D\package.json" (
        echo Installing dependencies in %%D...
        cd %%D
        call npm install
        cd %CD%
    )
)

echo ✓ Dependencies installed

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Update .env files with your credentials
echo.
echo 2. Start services individually in development:
echo    cd backend\services\auth
echo    npm run dev
echo.
echo 3. Or use Docker Compose for production:
echo    docker-compose up
echo.
echo 4. Test API Gateway:
echo    curl http://localhost:8000/health
echo.
echo Services are available at:
echo   - API Gateway: http://localhost:8000
echo   - Auth Service: http://localhost:3001/api
echo   - User Service: http://localhost:3002/api
echo   - Price Service: http://localhost:3003/api
echo   - Alert Service: http://localhost:3004/api
echo   - Email Service: http://localhost:3005/api
echo   - Notification Service: http://localhost:3006/api
echo   - Admin Service: http://localhost:3007/api
echo   - Logging Service: http://localhost:3008/api
echo.
echo Infrastructure:
echo   - PostgreSQL: localhost:5432
echo   - Redis: localhost:6379
echo   - RabbitMQ Management: http://localhost:15672
echo.
