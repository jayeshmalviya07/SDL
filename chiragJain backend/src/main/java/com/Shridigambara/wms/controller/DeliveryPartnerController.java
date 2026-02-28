package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.requestdto.WishMasterRegistrationRequestDto;
import com.Shridigambara.wms.responsedto.DeliveryPartnerResponseDto;
import com.Shridigambara.wms.security.UserPrincipal;
import com.Shridigambara.wms.service.DeliveryPartnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
public class DeliveryPartnerController {

    private final DeliveryPartnerService service;

    @PostMapping("/register")
    @PreAuthorize("hasAuthority('ROLE_HUB_ADMIN')")
    public ResponseEntity<DeliveryPartnerResponseDto> registerWishMaster(
            @Valid @RequestBody WishMasterRegistrationRequestDto request) {
        Long hubAdminId = request.getHubAdminId() != null ? request.getHubAdminId() : getHubAdminIdFromContext();
        return ResponseEntity.ok(service.registerWishMaster(hubAdminId, request));
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<DeliveryPartnerResponseDto> createBySuperAdmin(
            @Valid @RequestBody WishMasterRegistrationRequestDto request) {
        return ResponseEntity.ok(service.createBySuperAdmin(request));
    }

    @PutMapping("/{id}/approve-registration")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<DeliveryPartnerResponseDto> approveRegistration(
            @PathVariable Long id,
            @RequestParam boolean approved) {
        return ResponseEntity.ok(service.approveRegistration(id, approved));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<DeliveryPartnerResponseDto> getByEmployeeId(
            @PathVariable String employeeId) {
        return ResponseEntity.ok(service.getByEmployeeId(employeeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryPartnerResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/hub-admin/{hubAdminId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_HUB_ADMIN')")
    public ResponseEntity<List<DeliveryPartnerResponseDto>> getByHubAdmin(
            @PathVariable Long hubAdminId) {
        return ResponseEntity.ok(service.getByHubAdminId(hubAdminId));
    }

    @GetMapping("/hub/{hubId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_HUB_ADMIN')")
    public ResponseEntity<List<DeliveryPartnerResponseDto>> getByHub(@PathVariable Long hubId) {
        return ResponseEntity.ok(service.getByHubId(hubId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<DeliveryPartnerResponseDto>> getPendingRegistrations() {
        return ResponseEntity.ok(service.getPendingRegistrations());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<DeliveryPartnerResponseDto>> getAll() {
        return ResponseEntity.ok(service.getAllPartners());
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasAuthority('ROLE_WISH_MASTER')")
    public ResponseEntity<DeliveryPartnerResponseDto> getMyProfile() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return ResponseEntity.ok(service.getById(principal.getEntityId()));
        }
        throw new IllegalStateException("Wish Master context required");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_HUB_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteWishMaster(id);
        return ResponseEntity.noContent().build();
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
