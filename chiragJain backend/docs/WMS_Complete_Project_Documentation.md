# Warehouse Management System (WMS) — Complete Project Documentation

**Version:** 1.0  
**Last Updated:** February 2025  
**Tech Stack:** React JS (Frontend) | Spring Boot (Backend) | SQL/MySQL (Database)

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Architecture Analysis](#3-architecture-analysis)
4. [Role Hierarchy & Permissions](#4-role-hierarchy--permissions)
5. [User Roles & Responsibilities](#5-user-roles--responsibilities)
6. [Registration & Onboarding Flow](#6-registration--onboarding-flow)
7. [Core Features & Workflows](#7-core-features--workflows)
8. [Data Model & Database Schema](#8-data-model--database-schema)
9. [API Requirements](#9-api-requirements)
10. [Report & Sheet Generation](#10-report--sheet-generation)
11. [Identified Gaps & Recommendations](#11-identified-gaps--recommendations)
12. [UI/UX Design Guidelines](#12-uiux-design-guidelines)

---

## 1. Executive Summary

This document describes a **Warehouse Management System** for delivery partner performance tracking. The system manages three roles—**Super Admin**, **Hub Admin**, and **Wish Master (Delivery Partner)**—and tracks daily parcel movements, approvals, and payments. The documentation consolidates requirements from functional specs and project discussions.

---

## 2. System Overview

### 2.1 Purpose
- Track delivery partners’ daily parcel intake, delivery, and returns at each hub
- Manage role-based access and approval workflows
- Generate downloadable reports for performance and payment

### 2.2 Tech Stack
| Layer      | Technology        | Version (Recommended) |
|------------|-------------------|------------------------|
| Frontend   | React JS          | 18+                    |
| Backend    | Spring Boot       | 3.x / 4.x              |
| Database   | MySQL / SQL       | 8.x                    |
| Build      | Maven             | 3.9+                   |

---

## 3. Architecture Analysis

### 3.1 Role Hierarchy (Correct Structure)
```
Super Admin (Root)
    │
    ├── Hub Admin (per Hub)
    │       │
    │       └── Wish Master (Delivery Partner)
    │
    └── Super Admin (can create more)
```

### 3.2 Observations

| Aspect | Status | Notes |
|--------|--------|-------|
| Role hierarchy | Correct | Super Admin → Hub Admin → Wish Master |
| Hub scoping | Required | Hub Admin sees only their hub's data |
| One entry per day | Correct | UNIQUE(wish_master_id, delivery_date) |
| Approval workflow | Required | Wish Master registration needs Super Admin approval |

### 3.3 Potential Architecture Issues

1. **First Super Admin creation**  
   - Spec: First Super Admin is created via backend/script.  
   - Recommendation: Use a DB seed or admin bootstrap API, not UI registration for the first Super Admin.

2. **Hub entity**  
   - Hub Admin is tied to a Hub (City, Area, Unique Hub ID).  
   - Ensure a Hub entity exists and Hub Admin has a foreign key to it.

3. **Document storage**  
   - Wish Master documents (Aadhaar, PAN, etc.) require file storage.  
   - Plan for: file storage (e.g. S3 or filesystem) + DB references.

4. **Sheet semantics**  
   - “Monthly sheet” and “daily entry” should be clearly defined.  
   - Clarify: monthly sheet = aggregation of verified daily entries for the month.

---

## 4. Role Hierarchy & Permissions

### 4.1 Permission Matrix

| Action | Super Admin | Hub Admin | Wish Master |
|--------|-------------|-----------|-------------|
| Create Super Admin | ✓ (after first) | ✗ | ✗ |
| Create Hub Admin | ✓ | ✗ | ✗ |
| Create Wish Master | ✓ (direct) | ✓ (under own hub) | ✗ |
| Approve Wish Master registration | ✓ | ✗ | ✗ |
| Approve Price/Rate | ✓ | ✗ | ✗ |
| Verify daily delivery entry | ✗ | ✓ | ✗ (submit only) |
| Add daily delivery entry | ✗ | ✗ | ✓ |
| View all hubs | ✓ | ✗ | ✗ |
| View own hub only | ✓ | ✓ | ✗ |
| View own entries only | ✓ | ✓ | ✓ |
| Download reports/sheets | ✓ | ✓ | ✓ |

---

## 5. User Roles & Responsibilities

### 5.1 Super Admin
- Create and manage other Super Admins (after first is seeded)
- Create Hub Admins (with City, Area, Unique Hub ID)
- Create Wish Masters directly under any Hub Admin
- Approve/reject Wish Master registrations initiated by Hub Admin
- Approve/reject price-per-parcel (rate) requests
- View and filter Hub Admins and Wish Masters
- Filter reports by city, area, hub ID, date range
- Download system-wide aggregated reports

### 5.2 Hub Admin
- Register Wish Masters under their hub (with documents and details)
- Edit Wish Master details (subject to Super Admin approval)
- Send price/rate approval requests to Super Admin
- Verify daily delivery entries (cannot edit; only verify or reject)
- View data only for Wish Masters in their hub
- Filter by single date, date range, or all records
- Download hub-level aggregated reports and sheets

### 5.3 Wish Master (Delivery Partner)
- Register only via Hub Admin (with documents)
- Add one daily delivery entry (end of day)
- Fields: Parcels Taken from Hub, Parcels Delivered, Parcels Failed, Parcels Returned
- Upload screenshot for verification
- Same-day re-entry overrides previous entry
- View only own entries
- Download own monthly sheet

---

## 6. Registration & Onboarding Flow

### 6.1 Super Admin
1. **First Super Admin:** Created via backend script/seed, not UI.
2. **Subsequent Super Admins:** Created by existing Super Admin.
3. Fields: Name, Email, Password (or equivalent credentials).

### 6.2 Hub Admin
1. Created by Super Admin.
2. Required: Hub details (City, Area, Unique Hub ID).
3. Credentials: Name, Email, Password.

### 6.3 Wish Master
1. Hub Admin initiates registration.
2. **Documents (upload):**
   - Aadhaar Card  
   - PAN Card  
   - Police Verification  
   - Agreement  
   - Photo  
   - Driving License  
   - Vehicle Number  

3. **Details:**
   - Name, Address, Phone Number  
   - Proposed rate per parcel  

4. Flow: Hub Admin submits → Super Admin approves/rejects → Wish Master is registered upon approval.

5. If Super Admin rejects, Hub Admin can update and resubmit.

---

## 7. Core Features & Workflows

### 7.1 Daily Delivery Entry (Wish Master)

**Rule:** One entry per day per Wish Master. Same-day re-entry overrides previous.

**Fields:**
| Field | Description |
|-------|-------------|
| Parcels Taken from Hub | Parcels received for delivery |
| Parcels Delivered | Successfully delivered |
| Parcels Failed | Failed deliveries |
| Parcels Returned (optional) | Parcels brought back to hub |
| Screenshot | Proof image for verification |

**Flow:**
1. Wish Master submits entry and clicks **Verify**.
2. Entry status: Pending verification.
3. Hub Admin reviews (read-only; no edits).
4. Hub Admin: Approve or Reject.
5. If rejected: Wish Master resubmits; latest request is used.

### 7.2 Price Approval Workflow
1. Hub Admin proposes rate (Rs per successful parcel).
2. Super Admin reviews.
3. Approved → Payment = Successful Deliveries × Approved Rate.
4. Rejected → Hub Admin can resubmit.

---

## 8. Data Model & Database Schema

### 8.1 Core Tables (Recommended)

```
super_admin
├── id (PK)
├── name
├── email (unique)
├── password (hashed)
├── is_active
└── created_at

hub
├── id (PK)
├── hub_id (unique)
├── city
├── area
├── name
└── is_active

hub_admin
├── id (PK)
├── hub_id (FK → hub)
├── name
├── email (unique)
├── password (hashed)
├── is_active
└── created_at

wish_master (delivery_partner)
├── id (PK)
├── hub_admin_id (FK → hub_admin)
├── emp_id (unique)
├── name
├── phone
├── address
├── proposed_rate
├── approved_rate
├── approval_status (PENDING/APPROVED/REJECTED)
├── vehicle_number
├── document_urls (JSON or separate document table)
└── created_at

delivery_entry (delivery_performance)
├── id (PK)
├── wish_master_id (FK)
├── delivery_date
├── parcels_taken
├── parcels_delivered
├── parcels_failed
├── parcels_returned
├── screenshot_url
├── verification_status (PENDING/APPROVED/REJECTED)
├── verified_by (hub_admin_id)
├── verified_at
├── calculated_amount
├── final_amount
└── UNIQUE(wish_master_id, delivery_date)

price_approval_request
├── id (PK)
├── wish_master_id (FK)
├── proposed_rate
├── requested_by (hub_admin_id)
├── status (PENDING/APPROVED/REJECTED)
├── reviewed_by (super_admin_id)
└── reviewed_at

wish_master_documents
├── id (PK)
├── wish_master_id (FK)
├── document_type (AADHAAR/PAN/POLICE_VERIFICATION/AGREEMENT/PHOTO/DRIVING_LICENSE)
├── file_url
└── uploaded_at
```

### 8.2 Business Constraints
- `UNIQUE(wish_master_id, delivery_date)` for delivery entries  
- Hub Admin can access only data for `hub_admin.hub_id`  
- Payment uses `approved_rate` only (not `proposed_rate`)

---

## 9. API Requirements

### 9.1 Authentication
- JWT-based or session-based auth
- Role in token/session for authorization

### 9.2 Suggested Endpoints (REST)

**Auth**
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`

**Super Admin**
- `GET/POST /api/super-admins`
- `GET/POST /api/hub-admins`
- `GET/POST /api/wish-masters` (direct create)
- `GET/PUT /api/wish-master-registrations/{id}/approve`
- `GET/PUT /api/price-approvals/{id}/approve`
- `GET /api/reports` (filters: city, area, hub, date range)

**Hub Admin**
- `GET/POST /api/hub-admins/{hubId}/wish-masters`
- `POST /api/price-approvals`
- `GET/PUT /api/delivery-entries/{id}/verify`
- `GET /api/reports/hub` (own hub)

**Wish Master**
- `POST /api/delivery-entries` (daily entry)
- `GET /api/delivery-entries/me`
- `GET /api/reports/me` (own sheet download)

**File Upload**
- `POST /api/upload/document`
- `POST /api/upload/screenshot`

---

## 10. Report & Sheet Generation

### 10.1 Report Types
| Report | Who Can Access | Content |
|--------|----------------|---------|
| Daily | Super Admin, Hub Admin | List of Wish Masters with daily totals and payment |
| Date Range | All roles (scoped) | Aggregated totals for selected range |
| Monthly Sheet | All roles (scoped) | Verified entries for the month; downloadable |

### 10.2 Download Format
- Excel (.xlsx) or CSV recommended for sheets
- PDF optional for formal reports

### 10.3 Data in Monthly Sheet
- Wish Master name, ID
- Date-wise: Parcels Taken, Delivered, Failed, Returned
- Calculated and final amount
- Verification status

---

## 11. Identified Gaps & Recommendations

| # | Gap | Recommendation |
|---|-----|----------------|
| 1 | Hub entity missing in current schema | Add `hub` table; link `hub_admin` and `wish_master` via hub |
| 2 | Document storage not defined | Implement file upload (e.g. S3/local) and reference URLs in DB |
| 3 | Screenshot for each entry | Add `screenshot_url` in `delivery_entry`; implement upload API |
| 4 | Verification workflow | Add `verification_status`, `verified_by`, `verified_at` to delivery entry |
| 5 | Hub Admin cannot edit entry | Enforce read-only UI and API for Hub Admin on entries |
| 6 | Monthly vs daily logic | Define monthly sheet as aggregate of verified daily entries for the month |

---

## 12. UI/UX Design Guidelines

### 12.1 Design Principles
- Role-based dashboards (no irrelevant actions for role)
- Clear hierarchy (breadcrumbs, nav)
- Responsive layout for tablet/desktop

### 12.2 Key Screens (Suggestion)
1. Login (role-aware redirect)
2. Super Admin: Dashboard, Manage Hub Admins, Manage Wish Masters, Approvals, Reports
3. Hub Admin: Dashboard, Manage Wish Masters, Verify Entries, Price Approval, Reports
4. Wish Master: Dashboard, Daily Entry Form, My Entries, Download Sheet

### 12.3 Consistency
- Same table/filter patterns across roles
- Unified error and success messaging
- Loading and empty states for lists and forms

---

## Appendix A: Glossary

| Term | Definition |
|------|-------------|
| Hub | A physical/logical warehouse location |
| Wish Master | Delivery partner who picks up parcels from hub and delivers |
| Parcels Taken | Parcels received from hub for delivery |
| Parcels Delivered | Successfully delivered parcels |
| Parcels Failed | Failed delivery attempts |
| Parcels Returned | Parcels brought back to hub |

---

## Appendix B: Document Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2025 | Initial documentation |

---

*End of Document*
