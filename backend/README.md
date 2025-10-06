# OSH Airlines Backend API

## 🚀 Flight Booking System Backend

A robust Node.js + NestJS + MongoDB backend API for the OSH Airlines flight booking system.

## 📊 Testing Status
- **Total Tests:** 41 tests across 7 phases
- **Success Rate:** 100% ✅
- **Last Tested:** October 5, 2025

## 🏗️ Architecture
- **Framework:** NestJS
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with Passport
- **Validation:** Class-validator
- **Security:** Helmet, CORS, Rate Limiting

## 🚀 Features
- ✅ User Authentication & Authorization
- ✅ Company Management
- ✅ Flight Management & Search
- ✅ Booking System
- ✅ Banner Management
- ✅ Gallery Management
- ✅ Role-based Access Control
- ✅ Input Validation & Error Handling

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/profile` - Get user profile

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Companies
- `GET /api/v1/companies` - Get all companies
- `POST /api/v1/companies` - Create company
- `GET /api/v1/companies/:id` - Get company by ID
- `PATCH /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company

### Flights
- `GET /api/v1/flights` - Get all flights
- `POST /api/v1/flights` - Create flight
- `GET /api/v1/flights?origin=...&destination=...` - Search flights
- `GET /api/v1/flights/:id` - Get flight by ID
- `PATCH /api/v1/flights/:id` - Update flight
- `DELETE /api/v1/flights/:id` - Delete flight

### Bookings
- `GET /api/v1/bookings` - Get all bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get booking by ID
- `GET /api/v1/bookings/user/:userId` - Get user bookings
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking
- `DELETE /api/v1/bookings/:id` - Delete booking

### Banners
- `GET /api/v1/banners` - Get all banners
- `POST /api/v1/banners` - Create banner
- `GET /api/v1/banners/:id` - Get banner by ID
- `PATCH /api/v1/banners/:id` - Update banner
- `DELETE /api/v1/banners/:id` - Delete banner

### Gallery
- `GET /api/v1/gallery` - Get all gallery images
- `POST /api/v1/gallery` - Create gallery image
- `GET /api/v1/gallery?category=...` - Get by category
- `GET /api/v1/gallery/:id` - Get gallery image by ID
- `PATCH /api/v1/gallery/:id` - Update gallery image
- `DELETE /api/v1/gallery/:id` - Delete gallery image

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run start:dev

# Start production server
npm run start:prod
```

## 🔧 Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/osh-airlines
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=1010
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testing

The backend has been thoroughly tested with 41 comprehensive tests:

- **Phase 1:** Authentication & User Management (6 tests)
- **Phase 2:** Company Management (6 tests)
- **Phase 3:** Flight Management (6 tests)
- **Phase 4:** Booking Management (6 tests)
- **Phase 5:** Banner Management (6 tests)
- **Phase 6:** Gallery Management (6 tests)
- **Phase 7:** Error Handling & Validation (5 tests)

## 🔒 Security Features

- JWT Authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Security headers with Helmet
- Role-based access control

## 📝 License

MIT License
