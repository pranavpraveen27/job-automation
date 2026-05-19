# Quick Start Guide - AICruit Authentication

## 🚀 Fast Setup (5 minutes)

### Step 1: Backend Setup
```bash
cd backend
npm install
```

Update `.env`:
```env
MONGO_URI=mongodb://localhost:27017/job-agent
PORT=5000
JWT_SECRET=your-secret-key-123456
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
npm start
# Server running at http://localhost:5000
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
```

Update `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Start frontend:
```bash
npm run dev
# App running at http://localhost:5173
```

## 🔑 Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create new project → "AICruit Auth"
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web app)
5. Add authorized URIs:
   - `http://localhost:5173`
   - `http://localhost:5000`
6. Copy Client ID and Secret to `.env` files

## 📱 Test the System

1. Open http://localhost:5173
2. Click "Sign up" → Create account
3. Fill in details and submit
4. Should redirect to dashboard
5. Try logout and login again
6. Refresh page - should stay logged in!

## ✨ Features Ready to Use

✅ Email/Password Authentication
✅ Google OAuth Login
✅ Persistent Sessions (localStorage)
✅ Protected Routes
✅ Modern Animated UI
✅ JWT Token Based Auth
✅ Password Hashing (bcryptjs)

## 🔧 Customize

**Change JWT expiration** (default: 7 days):
- Edit `backend/controllers/authController.js`
- Line 5: `const JWT_EXPIRE = '7d';`

**Change API URL**:
- Edit frontend `.env` file

**Change UI colors**:
- Edit `frontend/src/pages/Login.jsx` and `Signup.jsx`
- Modify Tailwind classes (purple → blue, etc.)

## 🐛 Troubleshooting

**"Cannot find module"**
→ Run `npm install` in respective folder

**"MongoDB connection error"**
→ Ensure MongoDB is running or update MONGO_URI

**"CORS error"**
→ Check FRONTEND_URL in backend .env matches your frontend URL

**"Google OAuth not working"**
→ Verify credentials in Google Cloud Console and `.env` files

## 📚 API Examples

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","firstName":"John","lastName":"Doe"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

## 🎯 Next Steps

1. ✅ Setup complete!
2. Test all auth flows
3. Deploy to production
4. Add email verification (optional)
5. Implement password reset (optional)
6. Add 2FA (optional)

---

Need help? Check AUTH_SETUP.md for detailed documentation.
