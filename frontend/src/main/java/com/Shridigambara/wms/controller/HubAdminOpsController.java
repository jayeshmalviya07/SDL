package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.entities.DeliveryPartner;
import com.Shridigambara.wms.entities.HubAdmin;
import com.Shridigambara.wms.exceptions.ResourceNotFoundException;
import com.Shridigambara.wms.repositories.DeliveryPartnerRepository;
import com.Shridigambara.wms.repositories.HubAdminRepository;
import com.Shridigambara.wms.requestdto.WishMasterRegistrationRequestDto;
import com.Shridigambara.wms.responsedto.DeliveryPartnerResponseDto;
import com.Shridigambara.wms.responsedto.HubAdminResponseDto;
import com.Shridigambara.wms.security.UserPrincipal;
import com.Shridigambara.wms.service.DeliveryPartnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hubadmin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_HUB_ADMIN')")
public class HubAdminOpsController {

    private final HubAdminRepository hubAdminRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryPartnerService deliveryPartnerService;

    /**
     * Get the logged-in hub admin's own profile (including hub info)
     */
    @GetMapping("/profile")
    public ResponseEntity<HubAdminResponseDto> getProfile() {
        Long hubAdminId = getHubAdminIdFromContext();
        HubAdmin admin = hubAdminRepository.findById(hubAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Hub Admin not found"));
        return ResponseEntity.ok(HubAdminResponseDto.builder()
                .id(admin.getId())
                .name(admin.getName())
                .username(admin.getUsername())
                .email(admin.getEmail())
                .hubId(admin.getHub().getId())
                .hubName(admin.getHub().getName())
                .city(admin.getHub().getCity())
                .build());
    }

    /**
     * Get all wish masters registered under this hub admin
     */
    @GetMapping("/wishmasters")
    public ResponseEntity<List<DeliveryPartnerResponseDto>> getMyWishMasters() {
        Long hubAdminId = getHubAdminIdFromContext();
        return ResponseEntity.ok(deliveryPartnerService.getByHubAdminId(hubAdminId));
    }

    /**
     * Register a new wish master (hub admin flow)
     */
    @PostMapping("/create-wishmaster")
    public ResponseEntity<DeliveryPartnerResponseDto> createWishMaster(
            @RequestBody WishMasterRegistrationRequestDto request) {
        System.out.println(">>> CREATE WISHMASTER HIT <<<");
        System.out.println("employeeId: " + request.getEmployeeId());
        System.out.println("name: " + request.getName());
        System.out.println("phone: " + request.getPhone());
        System.out.println("password: " + (request.getPassword() != null ? "SET" : "NULL"));
        System.out.println("proposedRate: " + request.getProposedRate());
        System.out.println("vehicleNumber: " + request.getVehicleNumber());
        Long hubAdminId = getHubAdminIdFromContext();
        return ResponseEntity.ok(deliveryPartnerService.registerWishMaster(hubAdminId, request));
    }

    /**
     * Get a specific wish master's details (must belong to this hub admin)
     */
    @GetMapping("/wishmasters/{wmId}")
    public ResponseEntity<DeliveryPartnerResponseDto> getWishMaster(@PathVariable Long wmId) {
        Long hubAdminId = getHubAdminIdFromContext();
        DeliveryPartnerResponseDto partner = deliveryPartnerService.getById(wmId);
        // Verify the wish master belongs to this hub admin
        DeliveryPartner dp = deliveryPartnerRepository.findById(wmId)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));
        if (!dp.getHubAdmin().getId().equals(hubAdminId)) {
            throw new IllegalStateException("Access denied: Wish Master does not belong to your hub");
        }
        return ResponseEntity.ok(partner);
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
