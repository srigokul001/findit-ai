# FindIt AI – Smart Lost & Found Matcher

> **Lost Something? Let's Find It.**  
> Smart matching. Faster recovery. Safer returns.

**FindIt AI** is a complete, full-stack web application designed for college campuses and community centers to reunite individuals with their lost belongings. By utilizing a multi-attribute weighted scoring matching engine, FindIt AI automatically cross-references lost-item reports with found-item reports and facilitates secure ownership verification without ever exposing private identifying details to the public.

---

## 🌟 Key Features

### 1. Smart Algorithmic Matching Engine
- **Weighted Multi-Factor Scoring (0–100%)**:
  - **Category Compatibility (25%)**: Evaluates exact category matches and related categories (e.g., Electronics & Accessories, Wallets & Bags).
  - **Item Name & Brand Similarity (25%)**: Tokenization, Jaccard token overlap, substring, and brand alias recognition (Apple, Sony, North Face, Fossil, etc.).
  - **Color & Description Matching (30%)**: Normalization of color palettes, synonyms (Navy/Blue, Silver/Gray), and description keyword extraction.
  - **Campus Location Proximity (10%)**: Exact landmark match and campus zone proximity (Academic Core, Student Life, Athletics, Residence).
  - **Timeline Proximity (10%)**: Temporal plausibility comparing lost date vs. found date.
- **Transparent Reasoning**: Every match card provides a detailed explanation of matching signals and differences.
- **Automated Trigger**: When any user posts a lost or found report, the matching engine runs automatically against active opposing reports.

### 2. End-to-End Privacy & Secure Claim Recovery
- **Confidential Verification Details**: Users provide private identifiers (e.g. screen lock codes, stickers, serial numbers, engraved initials) that are **never** shown publicly.
- **Role-Gated Review**: Only authorized campus administrators and the item finder can review verification details.
- **Formal Status Transitions**: `PENDING` &rarr; `APPROVED` &rarr; `COMPLETED` (or `REJECTED`). Marking a claim as completed marks the item as `RETURNED` and notifies both parties.

### 3. Student & Community Experience
- **Interactive Landing Page**: Hero search bar, quick report buttons, real-time campus statistics, 3-step workflow, live category explorer, and recent reports feed.
- **Reporting Forms**: Dynamic forms for Lost and Found items with category dropdowns, campus locations, specific seat/room landmarks, photo uploads, and custody locations.
- **Browse & Discovery**: Keyword search, filters by category, campus location, date, and report type (Lost vs. Found), with sorting and pagination.
- **Student Dashboard**: Overview of My Lost Items, My Found Items, Active Matches, Submitted Claims, and Notifications feed.

### 4. Administrative Governance Console
- **KPI Metrics**: Total users, lost reports, found reports, potential matches, pending claims, items returned, and campus recovery rate.
- **Claim Verification Queue**: Inspect private verification proof submitted by claimants, approve claims, or finalize handovers.
- **Report & User Management**: Flag suspicious or duplicate reports, delete inappropriate entries, and toggle administrator privileges.
- **Manual Engine Recalculation**: On-demand button to trigger full matching recalculation across all active reports.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js 19 with Vite 8
  - Tailwind CSS v4
  - React Router DOM v7
  - Lucide React (SaaS iconography)
  - Axios (REST client with interceptors)
  - Canvas Confetti (celebration effects)
- **Backend**:
  - Node.js & Express.js
  - MongoDB with Mongoose
  - Zero-config Embedded MongoDB fallback (`mongodb-memory-server`)
  - JWT Authentication (`jsonwebtoken`)
  - Password hashing with `bcryptjs`
  - Multer for local image uploads

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ and npm installed.

### 1. Installation
Clone or navigate to the project directory:
```bash
cd "c:\Users\SRI GOKUL\codes\lost&found"
```

Install server dependencies:
```bash
cd server
npm install
```

Install client dependencies:
```bash
cd ../client
npm install
```

### 2. Start Both Backend and Frontend
From the root project directory:
```bash
# Starts both the Express backend (port 5000) and Vite frontend (port 5173)
node start-dev.js
```
Alternatively, in separate terminals:
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Test Accounts

The database comes pre-seeded with realistic campus users, reports, scored matches, and sample claims:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Campus Admin** | `admin@campus.edu` | `admin123` | Full access to Admin Console, claim queue, and user governance |
| **Student 1** | `alex@campus.edu` | `student123` | Reported lost iPhone 14 Pro & Fossil Leather Wallet |
| **Student 2** | `sarah@campus.edu` | `student123` | Reported found iPhone 14 & lost North Face Backpack |
| **Student 3** | `marcus@campus.edu` | `student123` | Reported lost AirPods Pro 2 & found Fossil Wallet |
| **Student 4** | `priya@campus.edu` | `student123` | Reported found AirPods & lost Casio Calculator |

> **Pro Tip**: Use the **"Demo Accounts"** dropdown in the top navbar to instantly log in as any test user without typing credentials!

---

## 📡 API Reference Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create student or admin account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET /api/auth/me` - Fetch authenticated user profile
- `PUT /api/auth/me` - Update profile details

### Reports (`/api/reports`)
- `POST /api/reports/lost` - Create a lost item report (triggers smart matcher)
- `POST /api/reports/found` - Create a found item report (triggers smart matcher)
- `GET /api/reports` - Search and filter reports with pagination
- `GET /api/reports/:id` - Get report details (privacy-protected)
- `GET /api/reports/user/me` - Get current user's lost & found reports
- `PUT /api/reports/:id` - Update report (owner or admin)
- `DELETE /api/reports/:id` - Delete report (owner or admin)

### Matches (`/api/matches`)
- `GET /api/matches` - List scored matches with score and category filters
- `GET /api/matches/:id` - Get side-by-side comparison and scoring breakdown
- `PATCH /api/matches/:id/status` - Update match status (e.g., dismiss)
- `POST /api/matches/recalculate` - Admin trigger to recalculate all matches

### Claims (`/api/claims`)
- `POST /api/claims` - Submit private verification proof to claim an item
- `GET /api/claims/my` - View current user's claims and status
- `GET /api/claims` - View claims for review (admin or finder)
- `PATCH /api/claims/:id/review` - Approve, reject, or complete claim handover

### Administration (`/api/admin`)
- `GET /api/admin/stats` - Comprehensive system KPIs and breakdown analytics
- `GET /api/admin/users` - List registered users
- `PATCH /api/admin/users/:id/role` - Toggle student/admin role
- `PATCH /api/admin/reports/:id/suspicious` - Toggle suspicious report flag

---

## 🛡️ Security & Privacy Architecture

1. **Private Proof Redaction**: The field `identifyingDetails` is stripped from public API responses unless the requester is the item owner or an authorized administrator.
2. **Password Security**: Passwords are salted and hashed with `bcryptjs` and excluded from serialization (`toJSON`).
3. **JWT Authorization**: Route endpoints are protected via `Authorization: Bearer <token>` middleware.
4. **Resilient Embedded Storage**: Operates smoothly with local MongoDB, remote MongoDB Atlas, or automatically spins up an in-memory database instance for zero-friction local development.
