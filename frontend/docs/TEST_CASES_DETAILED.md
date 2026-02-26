# WMS Test Cases — Complete Documentation

This document explains every test case from basic to advanced, including purpose, preconditions, steps, expected results, and what each validates.

---

## How to Run Tests

1. **Start MySQL** and create database: `CREATE DATABASE logistics_db;`
2. **Start the app:** `mvn spring-boot:run`
3. **Run the test script:** `.\scripts\run-all-tests.ps1` (from project root)

Or test manually using Postman/curl with the examples below.

---

## BASIC FLOW — Core Happy Path

---

### **TEST 1: Super Admin Login**

| Field | Value |
|-------|-------|
| **Purpose** | Verify that the authentication system works and the first Super Admin is auto-created on startup. |
| **Precondition** | Application has started successfully. MySQL is running. No prior Super Admin exists (first run). |
| **What it validates** | Auth endpoint availability, JWT token generation, data seeder (CommandLineRunner), password verification. |

**Steps:**
```
POST /api/auth/login
Body: { "emailOrEmpId": "admin@wms.com", "password": "Admin@123" }
```

**Expected Result:**
- Status: 200 OK
- Response contains: `token`, `role: "SUPER_ADMIN"`, `entityId`, `name`

**Failure indicates:** Seed not run, wrong credentials, or auth config issue.

---

### **TEST 2: Create Hub**

| Field | Value |
|-------|-------|
| **Purpose** | Super Admin creates a physical/logical warehouse hub. |
| **Precondition** | Logged in as Super Admin (valid JWT in Authorization header). |
| **What it validates** | Hub entity creation, unique `hubId` constraint, Super Admin permissions. |

**Steps:**
```
POST /api/hubs
Headers: Authorization: Bearer <super_admin_token>
Body: {
  "hubId": "HUB001",
  "name": "Mumbai Central Hub",
  "city": "Mumbai",
  "area": "Central"
}
```

**Expected Result:**
- Status: 200 OK
- Response contains: `id`, `hubId`, `name`, `city`, `area`
- Database: New row in `hub` table

**Failure indicates:** Auth filter issue, validation error, or duplicate hubId.

---

### **TEST 3: Create Hub Admin**

| Field | Value |
|-------|-------|
| **Purpose** | Super Admin assigns a Hub Admin to manage a hub. |
| **Precondition** | Hub exists. Super Admin logged in. |
| **What it validates** | Hub Admin creation, Hub–HubAdmin relationship, password hashing (BCrypt). |

**Steps:**
```
POST /api/hub-admins
Headers: Authorization: Bearer <super_admin_token>
Body: {
  "name": "Raj Kumar",
  "email": "raj@hub.com",
  "password": "HubAdmin@123",
  "hubId": "HUB001"
}
```

**Expected Result:**
- Status: 200 OK
- Response contains: `id`, `name`, `email`, `hubId`, `hubName`
- Database: New row in `hub_admin` with hashed password

**Failure indicates:** Hub not found, duplicate email, or FK constraint.

---

### **TEST 4: Hub Admin Login**

| Field | Value |
|-------|-------|
| **Purpose** | Hub Admin can authenticate with their own credentials. |
| **Precondition** | Hub Admin was created in Test 3. |
| **What it validates** | Role-based login resolution (checks SuperAdmin, then HubAdmin, then WishMaster tables), JWT contains correct `role` and `entityId`. |

**Steps:**
```
POST /api/auth/login
Body: { "emailOrEmpId": "raj@hub.com", "password": "HubAdmin@123" }
```

**Expected Result:**
- Status: 200 OK
- Response: `role: "HUB_ADMIN"`, `entityId` = Hub Admin's id

**Failure indicates:** Wrong password, user not found, or auth service logic.

---

### **TEST 5: Register Wish Master (by Hub Admin)**

| Field | Value |
|-------|-------|
| **Purpose** | Hub Admin registers a delivery partner (Wish Master) under their hub. |
| **Precondition** | Logged in as Hub Admin. Hub Admin ID is derived from JWT. |
| **What it validates** | Wish Master registration flow, document storage references, `approvalStatus = PENDING`, hub linkage. |

