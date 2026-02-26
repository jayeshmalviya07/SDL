package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.requestdto.HubAdminRequestDto;
import com.Shridigambara.wms.requestdto.SuperAdminRequestDto;
import com.Shridigambara.wms.responsedto.HubAdminResponseDto;
import com.Shridigambara.wms.responsedto.SuperAdminResponseDto;
import com.Shridigambara.wms.service.HubAdminService;
import com.Shridigambara.wms.service.SuperAdminService;
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

    @PostMapping(value = "/create-hubadmin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HubAdminResponseDto> create(
            @RequestPart("hubAdminData") HubAdminRequestDto request,
            @RequestPart(required = false) MultipartFile profilePhoto,
            @RequestPart(required = false) MultipartFile aadhar,
            @RequestPart(required = false) MultipartFile policeVerification,
            @RequestPart(required = false) MultipartFile agreement,
            @RequestPart(required = false) MultipartFile panCard) {
        System.out.println(">>> CONTROLLER HIT <<<");
        System.out.println("EMAIL: " + request.getEmail());
        System.out.println("USERNAME: " + request.getUsername());

        return ResponseEntity.ok(
                hubAdminService.createHubAdmin(request));
    }

    @GetMapping
    public ResponseEntity<List<SuperAdminResponseDto>> getAll() {
        return ResponseEntity.ok(superAdminService.getAllSuperAdmins());
    }
}
