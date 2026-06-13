# Full-Stack MERN URL Shortener

A production-ready, visually stunning URL shortener built with MongoDB, Express, React, and Node.js.

---

## ✨ Features

- **Instant URL shortening** with nanoid-generated codes
- **Custom aliases** — choose your own short URL path
- **QR code generation** for every link (downloadable)
- **Real-time click analytics** — browser, OS, device, referrer tracking
- **Link expiration** — set links to expire after 1/7/30/90 days
- **User authentication** — JWT-based auth (register/login)
- **Personal dashboard** — manage all your links with search & pagination
- **Tags & titles** — organise your links by campaign or project
- **Rate limiting** — API protected against abuse
- **Demo mode** — works without a backend (localStorage fallback)

---

## 🗂 Project Structure

```
url-shortener/
├── server/                 # Express + MongoDB backend
│   ├── index.js            # Entry point
│   ├── models/
│   │   ├── Url.js          # URL schema with click tracking
│   │   └── User.js         # User schema with bcrypt auth
│   ├── routes/
│   │   ├── url.js          # POST /shorten, GET /my-urls, DELETE, PUT
│   │   ├── auth.js         # POST /register, POST /login, GET /me
│   │   └── analytics.js    # GET /dashboard
│   ├── middleware/
│   │   └── auth.js         # JWT auth & optionalAuth middleware
│   └── .env.example
│
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html      # Standalone HTML/CSS/JS app
│   └── src/
│       ├── utils/api.js    # Axios instance + API helpers
│       └── hooks/useAuth.js # Auth context provider
│
└── package.json            # Root with concurrently scripts
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd url-shortener
npm run install-all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_super_secret_key_here
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### 3. Run Development

```bash
# From root — runs both server & client
npm run dev

# Or separately:
npm run server   # Express on :5000
npm run client   # React on :3000
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user (auth required) |

### URLs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/url/shorten` | Shorten a URL |
| GET | `/api/url/my-urls` | Get authenticated user's links |
| GET | `/api/url/:id/stats` | Get analytics for a link |
| PUT | `/api/url/:id` | Update title/tags |
| DELETE | `/api/url/:id` | Delete a link |
| GET | `/:code` | Redirect short code → original URL |

### Shorten Request Body

```json
{
  "originalUrl": "https://example.com/very/long/path",
  "customAlias": "my-launch",
  "title": "Product Launch",
  "tags": ["marketing", "q4"],
  "expiresIn": "30"
}
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Framer Motion |
| Styling | Custom CSS with CSS variables, Google Fonts (Syne + DM Sans) |
| State | React Context API + React Query |
| Backend | Node.js 18+, Express 4 |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcrypt |
| Analytics | UA-Parser-JS for device detection |
| QR Codes | qrcode npm package |
| Rate Limiting | express-rate-limit |

---

## 🌐 Deployment

### MongoDB Atlas (production)

Replace `MONGO_URI` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/urlshortener
```

### Render / Railway / Fly.io

1. Deploy server with `npm start` in `/server`
2. Set environment variables in platform dashboard
3. Update `BASE_URL` to your deployed server URL

### Vercel (frontend)

```bash
cd client
vercel deploy
```

Set `REACT_APP_API_URL=https://your-server.railway.app/api`

---

## 📁 Key Files to Know

- `server/models/Url.js` — URL + click tracking schema
- `server/routes/url.js` — Core shortening + redirect logic
- `server/index.js` — Main redirect handler (GET `/:code`)
- `client/public/index.html` — Complete frontend (works standalone)
- `client/src/utils/api.js` — All API calls in one place

---

Made with ❤️ using the MERN stack
