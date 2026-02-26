# SDL Frontend – Backend Integration

## Overview
This document describes the frontend-backend integration, protected routes, and API usage.

## Protected Routes (Role-Based)

| Role | Routes |
|------|--------|
| **SUPER_ADMIN** | `/super`, `/HubList`, `/RegisterHubAdmin`, `/ApproveWishMaster`, `/Reports` |
| **HUB_ADMIN** | `/hub`, `/WishMasterList`, `/RegisterWishMaster` |
| **WISH_MASTER** | `/wish`, `/DailyEntry`, `/wish/submit`, `/MyEntry`, `/UniversalReports` |
| **Public** | `/login`, `/RegisterSuperAdmin` |

## API Endpoints (Backend at `http://localhost:8080/api`)

| Method | Endpoint | Role | Body/Params |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | `{ username, password }` → `{ token }` |
| POST | `/superadmin/create-hubadmin` | SUPER_ADMIN | FormData |
| GET | `/superadmin/hubadmins` | SUPER_ADMIN | - |
| GET | `/superadmin/wishmasters/pending` | SUPER_ADMIN | - |
| PUT | `/superadmin/wishmasters/:id/approve` | SUPER_ADMIN | `{ approvedBy }` |
| PUT | `/superadmin/wishmasters/:id/reject` | SUPER_ADMIN | - |
| POST | `/hubadmin/create-wishmaster` | HUB_ADMIN | FormData |
| GET | `/hubadmin/wishmasters` | HUB_ADMIN | - |
| POST | `/wishmaster/daily-entry` | WISH_MASTER | FormData |
| GET | `/wishmaster/my-daily-entry` | WISH_MASTER | - |
| GET | `/wishmaster/daily-entry/:id/pdf` | WISH_MASTER | - |
| GET | `/reports?start=&end=` | SUPER_ADMIN | Query params |
| GET | `/reports/daily-entry/:type?startDate=&endDate=` | WISH_MASTER | `type`: pdf \| excel |

## Authentication
- **Login**: `POST /auth/login` with `username` and `password`
- **JWT**: Expected payload includes `role` (SUPER_ADMIN, HUB_ADMIN, WISH_MASTER)
- **Storage**: Token stored in `localStorage` under key `token`
- **Headers**: All authenticated requests use `Authorization: Bearer <token>`

## Running Tests
```bash
npm install
npm run test
```

Test files are in `src/test/`:
- `App.test.jsx` – Routing and Login page
- `authSlice.test.js` – Auth Redux slice
- `authService.test.js` – Login API
- `DateRangeFilter.test.jsx` – Date filter component
- `PrivateRoute.test.jsx` – Role-based access

## Backend Compatibility
- If your login endpoint expects `email` instead of `username`, update `src/services/authService.js`
- If reports use different query param names (e.g. `start`/`end`), update `src/services/reportService.js`
- For **FileCountLimitExceededException** or **403 Forbidden** on create-hubadmin, see **BACKEND_CONFIG.md**