**Steps:**
```
POST /api/delivery/register
Headers: Authorization: Bearer <hub_admin_token>
Body: {
  "employeeId": "WM001",
  "name": "Amit Singh",
  "phone": "9876543210",
  "address": "123 Main St",
  "vehicleNumber": "MH01AB1234",
  "proposedRate": 10.5,
  "password": "WishMaster@123",
  "documents": {
    "AADHAAR": "documents/test.pdf",
    "PAN": "documents/test.pdf"
  }
}
```

**Expected Result:**
- Status: 200 OK
- Response: `approvalStatus: "PENDING"`, `id` (Wish Master id)
- Database: `delivery_partner` row, `wish_master_document` rows

**Failure indicates:** Missing required fields, duplicate employeeId, or Hub Admin context missing.

---

### **TEST 6: Super Admin Approves Wish Master Registration**

| Field | Value |
|-------|-------|
| **Purpose** | Super Admin approves the pending Wish Master registration. |
| **Precondition** | Wish Master exists with `approvalStatus = PENDING`. Super Admin logged in. |
| **What it validates** | Approval workflow, status change to `APPROVED`, `approvedRate` set from `proposedRate`. |

**Steps:**
```
PUT /api/delivery/{wishMasterId}/approve-registration?approved=true
Headers: Authorization: Bearer <super_admin_token>
```

**Expected Result:**
- Status: 200 OK
- Response: `approvalStatus: "APPROVED"`
- Database: `approval_status`, `approved_rate` updated

**Failure indicates:** Wish Master already approved/rejected, or invalid id.

---

### **TEST 7: Hub Admin Submits Price Approval Request**

| Field | Value |
|-------|-------|
| **Purpose** | Hub Admin proposes a per-parcel rate for the Wish Master. |
| **Precondition** | Wish Master approved. Logged in as Hub Admin. |
| **What it validates** | Price approval request creation, Hub Admin can only request for their hub's Wish Masters. |

**Steps:**
```
POST /api/price-approvals?wishMasterId=1&proposedRate=10.5
Headers: Authorization: Bearer <hub_admin_token>
```

**Expected Result:**
- Status: 200 OK
- Response: `id`, `wishMasterId`, `proposedRate`, `status: "PENDING"`
- Database: New row in `price_approval_request`

**Failure indicates:** Wish Master from another hub, or invalid ids.

---

### **TEST 8: Super Admin Approves Price**

| Field | Value |
|-------|-------|
| **Purpose** | Super Admin approves the proposed rate; it becomes the effective rate for payment. |
| **Precondition** | Price approval request exists with `status = PENDING`. |
| **What it validates** | Price approval workflow, `approvedRate` updated on `delivery_partner`. |

**Steps:**
```
PUT /api/price-approvals/{requestId}/approve?approved=true&finalRate=10.5
Headers: Authorization: Bearer <super_admin_token>
```

**Expected Result:**
- Status: 200 OK
- Database: `delivery_partner.approved_rate = 10.5`, `price_approval_request.status = APPROVED`

**Failure indicates:** Request not pending, or invalid finalRate.

---

### **TEST 9: Wish Master Login**

| Field | Value |
|-------|-------|
| **Purpose** | Wish Master authenticates using `employeeId` (not email). |
| **Precondition** | Wish Master is APPROVED (otherwise login fails). |
| **What it validates** | Wish Master auth path, `employeeId` as identifier, approval gate. |

**Steps:**
```
POST /api/auth/login
Body: { "emailOrEmpId": "WM001", "password": "WishMaster@123" }
```

**Expected Result:**
- Status: 200 OK
- Response: `role: "WISH_MASTER"`, `entityId` = Wish Master's id

**Failure if:** Registration not approved, wrong password, or wrong employeeId.

---

### **TEST 10: Wish Master Adds Daily Entry**

| Field | Value |
|-------|-------|
| **Purpose** | Wish Master submits their end-of-day delivery entry. |
| **Precondition** | Wish Master logged in, has `approvedRate` for payment calculation. |
| **What it validates** | Delivery entry creation, UNIQUE(wish_master_id, delivery_date), amount calculation (parcels_delivered × approved_rate), `verificationStatus = PENDING`. |

