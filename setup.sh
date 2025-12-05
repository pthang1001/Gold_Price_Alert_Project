#!/bin/bash
# Gold Price Alert - Quick Setup Script (Linux/Mac)

echo ""
echo "========================================"
echo "  Gold Price Alert - Backend Setup"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in PATH"
    echo "Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✓ Docker is installed: $(docker --version)"

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Download from: https://nodejs.org"
    exit 1
fi

echo "✓ Node.js is installed: $(node --version)"

# Create .env if not exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env created"
fi

echo ""
echo "========================================"
echo "  Starting Docker Services"
echo "========================================"
echo ""

# Start Docker Compose
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start Docker services"
    exit 1
fi

echo "✓ Docker services started"

echo ""
echo "========================================"
echo "  Installing Dependencies"
echo "========================================"
echo ""

# Install dependencies for each service
for service_dir in backend/services/*/; do
    if [ -f "$service_dir/package.json" ]; then
        echo "Installing dependencies in $service_dir..."
        cd "$service_dir"
        npm install
        cd - > /dev/null
    fi
done

echo "✓ Dependencies installed"

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Update .env files with your credentials"
echo ""
echo "2. Start services individually in development:"
echo "   cd backend/services/auth"
echo "   npm run dev"
echo ""
echo "3. Or use Docker Compose for production:"
echo "   docker-compose up"
echo ""
echo "4. Test API Gateway:"
echo "   curl http://localhost:8000/health"
echo ""
echo "Services are available at:"
echo "   - API Gateway: http://localhost:8000"
echo "   - Auth Service: http://localhost:3001/api"
echo "   - User Service: http://localhost:3002/api"
echo "   - Price Service: http://localhost:3003/api"
echo "   - Alert Service: http://localhost:3004/api"
echo "   - Email Service: http://localhost:3005/api"
echo "   - Notification Service: http://localhost:3006/api"
echo "   - Admin Service: http://localhost:3007/api"
echo "   - Logging Service: http://localhost:3008/api"
echo ""
echo "Infrastructure:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - RabbitMQ Management: http://localhost:15672"
echo ""
