package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.requestdto.HubAdminRequestDto;
import com.Shridigambara.wms.responsedto.HubAdminResponseDto;
import com.Shridigambara.wms.service.HubAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hub-admins")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
public class HubAdminController {

    private final HubAdminService hubAdminService;

    @PostMapping
    public ResponseEntity<HubAdminResponseDto> create(@Valid @RequestBody HubAdminRequestDto request) {
        return ResponseEntity.ok(hubAdminService.createHubAdmin(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HubAdminResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hubAdminService.getById(id));
    }

    @GetMapping("/hub/{hubId}")
    public ResponseEntity<List<HubAdminResponseDto>> getByHub(@PathVariable Long hubId) {
        return ResponseEntity.ok(hubAdminService.getByHubId(hubId));
    }

    @GetMapping
    public ResponseEntity<List<HubAdminResponseDto>> getAll() {
        return ResponseEntity.ok(hubAdminService.getAllHubAdmins());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hubAdminService.deleteHubAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
