package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.requestdto.DeliveryPerformanceRequestDto;
import com.Shridigambara.wms.responsedto.DeliveryPerformanceResponseDto;
import com.Shridigambara.wms.security.UserPrincipal;
import com.Shridigambara.wms.service.DeliveryPerformanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class DeliveryPerformanceController {

    private final DeliveryPerformanceService service;

    @PostMapping("/entry")
    public ResponseEntity<DeliveryPerformanceResponseDto> createOrUpdateEntry(
            @Valid @RequestBody DeliveryPerformanceRequestDto request) {
        return ResponseEntity.ok(service.createOrUpdateEntry(request));
    }

    // Verification removed - entries are auto-approved now

    @GetMapping("/date-range")
    public ResponseEntity<List<DeliveryPerformanceResponseDto>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(service.getByDateRange(start, end));
    }

    @GetMapping("/wish-master/{wishMasterId}")
    public ResponseEntity<List<DeliveryPerformanceResponseDto>> getByWishMaster(
            @PathVariable Long wishMasterId) {
        return ResponseEntity.ok(service.getByWishMaster(wishMasterId));
    }

    @GetMapping("/download/{wishMasterId}")
    public ResponseEntity<Resource> downloadMonthlySheet(
            @PathVariable Long wishMasterId,
            @RequestParam int year,
            @RequestParam int month) {
        Resource resource = service.downloadMonthlySheet(wishMasterId, year, month);
        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"monthly-sheet-" + wishMasterId + "-" + year + "-" + month + ".xlsx\"")
                .body(resource);
    }

    @GetMapping("/my-entries")
    public ResponseEntity<List<DeliveryPerformanceResponseDto>> getMyEntries() {
        Long wishMasterId = getWishMasterIdFromContext();
        return ResponseEntity.ok(service.getByWishMaster(wishMasterId));
    }

    @DeleteMapping("/wish-master/{wishMasterId}/month")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_HUB_ADMIN')")
    public ResponseEntity<String> deleteByMonthForWishMaster(
            @PathVariable Long wishMasterId,
            @RequestParam int year,
            @RequestParam int month) {

        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            if ("HUB_ADMIN".equals(principal.getRole())) {
                Long hubAdminId = principal.getEntityId();
                if (!service.isWishMasterUnderHubAdmin(wishMasterId, hubAdminId)) {
                    return ResponseEntity.status(403).body("Unauthorized to delete data for this Wish Master");
                }
            }
        }

        service.deleteByMonth(wishMasterId, year, month);
        return ResponseEntity.ok("Deleted entries for " + year + "-" + String.format("%02d", month));
    }

    @DeleteMapping("/my-entries/month")
    public ResponseEntity<String> deleteMyEntriesByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        Long wishMasterId = getWishMasterIdFromContext();
        service.deleteByMonth(wishMasterId, year, month);
        return ResponseEntity.ok("Deleted entries for " + year + "-" + String.format("%02d", month));
    }

    private Long getWishMasterIdFromContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getEntityId();
        }
        throw new IllegalStateException("Authenticated user context required");
    }

    private Long getHubAdminIdFromContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            if ("HUB_ADMIN".equals(principal.getRole())) {
                return principal.getEntityId();
            }
        }
        throw new IllegalStateException("Hub Admin context required");
    }
}
