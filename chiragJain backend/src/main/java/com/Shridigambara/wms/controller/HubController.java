package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.requestdto.HubRequestDto;
import com.Shridigambara.wms.responsedto.HubResponseDto;
import com.Shridigambara.wms.service.HubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hubs")
@RequiredArgsConstructor
public class HubController {

    private final HubService hubService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<HubResponseDto> create(@Valid @RequestBody HubRequestDto request) {
        return ResponseEntity.ok(hubService.createHub(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HubResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hubService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<HubResponseDto>> getAll() {
        return ResponseEntity.ok(hubService.getAllHubs());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hubService.deleteHub(id);
        return ResponseEntity.noContent().build();
    }
}
