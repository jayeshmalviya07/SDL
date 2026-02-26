# WMS Testing Guide — Step-by-Step Flow

> **Comprehensive test documentation:** See `TEST_CASES_DETAILED.md` for full explanation of each test case.  
> **Automated script:** Run `.\scripts\run-all-tests.ps1` to execute all tests.

## Prerequisites

1. **Start MySQL** and ensure database exists:
   ```sql
   CREATE DATABASE IF NOT EXISTS logistics_db;
   ```

2. **Start the application:**
   ```bash
   mvn spring-boot:run
   ```

3. **Tool for API calls:** Use Postman, Insomnia, or curl (examples below use curl).

4. **Base URL:** `http://localhost:8080/api`

---

## Step 1: Login as Super Admin

The first Super Admin is auto-created on startup.

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrEmpId":"admin@wms.com","password":"Admin@123"}'
```

**Response:** Copy the `token` — you'll need it for all subsequent requests.

Example:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "SUPER_ADMIN",
  "entityId": 1,
  "name": "System Super Admin"
}
```

**Save the token** — use it as: `Authorization: Bearer <your-token>`

---

## Step 2: Create a Hub (Super Admin)

```bash
curl -X POST http://localhost:8080/api/hubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "hubId": "HUB001",
    "name": "Mumbai Central Hub",
    "city": "Mumbai",
    "area": "Central"
  }'
```

Note the `id` from the response (e.g., 1).

---

## Step 3: Create a Hub Admin (Super Admin)

```bash
curl -X POST http://localhost:8080/api/hub-admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Raj Kumar",
    "email": "raj@hub.com",
    "password": "HubAdmin@123",
    "hubId": "HUB001"
  }'
```

Save the Hub Admin `id` (e.g., 1).

---

## Step 4: Upload Documents (for Wish Master)

First, upload document files. You need at least one file — use any small image or PDF for testing.

```bash
curl -X POST http://localhost:8080/api/upload/document \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/test-file.pdf"
```

Response: `{"fileUrl":"documents/abc-123.pdf"}`

Repeat for each document type you want, or use the same URL for multiple. Save the returned `fileUrl` values.

---

## Step 5: Hub Admin Registers a Wish Master

**Login as Hub Admin first** to get a Hub Admin token:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrEmpId":"raj@hub.com","password":"HubAdmin@123"}'
```

Use this new token for the next request:

```bash
curl -X POST http://localhost:8080/api/delivery/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HUB_ADMIN_TOKEN_HERE" \
  -d '{
    "employeeId": "WM001",
    "name": "Amit Singh",
    "phone": "9876543210",
    "address": "123 Main St, Mumbai",
    "vehicleNumber": "MH01AB1234",
    "proposedRate": 10.5,
    "password": "WishMaster@123",
    "documents": {
      "AADHAAR": "documents/abc-123.pdf",
      "PAN": "documents/abc-123.pdf",
      "PHOTO": "documents/abc-123.pdf"
    }
  }'
```

Or, **Super Admin can create directly** (with hubAdminId):

```bash
curl -X POST http://localhost:8080/api/delivery/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN" \
  -d '{
    "hubAdminId": 1,
    "employeeId": "WM001",
    "name": "Amit Singh",
    "phone": "9876543210",
    "address": "123 Main St",
    "vehicleNumber": "MH01AB1234",
    "proposedRate": 10.5,
    "password": "WishMaster@123",
    "documents": {}
  }'
```

---

## Step 6: Super Admin Approves Wish Master Registration

```bash
curl -X PUT "http://localhost:8080/api/delivery/1/approve-registration?approved=true" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"
```

Replace `1` with the Wish Master's `id`.

---

## Step 7: Hub Admin Submits Price Approval Request

Login as Hub Admin, then:

```bash
curl -X POST "http://localhost:8080/api/price-approvals?wishMasterId=1&proposedRate=10.5" \
  -H "Authorization: Bearer HUB_ADMIN_TOKEN"
```

---

## Step 8: Super Admin Approves Price

```bash
curl -X PUT "http://localhost:8080/api/price-approvals/1/approve?approved=true&finalRate=10.5" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"
```

---

## Step 9: Wish Master Adds Daily Entry

**Login as Wish Master** (use employeeId, not email):

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrEmpId":"WM001","password":"WishMaster@123"}'
```

**Upload screenshot** (optional but recommended):

```bash
curl -X POST http://localhost:8080/api/upload/screenshot \
  -H "Authorization: Bearer WISH_MASTER_TOKEN" \
  -F "file=@/path/to/screenshot.png"
```

**Create daily entry:**

```bash
curl -X POST http://localhost:8080/api/performance/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WISH_MASTER_TOKEN" \
  -d '{
    "employeeId": "WM001",
    "deliveryDate": "2025-02-21",
    "parcelsTaken": 50,
    "parcelsDelivered": 45,
    "parcelsFailed": 3,
    "parcelsReturned": 2,
    "screenshotUrl": "screenshots/xyz.png"
  }'
```

---

## Step 10: Hub Admin Verifies Entry

Login as Hub Admin, then:

```bash
curl -X PUT "http://localhost:8080/api/performance/entry/1/verify?approved=true" \
  -H "Authorization: Bearer HUB_ADMIN_TOKEN"
```

Replace `1` with the delivery entry's `id`.

---

## Step 11: Download Monthly Sheet

Any logged-in user can download:

```bash
curl -X GET "http://localhost:8080/api/performance/download/1?year=2025&month=2" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output monthly-sheet.xlsx
```

Replace `1` with the Wish Master's `id`.

---

## Quick Reference: Token Flow

| Step | Role       | Action                    |
|------|------------|---------------------------|
| 1    | Super Admin| Login → get token         |
| 2-3  | Super Admin| Create Hub, Hub Admin     |
| 4    | Any        | Upload documents          |
| 5    | Hub Admin  | Register Wish Master     |
| 6    | Super Admin| Approve registration     |
| 7    | Hub Admin  | Request price approval    |
| 8    | Super Admin| Approve price             |
| 9    | Wish Master| Add daily entry           |
| 10   | Hub Admin  | Verify entry              |
| 11   | Any        | Download sheet            |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| 401 Unauthorized | Login again and use a fresh token |
| 403 Forbidden | Use the correct role's token for that endpoint |
| "Wish Master not found" | Ensure registration is approved (Step 6) |
| "Invalid credentials" | Verify email/employeeId and password |
| 500 / SQL errors | Check MySQL is running and `logistics_db` exists |
