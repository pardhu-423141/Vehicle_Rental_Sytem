<div align="center">

# 🚗 Vehicle Rental System

**A full-stack vehicle rental platform with role-based dashboards, KYC verification, Razorpay payments, and real-time notifications.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://vehicle-rental-sytem-1.vercel.app/)
[![Frontend](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](./vehicle-rental-frontend)
[![Backend](https://img.shields.io/badge/Express-TypeScript-000000?style=for-the-badge&logo=express&logoColor=white)](./vehicle-rental-backend)
[![Database](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](./vehicle-rental-backend/prisma/schema.prisma)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](#license)

**🌐 Live:** [https://vehicle-rental-sytem-1.vercel.app/](https://vehicle-rental-sytem-1.vercel.app/)

</div>

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Roles & Access](#roles--access)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Setup](#local-setup)
  - [Docker Setup](#docker-setup)
- [Database & Migrations](#database--migrations)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Vehicle Rental System is a production-grade rental platform that connects customers with a managed fleet of vehicles. It ships with a **React SPA frontend** and an **Express + Prisma REST API**, supporting the complete rental lifecycle:

> **Browse → Book → KYC Verify → Pay (Razorpay) → Pick-up / Handover → Ride → Return → Rate**

The platform is built around **four distinct roles** (Customer, User Manager, Vehicle Manager, Admin), each with its own protected dashboard, so operations teams and customers never share the same UI.

---

## Key Features

### 👤 Customer
- Email + OTP registration, login, forgot / reset password (JWT in httpOnly cookies)
- Browse & search the vehicle marketplace with filters (type, capacity, price)
- Checkout with date-range pricing and **coupon / discount codes**
- **Razorpay** payment integration (order creation, signature verification, webhook handling)
- KYC document upload (front/back ID images via **Cloudinary**)
- Ride history, booking cancellation, and vehicle reviews with ratings

### 🛡️ Admin
- Overview dashboard with revenue & operations metrics
- Fleet management (add / edit / soft-delete vehicles, status logs)
- User management and staff (manager) creation
- KYC approval / rejection with reasons
- Maintenance hub, issue logs, and **revenue reports**

### 🔧 Vehicle Manager
- Operations console: booking handover & return with timestamps
- Assigned fleet, service inbox, and issue inbox
- Update vehicle status with audit logs

### 🧑‍💼 User Manager
- KYC verification queue
- User directory & user account oversight
- Manager-level dashboard

### ⚙️ Platform
- **Real-time notifications** over Socket.IO (bookings, issues, KYC updates)
- Cron jobs for automated status transitions and cleanup
- Role-based route protection on the client and middleware guards on the API
- Zod request validation, CORS allow-listing, and a global error handler

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router 7, Axios, React Hot Toast, Lucide icons |
| **Backend** | Node.js, Express 4, TypeScript, Zod, Cookie-parser, CORS |
| **Database** | PostgreSQL (Neon serverless-ready) + Prisma ORM |
| **Auth** | JWT (httpOnly cookies), Argon2/Bcrypt hashing, OTP email flows |
| **Payments** | Razorpay (orders, signature & webhook verification, refunds) |
| **Media** | Cloudinary (KYC & vehicle image uploads, Multer) |
| **Realtime** | Socket.IO + socket.io-client |
| **Email** | Nodemailer (OTP, password reset, issue notifications) |
| **Jobs** | node-cron |
| **DevOps** | Docker, Docker Compose, Vercel (frontend hosting) |

---

## Architecture

```text
┌──────────────────────────┐        REST / HTTPS        ┌───────────────────────────────┐
│  vehicle-rental-frontend │  ───────────────────────▶  │   vehicle-rental-backend      │
│  React + Vite (Vercel)   │  ◀───────────────────────  │   Express + TS + Socket.IO    │
└──────────────────────────┘      Socket.IO (ws)        └───────────────┬───────────────┘
                                                                        │ Prisma
                                          ┌──────────────┬──────────────┼──────────────┐
                                          ▼              ▼              ▼              ▼
                                     PostgreSQL      Cloudinary     Razorpay       Nodemailer
                                      (Neon)         (images)      (payments)      (email/OTP)
```

---

## Roles & Access

| Role | Route Prefix | Capabilities |
| --- | --- | --- |
| `USER` | `/UserDashboard`, `/checkout/:id`, `/history`, `/kyc` | Book, pay, rate, manage own KYC |
| `USER_MANAGER` | `/user-manager/*` | KYC queue, user directory, user oversight |
| `VEHICLE_MANAGER` | `/manager/*` | Operations, fleet, maintenance & issue inboxes |
| `ADMIN` | `/admin/*` | Everything: fleet, users, staff, KYC, revenue, issues |

Access is enforced twice: `<ProtectedRoute allowedRoles={[...]} />` on the client and JWT role middleware on the server.

---

## Project Structure

```text
Vehicle_Rental_Sytem/
├── vehicle-rental-frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── api/                      # Axios clients
│   │   ├── components/               # Navbar, Sidebar, Modals, Protected/Public routes
│   │   ├── context/                  # AuthContext, SocketContext
│   │   └── pages/                    # Home, Marketplace, Checkout, dashboards...
│   │       ├── manager/              # Vehicle manager views
│   │       └── userManager/          # User manager views
│   ├── tailwind.config.js
│   └── vercel.json
│
├── vehicle-rental-backend/           # Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma             # Data model & enums
│   │   └── migrations/
│   ├── src/
│   │   ├── config/                   # db, cloudinary, cron
│   │   ├── controllers/              # auth, booking, payment, kyc, admin...
│   │   ├── middleware/               # auth (JWT), kyc, upload (multer)
│   │   ├── routes/                   # route definitions per module
│   │   ├── schemas/                  # Zod validation
│   │   ├── utils/                    # jwt, email, socket, vehicleStatusLogger
│   │   └── server.ts                 # app bootstrap
│   └── Dockerfile
│
├── docker-compose.yml                # One-command full-stack run
├── TODO.md
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (20 LTS recommended)
- **npm** ≥ 9
- **PostgreSQL** ≥ 14 (local instance or a free [Neon](https://neon.tech) database)
- **Docker** & **Docker Compose** *(optional, for containerized setup)*

You'll also want free accounts for:
- [Razorpay](https://dashboard.razorpay.com/) — payments
- [Cloudinary](https://cloudinary.com/) — image storage
- A Gmail **App Password** (or any SMTP credential) — emails/OTP

### Environment Variables

**`vehicle-rental-backend/.env`**

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:5432/vehicle_rental
JWT_SECRET=change-me-to-a-long-random-string
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Email (OTP + notifications)
EMAIL_USER=you@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

**`vehicle-rental-frontend/.env`**

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/pardhu-423141/Vehicle_Rental_Sytem.git
cd Vehicle_Rental_Sytem

# 2. Install backend dependencies
cd vehicle-rental-backend
npm install

# 3. Create the database schema
npx prisma migrate dev        # or: npx prisma db seed (if a seed exists)
npx prisma generate

# 4. Start the API (http://localhost:5000)
npm run dev

# 5. In a new terminal — install & start the frontend
cd ../vehicle-rental-frontend
npm install
npm run dev                   # http://localhost:5173
```

Visit **http://localhost:5173** and register an account. Health check: `GET http://localhost:5000/api/health`.

### Docker Setup

```bash
# From the repository root — both services start together
docker compose up --build
```

| Service | Port |
| --- | --- |
| Backend | `http://localhost:5000` |
| Frontend | `http://localhost:5173` |

---

## Database & Migrations

The schema lives in [`vehicle-rental-backend/prisma/schema.prisma`](./vehicle-rental-backend/prisma/schema.prisma) and includes:

`User` · `Vehicle` · `Booking` · `Payment` · `Review` · `KYCData` · `MaintenanceTask` · `Issue` · `VehicleStatusLog` · `UserCoupon`

```bash
cd vehicle-rental-backend

npx prisma migrate dev --name <change>   # create + apply a migration
npx prisma studio                        # inspect data at http://localhost:5555
npx prisma generate                      # regenerate the client
```

---

## API Reference

All endpoints are prefixed with `/api`.

| Module | Base Path | Highlights |
| --- | --- | --- |
| Health | `GET /api/health` | Liveness probe |
| Auth | `/api/auth` | register, verify-OTP, login, logout, forgot/reset password |
| Vehicles | `/api/vehicles` | list, filters, details, CRUD (admin/manager) |
| Bookings | `/api/bookings` | create, list, cancel, handover, return |
| Payments | `/api/payments` | Razorpay create-order, verify, webhook, refunds |
| Reviews | `/api/reviews` | rate & review a completed booking |
| KYC | `/api/kyc` | submit documents, status, admin approval |
| Admin | `/api/admin` | dashboard stats, users, fleet, revenue |
| Staff | `/api/admin/staff` | create & manage managers |
| User Manager | `/api/user-manager` | KYC queue, user directory |
| Operations | `/api/operations` | handover/return operations |
| Issues | `/api/issues` | report, assign, acknowledge, resolve |
| Coupons | `/api/coupons` | apply welcome/milestone coupons |
| User | `/api/user` | profile, ride history |

> **Auth:** protected routes expect the JWT access cookie set at login. Role-specific routes additionally verify `USER`, `USER_MANAGER`, `VEHICLE_MANAGER`, or `ADMIN`.

---

## Deployment

### Frontend → Vercel
1. Import the repo and set the **Root Directory** to `vehicle-rental-frontend`.
2. Build command `npm run build`, output `dist`.
3. Add env vars `VITE_API_URL` and `VITE_SOCKET_URL` pointing at your backend URL.

### Backend → Any Node host (Render / Railway / Fly.io / VPS)
1. Root directory `vehicle-rental-backend`.
2. Build: `npm run build` · Start: `npm start`.
3. Set every backend env var from [Environment Variables](#environment-variables).
4. Point `CORS_ORIGIN` / `FRONTEND_URL` at your Vercel domain and configure the Razorpay webhook to `POST /api/payments/razorpay/webhook`.

### Database → Neon / any PostgreSQL
Create a database, paste its connection string into `DATABASE_URL`, then run `npx prisma migrate deploy`.

---

## Roadmap

See [`TODO.md`](./TODO.md) for active work items:

- [ ] Harden Razorpay checkout against cross-origin frame security errors
- [ ] Fix payment API authorization (401/403/400) and webhook ownership checks
- [ ] Improve Socket.IO reconnection & CORS consistency
- [ ] Add automated tests and CI smoke checks

**Ideas for later:** refresh tokens, fleet availability calendar, map-based pick-up locations, mobile app, Dockerized CI/CD pipeline.

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/amazing-feature`
3. Commit your changes — `git commit -m "Add amazing feature"`
4. Push to the branch — `git push origin feature/amazing-feature`
5. Open a Pull Request

Please keep PRs focused and update documentation when behaviour changes.

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">

**Built with ❤️ · [Live Demo](https://vehicle-rental-sytem-1.vercel.app/) · [Report Bug](https://github.com/pardhu-423141/Vehicle_Rental_Sytem/issues)**

</div>
