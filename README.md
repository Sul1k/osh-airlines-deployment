# OSH Airlines - Deployment Ready

This repository contains both backend and frontend ready for deployment.

## Deployment Options

### Option 1: Separate Deployment (Recommended)
- **Backend**: Deploy to Railway/Heroku
- **Frontend**: Deploy to Netlify/Vercel
- **API calls**: Frontend calls backend via environment variable

### Option 2: Combined Deployment
- **Both**: Deploy to Railway as one unit
- **API calls**: Frontend uses relative URLs

## Quick Start

### Separate Deployment:
1. Deploy backend first
2. Update frontend environment variable with backend URL
3. Deploy frontend

### Combined Deployment:
1. Deploy entire repository
2. Backend serves frontend + API

## Environment Variables

### Backend:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `NODE_ENV` - production
- `FRONTEND_URL` - Frontend URL (for separate deployment)

### Frontend:
- `VITE_API_BASE_URL` - Backend API URL (for separate deployment)
