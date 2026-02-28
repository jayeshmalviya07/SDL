package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.requestdto.HubAdminRequestDto;
import com.Shridigambara.wms.requestdto.SuperAdminRequestDto;
import com.Shridigambara.wms.responsedto.HubAdminResponseDto;
import com.Shridigambara.wms.responsedto.RegistrationRequestResponseDto;
import com.Shridigambara.wms.responsedto.SuperAdminResponseDto;
import com.Shridigambara.wms.service.HubAdminService;
import com.Shridigambara.wms.service.SuperAdminService;
import com.Shridigambara.wms.service.DeliveryPartnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
public class SuperAdminController {

    private final SuperAdminService superAdminService;
    private final HubAdminService hubAdminService;
    private final DeliveryPartnerService deliveryPartnerService;

    @PostMapping(value = "/create-hubadmin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HubAdminResponseDto> create(
            @RequestPart("hubAdminData") HubAdminRequestDto request,
            @RequestPart(required = false) MultipartFile profilePhoto,
            @RequestPart(required = false) MultipartFile aadhar,
            @RequestPart(required = false) MultipartFile policeVerification,
            @RequestPart(required = false) MultipartFile agreement,
            @RequestPart(required = false) MultipartFile panCard) {
        return ResponseEntity.ok(
                hubAdminService.createHubAdmin(request));
    }

    @GetMapping
    public ResponseEntity<List<SuperAdminResponseDto>> getAll() {
        return ResponseEntity.ok(superAdminService.getAllSuperAdmins());
    }

    @GetMapping("/pending-registrations")
    public ResponseEntity<List<com.Shridigambara.wms.responsedto.RegistrationRequestResponseDto>> getPendingRegistrations() {
        return ResponseEntity.ok(deliveryPartnerService.getPendingRegistrationRequests());
    }

    @GetMapping("/pending-registrations/{id}")
    public ResponseEntity<com.Shridigambara.wms.responsedto.RegistrationRequestResponseDto> getRegistrationRequest(
            @PathVariable Long id) {
        return ResponseEntity.ok(deliveryPartnerService.getRegistrationRequestById(id));
    }

    @PostMapping("/pending-registrations/{id}/approve")
    public ResponseEntity<com.Shridigambara.wms.responsedto.DeliveryPartnerResponseDto> approveRegistration(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false) Double approvedRate) {
        Long superAdminId = getSuperAdminIdFromContext();
        return ResponseEntity
                .ok(deliveryPartnerService.processRegistrationRequest(id, superAdminId, approved, approvedRate));
    }

    @GetMapping("/inactive-employees")
    public ResponseEntity<List<com.Shridigambara.wms.responsedto.InactiveEmployeeResponseDto>> getInactiveEmployees() {
        return ResponseEntity.ok(superAdminService.getInactiveEmployees());
    }

    private Long getSuperAdminIdFromContext() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.Shridigambara.wms.security.UserPrincipal principal) {
            if ("SUPER_ADMIN".equals(principal.getRole())) {
                return principal.getEntityId();
            }
        }
        throw new IllegalStateException("Super Admin context required");
    }
}
