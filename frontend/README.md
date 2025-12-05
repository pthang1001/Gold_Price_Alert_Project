# Frontend - React

React + TypeScript frontend cho Gold Price Alert application

## 📁 Structure

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── types/
│   ├── utils/
│   ├── styles/
│   └── App.tsx
├── public/
├── .env.example
├── .env
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Build

```bash
npm run build
```

## 🎯 Features

- User registration & authentication
- Real-time price updates (Socket.io)
- Price alerts management
- Admin dashboard
- Responsive design (Bootstrap 5)
- Dark/Light theme support

## 🔧 Scripts

```bash
# Development
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## 📦 Dependencies

- React 18+
- TypeScript
- React Router
- Axios
- Socket.io-client
- Bootstrap 5
- Redux (if needed for state management)

## 🌐 Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📚 Documentation

- [Architecture](../docs/architecture.md)
- [API Specification](../docs/openapi.yaml)

## 🎨 Design

- Responsive design (mobile, tablet, desktop)
- Accessible UI (WCAG 2.1)
- Dark/Light mode support
- Real-time updates with Socket.io

## 📄 License

MIT