**Steps:**
```
POST /api/performance/entry
Headers: Authorization: Bearer <wish_master_token>
Body: {
  "employeeId": "WM001",
  "deliveryDate": "2025-02-21",
  "parcelsTaken": 50,
  "parcelsDelivered": 45,
  "parcelsFailed": 3,
  "parcelsReturned": 2,
  "screenshotUrl": "screenshots/test.png"
}
```

**Expected Result:**
- Status: 200 OK
- Response: `verificationStatus: "PENDING"`, `calculatedAmount`, `finalAmount`
- Database: New row in `delivery_performance`

**Failure indicates:** Validation (e.g. parcels taken < delivered+failed+returned), Wish Master not found, or missing approved rate.

---

### **TEST 11: Same-Day Re-entry (Override)**

| Field | Value |
|-------|-------|
| **Purpose** | Wish Master can correct their entry for the same day; new submission overwrites the previous one. |
| **Precondition** | An entry already exists for that date. |
| **What it validates** | One entry per day rule, upsert/override logic, recalculation of amount. |

**Steps:**
```
POST /api/performance/entry
(Same as Test 10, with different parcel numbers for same date)
```

**Expected Result:**
- Status: 200 OK
- Same `id` as before (update), new parcel counts and amounts
- Database: Single row per (wish_master_id, delivery_date)

**Failure indicates:** Unique constraint or update logic issue.

---

### **TEST 12: Hub Admin Verifies Entry**

