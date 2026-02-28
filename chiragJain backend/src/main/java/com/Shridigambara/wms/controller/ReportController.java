package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.responsedto.*;
import com.Shridigambara.wms.security.UserPrincipal;
import com.Shridigambara.wms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // ========== SUPER ADMIN ENDPOINTS ==========

    @GetMapping("/super-admin/hubs")
    public ResponseEntity<List<HubResponseDto>> getAllHubs() {
        return ResponseEntity.ok(reportService.getAllHubs());
    }

    @GetMapping("/super-admin/hubs/city/{city}")
    public ResponseEntity<List<HubResponseDto>> getHubsByCity(@PathVariable String city) {
        return ResponseEntity.ok(reportService.getHubsByCity(city));
    }

    @GetMapping("/super-admin/hubs/city/{city}/area/{area}")
    public ResponseEntity<List<HubResponseDto>> getHubsByCityAndArea(
            @PathVariable String city, @PathVariable String area) {
        return ResponseEntity.ok(reportService.getHubsByCityAndArea(city, area));
    }

    @GetMapping("/super-admin/hubs/{hubId}/wish-masters")
    public ResponseEntity<List<WishMasterPerformanceSummaryDto>> getWishMastersByHub(
            @PathVariable Long hubId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getWishMastersByHub(hubId, startDate, endDate));
    }

    @GetMapping("/super-admin/wish-masters/{wishMasterId}/detailed")
    public ResponseEntity<PerformanceReportDto> getWishMasterDetailedReport(
            @PathVariable Long wishMasterId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getWishMasterDetailedReport(wishMasterId, startDate, endDate));
    }

    @GetMapping("/super-admin/wish-masters/search")
    public ResponseEntity<List<WishMasterPerformanceSummaryDto>> searchWishMasters(
            @RequestParam String employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.searchWishMasters(employeeId, startDate, endDate));
    }

    // ========== HUB ADMIN ENDPOINTS ==========

    @GetMapping("/hub-admin/wish-masters")
    public ResponseEntity<List<WishMasterPerformanceSummaryDto>> getHubWishMasters(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long hubAdminId = getHubAdminIdFromContext();
        return ResponseEntity.ok(reportService.getHubWishMasters(hubAdminId, startDate, endDate));
    }

    @GetMapping("/hub-admin/wish-masters/{wishMasterId}/detailed")
    public ResponseEntity<PerformanceReportDto> getHubWishMasterDetailedReport(
            @PathVariable Long wishMasterId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long hubAdminId = getHubAdminIdFromContext();
        return ResponseEntity
                .ok(reportService.getHubWishMasterDetailedReport(hubAdminId, wishMasterId, startDate, endDate));
    }

    @GetMapping("/hub-admin/wish-masters/search")
    public ResponseEntity<List<WishMasterPerformanceSummaryDto>> searchHubWishMasters(
            @RequestParam String employeeId) {
        Long hubAdminId = getHubAdminIdFromContext();
        return ResponseEntity.ok(reportService.searchHubWishMasters(hubAdminId, employeeId));
    }

    // ========== WISH MASTER ENDPOINTS ==========

    @GetMapping("/wish-master/overall")
    public ResponseEntity<WishMasterPerformanceSummaryDto> getMyOverallPerformance() {
        Long wishMasterId = getWishMasterIdFromContext();
        return ResponseEntity.ok(reportService.getMyOverallPerformance(wishMasterId));
    }

    @GetMapping("/wish-master/detailed")
    public ResponseEntity<PerformanceReportDto> getMyDetailedReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long wishMasterId = getWishMasterIdFromContext();
        return ResponseEntity.ok(reportService.getMyDetailedReport(wishMasterId, startDate, endDate));
    }

    @GetMapping("/wish-master/day/{date}")
    public ResponseEntity<List<DailyPerformanceDto>> getMyDayPerformance(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long wishMasterId = getWishMasterIdFromContext();
        return ResponseEntity.ok(reportService.getMyDayPerformance(wishMasterId, date));
    }

    // ========== HELPER METHODS ==========

    private Long getHubAdminIdFromContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            if ("HUB_ADMIN".equals(principal.getRole())) {
                return principal.getEntityId();
            }
        }
        throw new IllegalStateException("Hub Admin context required");
    }

    private Long getWishMasterIdFromContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            if ("WISH_MASTER".equals(principal.getRole())) {
                return principal.getEntityId();
            }
        }
        throw new IllegalStateException("Wish Master context required");
    }
}
