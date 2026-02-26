package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.responsedto.PriceApprovalResponseDto;
import com.Shridigambara.wms.security.UserPrincipal;
import com.Shridigambara.wms.service.PriceApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-approvals")
@RequiredArgsConstructor
public class PriceApprovalController {

    private final PriceApprovalService priceApprovalService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_HUB_ADMIN')")
    public ResponseEntity<PriceApprovalResponseDto> create(
            @RequestParam Long wishMasterId,
            @RequestParam Double proposedRate) {
        Long hubAdminId = getHubAdminIdFromContext();
        return ResponseEntity.ok(priceApprovalService.createRequest(hubAdminId, wishMasterId, proposedRate));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<PriceApprovalResponseDto> approve(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false) Double finalRate) {
        Long superAdminId = getSuperAdminIdFromContext();
        return ResponseEntity.ok(priceApprovalService.approve(id, superAdminId, approved, finalRate));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<PriceApprovalResponseDto>> getPending() {
        return ResponseEntity.ok(priceApprovalService.getPendingRequests());
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

    private Long getSuperAdminIdFromContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            if ("SUPER_ADMIN".equals(principal.getRole())) {
                return principal.getEntityId();
            }
        }
        throw new IllegalStateException("Super Admin context required");
    }
}