| Field | Value |
|-------|-------|
| **Purpose** | Hub Admin verifies the delivery entry (approve/reject only, no edits). |
| **Precondition** | Entry has `verificationStatus = PENDING`. Hub Admin belongs to the same hub as the Wish Master. |
| **What it validates** | Verification workflow, hub scoping (Hub Admin can only verify their hub's entries), `verified_by`, `verified_at`. |

**Steps:**
```
PUT /api/performance/entry/{entryId}/verify?approved=true
Headers: Authorization: Bearer <hub_admin_token>
```

**Expected Result:**
- Status: 200 OK
- Response: `verificationStatus: "APPROVED"`
- Database: `verified_by`, `verified_at` set

**Failure indicates:** Entry from another hub, or already verified.

---

### **TEST 13: Get Pending Verifications**

| Field | Value |
|-------|-------|
| **Purpose** | Hub Admin fetches list of entries awaiting verification. |
| **Precondition** | Logged in as Hub Admin. |
| **What it validates** | Hub-scoped query; only returns entries for Wish Masters in this Hub Admin's hub. |

**Steps:**
```
GET /api/performance/pending
Headers: Authorization: Bearer <hub_admin_token>
```

**Expected Result:**
- Status: 200 OK
- Array of entries with `verificationStatus: "PENDING"`
- After Test 12, this list should be empty for that hub

---

### **TEST 14: Download Monthly Sheet**

| Field | Value |
|-------|-------|
| **Purpose** | Download Excel sheet of verified delivery entries for a given month. |
| **Precondition** | At least one verified entry exists for the Wish Master in that month. |
| **What it validates** | Report generation, Apache POI Excel creation, file download, filtering by month and verification status. |

**Steps:**
```
GET /api/performance/download/{wishMasterId}?year=2025&month=2
Headers: Authorization: Bearer <any_valid_token>
```

**Expected Result:**
- Status: 200 OK
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- File downloadable with date, parcels, amount columns

**Failure indicates:** POI issue, no data, or invalid parameters.

---

## ADVANCED / EDGE CASE TESTS

---

### **TEST 15: Super Admin Creates Wish Master Directly**

| Field | Value |
|-------|-------|
| **Purpose** | Super Admin can create a Wish Master under any Hub Admin without going through Hub Admin registration. |
| **Precondition** | Super Admin logged in. Hub Admin exists. |
| **What it validates** | Super Admin override, `hubAdminId` in request body, bypass of Hub Admin flow. |

**Steps:**
```
POST /api/delivery/create
Headers: Authorization: Bearer <super_admin_token>
Body: {
  "hubAdminId": 1,
  "employeeId": "WM002",
  "name": "Direct Wish Master",
  "phone": "9999999999",
  "proposedRate": 12,
  "password": "Direct@123",
  "documents": {}
}
```

**Expected Result:**
- Status: 200 OK
- Wish Master created with `approvalStatus = PENDING` (still needs approval)

---

### **TEST 16: Duplicate Employee ID Rejected**

| Field | Value |
|-------|-------|
| **Purpose** | System rejects registration when `employeeId` already exists. |
| **Precondition** | Wish Master with employeeId "WM001" already exists. |
| **What it validates** | Unique constraint on `emp_id`, `BadRequestException` handling. |

**Steps:**
```
POST /api/delivery/register
Body: (same employeeId "WM001" as in Test 5)
```

**Expected Result:**
- Status: 400 Bad Request
- Error message indicating employee already exists

---

### **TEST 17: Invalid Login Rejected**

| Field | Value |
|-------|-------|
| **Purpose** | Wrong password returns error, no token. |
| **Precondition** | None. |
| **What it validates** | Auth security, no token on failure. |

**Steps:**
```
POST /api/auth/login
Body: { "emailOrEmpId": "admin@wms.com", "password": "WrongPassword" }
```

**Expected Result:**
- Status: 400 Bad Request
- No token in response

---

### **TEST 18: Unapproved Wish Master Cannot Login**

| Field | Value |
|-------|-------|
| **Purpose** | Wish Master with `approvalStatus = PENDING` or `REJECTED` cannot log in. |
| **Precondition** | Create a Wish Master but do not approve (skip Test 6). |
| **What it validates** | Approval gate in auth flow. |

**Steps:**
```
POST /api/auth/login
Body: { "emailOrEmpId": "WM_NEW", "password": "..." }
```

**Expected Result:**
- Status: 400 Bad Request
- Message like "Wish Master registration is not approved"

---

### **TEST 19: Missing Auth Token Rejected**

| Field | Value |
|-------|-------|
| **Purpose** | Protected endpoints require valid JWT. |
| **Precondition** | None. |
| **What it validates** | Spring Security, JwtAuthFilter. |

**Steps:**
```
GET /api/hubs
(No Authorization header)
```

**Expected Result:**
- Status: 401 Unauthorized

---

### **TEST 20: Invalid/Expired Token Rejected**

| Field | Value |
|-------|-------|
| **Purpose** | Expired or malformed JWT is rejected. |
| **Precondition** | None. |
| **What it validates** | JWT validation, expiration check. |

**Steps:**
```
GET /api/hubs
Headers: Authorization: Bearer invalid_or_expired_token
```

**Expected Result:**
- Status: 401 Unauthorized (or 403)

---

## Test Summary Matrix

| # | Test | Role | Endpoint | Type |
|---|------|------|----------|------|
| 1 | Super Admin Login | - | POST /auth/login | Basic |
| 2 | Create Hub | Super Admin | POST /hubs | Basic |
| 3 | Create Hub Admin | Super Admin | POST /hub-admins | Basic |
| 4 | Hub Admin Login | - | POST /auth/login | Basic |
| 5 | Register Wish Master | Hub Admin | POST /delivery/register | Basic |
| 6 | Approve Registration | Super Admin | PUT /delivery/{id}/approve-registration | Basic |
| 7 | Price Approval Request | Hub Admin | POST /price-approvals | Basic |
| 8 | Approve Price | Super Admin | PUT /price-approvals/{id}/approve | Basic |
| 9 | Wish Master Login | - | POST /auth/login | Basic |
| 10 | Daily Entry | Wish Master | POST /performance/entry | Basic |
| 11 | Same-Day Override | Wish Master | POST /performance/entry | Basic |
| 12 | Verify Entry | Hub Admin | PUT /performance/entry/{id}/verify | Basic |
| 13 | Pending Verifications | Hub Admin | GET /performance/pending | Basic |
| 14 | Download Sheet | Any | GET /performance/download/{id} | Basic |
| 15 | Direct Create WM | Super Admin | POST /delivery/create | Advanced |
| 16 | Duplicate Rejected | Hub Admin | POST /delivery/register | Edge |
| 17 | Invalid Login | - | POST /auth/login | Edge |
| 18 | Unapproved Login Blocked | - | POST /auth/login | Edge |
| 19 | No Token | - | GET /hubs | Edge |
| 20 | Invalid Token | - | GET /hubs | Edge |

---

*Use this document alongside the automated script for full coverage.*
