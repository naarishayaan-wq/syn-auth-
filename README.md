# 🚀 SYN AUTH PROFESSIONAL KIOSK

A high-performance, enterprise-grade authentication and license management platform.

## 🛠️ Production Deployment (Render)

1. **Connect Repository**: Link your GitHub repo to a New Web Service on Render.
2. **Build Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. **Environment Variables**:
   - `JWT_SECRET`: A long secure string for token signing.
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (Render will automatically assign a port, but the server is ready).

## 🔐 Advanced Security System

- **JWT Authentication**: Secure stateless sessions with 7-day expiration.
- **Bcrypt Hashing**: Industry-standard password encryption (salted & hashed).
- **Protected Routes**: Dashboard and Admin APIs are shielded behind JWT middleware.
- **HWID Locking**: Hardware-level protection to prevent license sharing.

## 📱 Features

- **Real-time Dashboard**: Live analytics and activity tracking.
- **Auto-App Generation**: New users get a workspace instantly on signup.
- **SDK Integration**: Ready-to-use C# and JS integration snippets.
- **Global Stability**: Optimized for low-latency global access via Render.

## 🏗️ Architecture

- **Frontend**: React 19, Vite, Framer Motion, Tailwind CSS v4.
- **Backend**: Node.js, Express, JWT, Bcrypt.
- **Storage**: Persistent JSON database (scalable to hundreds of users).

---
© 2026 SYN AUTH SECURITY INC.