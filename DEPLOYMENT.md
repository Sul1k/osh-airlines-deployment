# Deployment Instructions

## Option 1: Separate Deployment (Recommended)

### Step 1: Deploy Backend
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Select this repository
4. Set **Root Directory** to `backend`
5. Add environment variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = your JWT secret key
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-frontend.netlify.app` (update after frontend deployment)
6. Deploy and get your backend URL

### Step 2: Deploy Frontend
1. Go to [Netlify](https://netlify.com)
2. Create new site from GitHub
3. Select this repository
4. Set **Base Directory** to `frontend`
5. Set **Build Command** to `npm run build`
6. Set **Publish Directory** to `frontend/build`
7. Add environment variable:
   - `VITE_API_BASE_URL` = your backend URL from Step 1
8. Deploy

### Step 3: Update Backend CORS
1. Go back to Railway backend settings
2. Update `FRONTEND_URL` to your actual Netlify URL
3. Redeploy backend

---

## Option 2: Combined Deployment

### Step 1: Deploy Everything
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Select this repository
4. Set **Root Directory** to `.` (root)
5. Add environment variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = your JWT secret key
   - `NODE_ENV` = `production`
6. Deploy

### Result:
- Frontend: `https://your-app.railway.app/`
- API: `https://your-app.railway.app/api/v1/`

---

## Environment Variables Reference

### Backend Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `NODE_ENV` - production

### Backend Optional (for separate deployment):
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend Required (for separate deployment):
- `VITE_API_BASE_URL` - Backend API URL

### Frontend Optional (for combined deployment):
- Leave `VITE_API_BASE_URL` empty to use relative URLs
