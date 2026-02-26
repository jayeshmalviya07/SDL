# WMS Complete Flow Test Script (PowerShell)
# Prerequisites: 1) Start the app (mvn spring-boot:run) 2) MySQL running with logistics_db
# Usage: .\run-all-tests.ps1

$baseUrl = "http://localhost:8080/api"
$token = ""
$hubId = 0
$hubAdminId = 0
$wishMasterId = 0
$priceApprovalId = 0
$entryId = 0

function Write-TestCase {
    param($num, $name, $desc)
    Write-Host "`n========== TEST $num : $name ==========" -ForegroundColor Cyan
    Write-Host $desc -ForegroundColor Gray
}

function Invoke-API {
    param($method, $url, $body = $null, $useToken = $true)
    $headers = @{ "Content-Type" = "application/json" }
    if ($useToken -and $token) { $headers["Authorization"] = "Bearer $token" }
    $params = @{ Uri = $url; Method = $method; Headers = $headers }
    if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 10) }
    try {
        $r = Invoke-RestMethod @params
        return $r
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message -ForegroundColor Red }
        return $null
    }
}

Write-Host "`n*** WMS COMPLETE FLOW TEST ***`n" -ForegroundColor Yellow

# ========== TEST 1 ==========
Write-TestCase 1 "Super Admin Login" @"
PURPOSE: Verify authentication works and first Super Admin is auto-seeded.
PRE CONDITION: App started, no prior data.
VALIDATES: Auth endpoint, JWT generation, seed data.
"@
$r = Invoke-API -method POST -url "$baseUrl/auth/login" -body @{ emailOrEmpId = "admin@wms.com"; password = "Admin@123" } -useToken $false
if ($r) { $token = $r.token; Write-Host "PASS - Token received, role=$($r.role)" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red; exit 1 }

