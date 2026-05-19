# AICruit - Professional Authentication System

A comprehensive authentication system for AICruit with JWT, Google OAuth, password hashing, and protected routes. Features a modern, futuristic UI built with React and Tailwind CSS.

## Features

✅ **User Authentication**
- Email/password signup and login
- JWT token-based authentication
- Secure password hashing with bcryptjs
- Persistent login sessions (localStorage)

✅ **Google OAuth Integration**
- One-click Google login/signup
- Automatic user creation from Google data
- Account linking for existing users

✅ **Protected Routes**
- Route-level access control
- Automatic redirect to login for unauthenticated users
- Loading states during auth checks

✅ **Modern UI**
- Animated gradient backgrounds
- Glass-morphism design elements
- Responsive layout for all devices
- Smooth transitions and interactions

## Tech Stack

### Backend
- **Node.js + Express** - RESTful API
- **MongoDB + Mongoose** - Data persistence
- **bcryptjs** - Password hashing
- **jsonwebtoken (JWT)** - Token authentication
- **Passport.js** - OAuth2 support (optional setup)
- **CORS** - Cross-origin requests

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **@react-oauth/google** - Google OAuth
- **Vite** - Build tool

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- Google OAuth credentials

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (`.env`):**
   ```env
   MONGO_URI=mongodb://localhost:27017/job-agent
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```
   Server runs at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (`.env`):**
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/signup` | Create new account | ❌ |
| POST | `/login` | Login with credentials | ❌ |
| POST | `/google` | Google OAuth callback | ❌ |
| GET | `/me` | Get current user | ✅ |
| POST | `/logout` | Logout user | ✅ |

### Request/Response Examples

**Signup:**
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "authProvider": "local",
    "createdAt": "2026-05-19T10:00:00Z"
  }
}
```

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

**Google OAuth:**
```bash
POST /api/auth/google
Content-Type: application/json

{
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "googleId": "110169947040123456789"
}

Response:
{
  "message": "Google authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

**Protected Route (Get Current User):**
```bash
GET /api/auth/me
Authorization: Bearer <your-jwt-token>

Response:
{
  "user": { ... }
}
```

## Frontend Usage

### Auth Context Hook

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, token, login, logout, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.firstName}!</p>
        <button onClick={logout}>Logout</button>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Protected Routes

```jsx
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';

<Routes>
  <Route path="/login" element={<Login />} />
  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
```

## Security Features

🔒 **Password Security**
- Bcryptjs hashing with 10 salt rounds
- Passwords never stored in plain text
- Password field excluded from user responses

🔒 **Token Security**
- JWT tokens with 7-day expiration
- Tokens stored in localStorage (client-side)
- Authorization header validation on protected routes

🔒 **MongoDB Security**
- Email uniqueness enforced at database level
- Google ID uniqueness for OAuth
- Timestamps for audit trail

🔒 **CORS Protection**
- Whitelist frontend domain in backend
- Credentials allowed only from trusted sources

## Environment Variables

### Backend (.env)
```
MONGO_URI              # MongoDB connection string
PORT                   # Server port (default: 5000)
JWT_SECRET             # JWT signing secret (change in production!)
GOOGLE_CLIENT_ID       # Google OAuth client ID
GOOGLE_CLIENT_SECRET   # Google OAuth client secret
FRONTEND_URL           # Frontend URL for CORS
```

### Frontend (.env)
```
VITE_API_BASE_URL      # Backend API URL
VITE_GOOGLE_CLIENT_ID  # Google OAuth client ID
```

## Setting Up Google OAuth

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project

2. **Enable OAuth 2.0:**
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized URIs:
     - http://localhost:5173 (dev)
     - http://localhost:5000 (backend)

3. **Add credentials to `.env`:**
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## File Structure

```
backend/
├── controllers/
│   └── authController.js       # Auth handlers
├── middleware/
│   └── auth.js                 # JWT verification
├── models/
│   ├── User.js                 # User schema
│   └── Job.js                  # Job schema
├── routes/
│   └── auth.js                 # Auth endpoints
├── .env                        # Environment variables
├── package.json
└── server.js                   # Express app

frontend/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx  # Route protection
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx     # Auth state management
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Signup.jsx          # Signup page
│   │   └── Dashboard.jsx       # Protected dashboard
│   ├── App.jsx                 # Router setup
│   └── main.jsx                # Entry point
├── .env                        # Environment variables
└── package.json
```

## Testing the System

### 1. Test Local Authentication
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get Current User (replace TOKEN with actual JWT)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### 2. Test Protected Routes
- Navigate to `http://localhost:5173/dashboard` without login
- Should redirect to login page
- After login, should access dashboard

### 3. Test Persistent Sessions
- Login and refresh the page
- Should remain logged in (token in localStorage)
- Clear localStorage and refresh
- Should redirect to login

## Production Deployment

### Security Checklist
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Change `MONGO_URI` to production database
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Enable HTTPS (required for Google OAuth)
- [ ] Set environment variables on hosting platform
- [ ] Configure Google OAuth credentials for production domain
- [ ] Enable rate limiting on auth endpoints
- [ ] Add email verification (optional enhancement)
- [ ] Implement refresh token rotation (optional enhancement)
- [ ] Add password reset functionality (optional enhancement)

## Troubleshooting

**Port Already in Use:**
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

**MongoDB Connection Error:**
- Ensure MongoDB is running locally or connection string is correct
- Check firewall rules for cloud MongoDB

**Google OAuth Not Working:**
- Verify client ID and secret are correct
- Ensure redirect URIs match in Google Console
- Check frontend URL matches in CORS config

**Token Expired:**
- Users must login again after 7 days
- Consider implementing refresh token in production

## Future Enhancements

- [ ] Email verification on signup
- [ ] Password reset via email
- [ ] Refresh token rotation
- [ ] Two-factor authentication (2FA)
- [ ] Social login integrations (GitHub, LinkedIn)
- [ ] User profile management
- [ ] Login activity logs
- [ ] Rate limiting on auth endpoints
- [ ] Captcha on signup/login
- [ ] Account deletion functionality

## Support & Documentation

For issues and questions:
1. Check the troubleshooting section above
2. Review API endpoint examples
3. Inspect browser console for frontend errors
4. Check server logs for backend errors

## License

MIT License - Built for AICruit

---

**Last Updated:** May 19, 2026
**Version:** 1.0.0
