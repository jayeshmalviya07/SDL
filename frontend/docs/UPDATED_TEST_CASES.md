# WMS Updated Test Cases — Complete Flow

**Changes Made:**
1. ✅ **Removed Hub Admin verification** - Wish Master entries are auto-approved
2. ✅ **Combined price approval with registration** - When Super Admin approves Wish Master, both registration AND price are approved together
3. ✅ **Added comprehensive reporting** - Super Admin, Hub Admin, and Wish Master can view detailed performance reports with filters

---

## Updated Basic Flow

### **TEST 1: Super Admin Login**
Same as before - login with `admin@wms.com` / `Admin@123`

### **TEST 2-3: Create Hub & Hub Admin**
Same as before

### **TEST 4: Hub Admin Registers Wish Master**
**Changed:** Registration includes `proposedRate` - this is the price that needs approval.

```json
POST /api/delivery/register
{
  "employeeId": "WM001",
  "name": "Amit Singh",
  "phone": "9876543210",
  "proposedRate": 10.5,
  "password": "WishMaster@123",
  ...
}
```   

### **TEST 5: Super Admin Approves Wish Master**
**Changed:** Approval now approves BOTH registration AND price together.

```json
PUT /api/delivery/{id}/approve-registration?approved=true
```

**Result:** 
- `approvalStatus` = APPROVED
- `approvedRate` = `proposedRate` (automatically set)

**Note:** Separate price approval flow (`/api/price-approvals`) is deprecated but still available for edge cases.

### **TEST 6: Wish Master Adds Daily Entry**
**Changed:** Entry is **auto-approved** immediately - no Hub Admin verification needed.

```json
POST /api/performance/entry
{
  "employeeId": "WM001",
  "deliveryDate": "2025-02-21",
  "parcelsTaken": 50,
  "parcelsDelivered": 45,
  "parcelsFailed": 3,
  "parcelsReturned": 2
}
```

**Result:** `verificationStatus` = APPROVED immediately

---

## NEW: Reporting Endpoints

### **SUPER ADMIN REPORTS**

#### **Get All Hubs**
```
GET /api/reports/super-admin/hubs
```
Returns list of all hubs.

#### **Filter Hubs by City** 
```
GET /api/reports/super-admin/hubs/city/{city}
```
Example: `/api/reports/super-admin/hubs/city/Mumbai`

#### **Filter Hubs by City & Area**
```
GET /api/reports/super-admin/hubs/city/{city}/area/{area}
```
Example: `/api/reports/super-admin/hubs/city/Mumbai/area/Central`

#### **Get Wish Masters Under a Hub**
```
GET /api/reports/super-admin/hubs/{hubId}/wish-masters
```
Returns aggregated performance summary for each Wish Master:
```json
[
  {
    "wishMasterId": 1,
    "employeeId": "WM001",
    "wishMasterName": "Amit Singh",
    "hubId": 1,
    "hubName": "Mumbai Central",
    "totalParcelsReceived": 500,
    "totalParcelsDelivered": 450,
    "totalParcelsFailed": 30,
    "totalParcelsReturned": 20,
    "totalAmount": 4725.0
  }
]
```

#### **Get Detailed Day-by-Day Report for Wish Master**
```
GET /api/reports/super-admin/wish-masters/{wishMasterId}/detailed?startDate=2025-02-01&endDate=2025-02-28
```
Returns:
```json
{
  "dailyPerformances": [
    {
      "date": "2025-02-01",
      "parcelsReceived": 50,
      "parcelsDelivered": 45,
      "parcelsFailed": 3,
      "parcelsReturned": 2,
      "amount": 472.5
    },
    ...
  ],
  "grandTotal": {
    "totalParcelsReceived": 500,
    "totalParcelsDelivered": 450,
    "totalParcelsFailed": 30,
    "totalParcelsReturned": 20,
    "totalAmount": 4725.0
  }
}
```

#### **Search Wish Master by Employee ID**
```
GET /api/reports/super-admin/wish-masters/search?employeeId=WM001
```

---

### **HUB ADMIN REPORTS**

#### **Get All Wish Masters in My Hub**
```
GET /api/reports/hub-admin/wish-masters
```
Returns aggregated summary (same format as Super Admin).

#### **Get Detailed Report for Wish Master**
```
GET /api/reports/hub-admin/wish-masters/{wishMasterId}/detailed?startDate=2025-02-01&endDate=2025-02-28
```
Same format as Super Admin detailed report.

#### **Search Wish Master by Employee ID**
```
GET /api/reports/hub-admin/wish-masters/search?employeeId=WM001
```

---

### **WISH MASTER SELF-SERVICE REPORTS**

#### **Get My Overall Performance**
```
GET /api/reports/wish-master/overall
```
Returns aggregated summary of all time performance.

#### **Get My Detailed Report (Date Range)**
```
GET /api/reports/wish-master/detailed?startDate=2025-02-01&endDate=2025-02-28
```
Returns day-by-day performance with grand total.

#### **Get Specific Day Performance**
```
GET /api/reports/wish-master/day/2025-02-21
```
Returns single day's performance.

---

## Complete Test Flow

1. **Super Admin Login** → Get token
2. **Create Hub** → Get hubId
3. **Create Hub Admin** → Get hubAdminId
4. **Hub Admin Login** → Get hubAdminToken
5. **Register Wish Master** (with proposedRate) → Get wishMasterId
6. **Super Admin Approves** → Registration + Price approved together
7. **Wish Master Login** → Get wishMasterToken
8. **Wish Master Adds Entry** → Auto-approved immediately
9. **Super Admin Views Hubs** → `/api/reports/super-admin/hubs`
10. **Super Admin Views Wish Masters by Hub** → `/api/reports/super-admin/hubs/{hubId}/wish-masters`
11. **Super Admin Views Detailed Report** → `/api/reports/super-admin/wish-masters/{wishMasterId}/detailed`
12. **Hub Admin Views Wish Masters** → `/api/reports/hub-admin/wish-masters`
13. **Hub Admin Views Detailed Report** → `/api/reports/hub-admin/wish-masters/{wishMasterId}/detailed`
14. **Wish Master Views Own Performance** → `/api/reports/wish-master/overall`

---

## Removed Endpoints

- ❌ `PUT /api/performance/entry/{id}/verify` - No longer needed (auto-approved)
- ❌ `GET /api/performance/pending` - No pending entries anymore
- ⚠️ `POST /api/price-approvals` - Deprecated (use registration approval instead)

---

## Key Changes Summary

| Feature | Before | After |
|---------|--------|-------|
| Entry Verification | Hub Admin must verify | Auto-approved |
| Price Approval | Separate flow | Combined with registration |
| Super Admin Reports | Basic | Comprehensive with filters |
| Hub Admin Reports | Basic | Comprehensive (hub-scoped) |
| Wish Master Reports | None | Self-service available |

---

*All endpoints require authentication. Use Bearer token in Authorization header.*