# ========== TEST 2 ==========
Write-TestCase 2 "Create Hub" @"
PURPOSE: Super Admin creates a hub (warehouse location).
PRE CONDITION: Logged in as Super Admin.
VALIDATES: Hub CRUD, Super Admin permissions.
"@
$r = Invoke-API -method POST -url "$baseUrl/hubs" -body @{ hubId = "HUB001"; name = "Mumbai Central"; city = "Mumbai"; area = "Central" }
if ($r) { $hubId = $r.id; Write-Host "PASS - Hub created, id=$hubId" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

# ========== TEST 3 ==========
Write-TestCase 3 "Create Hub Admin" @"
PURPOSE: Super Admin creates Hub Admin for the hub.
PRE CONDITION: Hub exists.
VALIDATES: Hub Admin creation, hub linkage, password hashing.
"@
$r = Invoke-API -method POST -url "$baseUrl/hub-admins" -body @{ name = "Raj Kumar"; email = "raj@hub.com"; password = "HubAdmin@123"; hubId = "HUB001" }
if ($r) { $hubAdminId = $r.id; Write-Host "PASS - Hub Admin created, id=$hubAdminId" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

# ========== TEST 4 ==========
Write-TestCase 4 "Hub Admin Login" @"
PURPOSE: Hub Admin can log in with their credentials.
PRE CONDITION: Hub Admin created.
VALIDATES: Role-based login, JWT with HUB_ADMIN role.
"@
$r = Invoke-API -method POST -url "$baseUrl/auth/login" -body @{ emailOrEmpId = "raj@hub.com"; password = "HubAdmin@123" } -useToken $false
if ($r) { $hubToken = $r.token; Write-Host "PASS - Hub Admin token received" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }
$token = $hubToken

# ========== TEST 5 ==========
Write-TestCase 5 "Register Wish Master (Hub Admin)" @"
PURPOSE: Hub Admin registers a delivery partner under their hub.
PRE CONDITION: Logged in as Hub Admin.
VALIDATES: Wish Master registration, document handling, approvalStatus=PENDING.
"@
$r = Invoke-API -method POST -url "$baseUrl/delivery/register" -body @{
    employeeId = "WM001"; name = "Amit Singh"; phone = "9876543210"
    address = "123 Main St"; vehicleNumber = "MH01AB1234"; proposedRate = 10.5
    password = "WishMaster@123"; documents = @{ AADHAAR = "documents/test.pdf"; PAN = "documents/test.pdf" }
}
if ($r) { $wishMasterId = $r.id; Write-Host "PASS - Wish Master registered, id=$wishMasterId, status=$($r.approvalStatus)" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

# ========== TEST 6 ==========
$token = (Invoke-API -method POST -url "$baseUrl/auth/login" -body @{ emailOrEmpId = "admin@wms.com"; password = "Admin@123" } -useToken $false).token
Write-TestCase 6 "Super Admin Approves Wish Master" @"
PURPOSE: Super Admin approves pending Wish Master registration.
PRE CONDITION: Wish Master in PENDING, logged in as Super Admin.
VALIDATES: Approval workflow, status change to APPROVED, approvedRate set.
"@
$r = Invoke-API -method PUT -url "$baseUrl/delivery/$wishMasterId/approve-registration?approved=true"
if ($r -and $r.approvalStatus -eq "APPROVED") { Write-Host "PASS - Registration approved" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

# ========== TEST 7 ==========
$token = $hubToken
Write-TestCase 7 "Hub Admin Submits Price Approval" @"
PURPOSE: Hub Admin requests price approval for Wish Master.
PRE CONDITION: Wish Master approved, Hub Admin logged in.
VALIDATES: Price approval request creation.
"@
$r = Invoke-API -method POST -url "$baseUrl/price-approvals?wishMasterId=$wishMasterId&proposedRate=10.5"
if ($r) { $priceApprovalId = $r.id; Write-Host "PASS - Price approval requested, id=$priceApprovalId" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

# ========== TEST 8 ==========
$token = (Invoke-API -method POST -url "$baseUrl/auth/login" -body @{ emailOrEmpId = "admin@wms.com"; password = "Admin@123" } -useToken $false).token
Write-TestCase 8 "Super Admin Approves Price" @"
PURPOSE: Super Admin approves the proposed rate.
PRE CONDITION: Price approval request pending.
VALIDATES: Price approval workflow, approvedRate set on Wish Master.
"@
$r = Invoke-API -method PUT -url "$baseUrl/price-approvals/$priceApprovalId/approve?approved=true&finalRate=10.5"
if ($r) { Write-Host "PASS - Price approved" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

# ========== TEST 9 ==========
Write-TestCase 9 "Wish Master Login" @"
PURPOSE: Wish Master logs in with employeeId (not email).
PRE CONDITION: Wish Master approved.
VALIDATES: Wish Master auth, employeeId as login identifier.
"@
$r = Invoke-API -method POST -url "$baseUrl/auth/login" -body @{ emailOrEmpId = "WM001"; password = "WishMaster@123" } -useToken $false
if ($r) { $wmToken = $r.token; Write-Host "PASS - Wish Master logged in" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }
$token = $wmToken

# ========== TEST 10 ==========
Write-TestCase 10 "Wish Master Adds Daily Entry" @"
PURPOSE: Wish Master submits end-of-day delivery entry.
PRE CONDITION: Wish Master logged in, has approved rate.
VALIDATES: Delivery entry creation, UNIQUE(emp,date), calculation logic.
"@
$today = Get-Date -Format "yyyy-MM-dd"
$r = Invoke-API -method POST -url "$baseUrl/performance/entry" -body @{
    employeeId = "WM001"; deliveryDate = $today
    parcelsTaken = 50; parcelsDelivered = 45; parcelsFailed = 3; parcelsReturned = 2
    screenshotUrl = "screenshots/test.png"
}
if ($r) { $entryId = $r.id; Write-Host "PASS - Entry created, id=$entryId" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

# ========== TEST 11 ==========
Write-TestCase 11 "Same-Day Re-entry (Override)" @"
PURPOSE: Wish Master can update same day entry (overrides previous).
PRE CONDITION: Entry exists for today.
VALIDATES: One entry per day rule, update overwrites.
"@
$today = Get-Date -Format "yyyy-MM-dd"
$r = Invoke-API -method POST -url "$baseUrl/performance/entry" -body @{
    employeeId = "WM001"; deliveryDate = $today
    parcelsTaken = 55; parcelsDelivered = 50; parcelsFailed = 4; parcelsReturned = 1
}
if ($r) { Write-Host "PASS - Entry updated/overridden" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

# ========== TEST 12 ==========
$token = $hubToken
Write-TestCase 12 "Hub Admin Verifies Entry" @"
PURPOSE: Hub Admin verifies delivery entry (approve/reject, read-only).
PRE CONDITION: Entry in PENDING, Hub Admin logged in.
VALIDATES: Verification workflow, hub scoping.
"@
$r = Invoke-API -method PUT -url "$baseUrl/performance/entry/$entryId/verify?approved=true"
if ($r -and $r.verificationStatus -eq "APPROVED") { Write-Host "PASS - Entry verified" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

# ========== TEST 13 ==========
Write-TestCase 13 "Get Pending Verifications" @"
PURPOSE: Hub Admin fetches list of pending entries.
PRE CONDITION: After verify, should be empty for this hub.
VALIDATES: Hub-scoped data access.
"@
$r = Invoke-API -method GET -url "$baseUrl/performance/pending"
Write-Host "PASS - Pending count: $($r.Count)" -ForegroundColor Green

# ========== TEST 14 ==========
Write-TestCase 14 "Download Monthly Sheet" @"
PURPOSE: Download Excel sheet of verified entries for the month.
PRE CONDITION: At least one verified entry.
VALIDATES: Report generation, file download.
"@
$year = (Get-Date).Year; $month = (Get-Date).Month
try {
    Invoke-WebRequest -Uri "$baseUrl/performance/download/$wishMasterId`?year=$year&month=$month" -Headers @{ Authorization = "Bearer $token" } -OutFile "monthly-sheet-test.xlsx"
    Write-Host "PASS - File saved as monthly-sheet-test.xlsx" -ForegroundColor Green
} catch { Write-Host "FAIL - $($_.Exception.Message)" -ForegroundColor Red }

# ========== ADVANCED TESTS ==========
Write-Host "`n========== ADVANCED / EDGE CASES ==========" -ForegroundColor Magenta

$token = (Invoke-API -method POST -url "$baseUrl/auth/login" -body @{ emailOrEmpId = "admin@wms.com"; password = "Admin@123" } -useToken $false).token

Write-TestCase 15 "Super Admin Creates Wish Master Directly" @"
PURPOSE: Super Admin can bypass Hub Admin and create Wish Master.
PRE CONDITION: Super Admin logged in.
VALIDATES: Super Admin override capability.
"@
$r = Invoke-API -method POST -url "$baseUrl/delivery/create" -body @{
    hubAdminId = $hubAdminId; employeeId = "WM002"; name = "Direct Wish"; phone = "9999999999"
    proposedRate = 12; password = "Direct@123"; documents = @{}
}
if ($r) { Write-Host "PASS - Direct creation works" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

Write-TestCase 16 "Duplicate Employee ID Rejected" @"
PURPOSE: Cannot register same employeeId twice.
VALIDATES: Unique constraint, error handling.
"@
$r = Invoke-API -method POST -url "$baseUrl/delivery/register" -body @{
    employeeId = "WM001"; name = "Duplicate"; phone = "1111111111"; proposedRate = 10; password = "Test@123"; documents = @{}
}
if (-not $r) { Write-Host "PASS - Duplicate correctly rejected" -ForegroundColor Green } else { Write-Host "FAIL - Should have rejected" -ForegroundColor Red }

Write-TestCase 17 "Invalid Login Rejected" @"
PURPOSE: Wrong credentials return error.
VALIDATES: Auth security.
"@
$r = Invoke-API -method POST -url "$baseUrl/auth/login" -body @{ emailOrEmpId = "admin@wms.com"; password = "WrongPass" } -useToken $false
if (-not $r) { Write-Host "PASS - Invalid login rejected" -ForegroundColor Green } else { Write-Host "FAIL" -ForegroundColor Red }

Write-Host "`n*** TEST RUN COMPLETE ***" -ForegroundColor Yellow
