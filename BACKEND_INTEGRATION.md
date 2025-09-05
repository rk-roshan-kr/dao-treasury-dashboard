# Backend Integration Guide

## For Backend Developers

This frontend is ready for backend integration. Follow this guide to set up the required API endpoints.

## Quick Setup

1. **Clone this repository**
```bash
git clone https://github.com/YOUR_USERNAME/dao-treasury-dashboard.git
```

2. **Set up your backend** (Node.js/Express recommended)
3. **Implement the API endpoints** listed below
4. **Update frontend environment** to point to your backend

## Required API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Crypto Data
- `GET /api/crypto/prices` - Real-time crypto prices
- `GET /api/crypto/history/:symbol` - Price history

### Portfolio
- `GET /api/portfolio` - User portfolio
- `POST /api/portfolio/invest` - Make investment
- `GET /api/portfolio/transactions` - Transaction history

### Wallets
- `GET /api/wallets` - Connected wallets
- `POST /api/wallets/connect` - Connect wallet
- `DELETE /api/wallets/:id` - Disconnect wallet

## Environment Configuration

Create `.env` in the frontend root:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=DAO Treasury Dashboard
```

## CORS Setup

Configure your backend to allow CORS:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## Testing Integration

1. Start your backend on port 3001
2. Run `npm run dev` in the frontend
3. Frontend will automatically connect to your backend
4. Test all features end-to-end

## Data Models

See the TypeScript interfaces in `src/state/` for expected data structures.
