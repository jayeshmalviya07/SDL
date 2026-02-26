# WMS Backend API Reference

**Base URL:** `http://localhost:8080/api`

**Authentication:** Bearer JWT token in `Authorization` header.

---

## Authentication

### POST /api/auth/login
Login for all roles (Super Admin, Hub Admin, Wish Master).

**Request:**
```json
{
  "emailOrEmpId": "admin@wms.com",
  "password": "Admin@123"
}
```
- Super Admin & Hub Admin: use `email`
- Wish Master: use `employeeId`

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "SUPER_ADMIN",
  "entityId": 1,
  "name": "System Super Admin"
}
```

---

## Super Admin APIs

### POST /api/super-admins
Create a new Super Admin.

### GET /api/super-admins
List all Super Admins.

### POST /api/hubs
Create a Hub.

### POST /api/hub-admins
Create a Hub Admin (links to Hub by hubId).

### POST /api/delivery/create
Create Wish Master directly (requires `hubAdminId` in body).

### PUT /api/delivery/{id}/approve-registration?approved=true
Approve or reject Wish Master registration.

### GET /api/delivery/pending
Get pending Wish Master registrations.

### PUT /api/price-approvals/{id}/approve?approved=true&finalRate=10.5
Approve or reject price request (optional finalRate for Super Admin override).

---

## Hub Admin APIs

### POST /api/delivery/register
Register Wish Master under own hub (hubAdminId from JWT).

### GET /api/delivery/hub-admin/{hubAdminId}
List Wish Masters for a hub admin.

### POST /api/price-approvals?wishMasterId=1&proposedRate=10
Submit price approval request.

### PUT /api/performance/entry/{id}/verify?approved=true
Verify a daily delivery entry.

### GET /api/performance/pending
Get pending entries for verification.

---

## Wish Master APIs

### POST /api/performance/entry
Create or update daily delivery entry.

**Request:**
```json
{
  "employeeId": "WM001",
  "deliveryDate": "2025-02-21",
  "parcelsTaken": 50,
  "parcelsDelivered": 45,
  "parcelsFailed": 3,
  "parcelsReturned": 2,
  "screenshotUrl": "screenshots/abc123.png"
}
```

### GET /api/performance/employee/{employeeId}
Get own entries by employee ID.

### GET /api/performance/download/{wishMasterId}?year=2025&month=2
Download monthly sheet (Excel).

---

## File Upload

### POST /api/upload/document
Upload document (multipart/form-data, param: `file`).
Returns `{ "fileUrl": "documents/uuid.ext" }`.

### POST /api/upload/screenshot
Upload screenshot. Returns `{ "fileUrl": "screenshots/uuid.ext" }`.

---

## First Run

1. Start the application. First Super Admin is auto-created:
   - Email: `admin@wms.com`
   - Password: `Admin@123`
2. Login to get JWT.
3. Create Hub → Create Hub Admin → Register Wish Master → Approve.
