package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.Hub;
import com.Shridigambara.wms.entities.HubAdmin;
import com.Shridigambara.wms.exceptions.BadRequestException;
import com.Shridigambara.wms.exceptions.ResourceNotFoundException;
import com.Shridigambara.wms.repositories.HubAdminRepository;
import com.Shridigambara.wms.repositories.HubRepository;
import com.Shridigambara.wms.requestdto.HubAdminRequestDto;
import com.Shridigambara.wms.responsedto.HubAdminResponseDto;
import com.Shridigambara.wms.service.HubAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HubAdminServiceImpl implements HubAdminService {

    private final HubAdminRepository hubAdminRepository;
    private final HubRepository hubRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public HubAdminResponseDto createHubAdmin(HubAdminRequestDto request) {
        if (hubAdminRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (hubAdminRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }

        // Fetch the associated Hub
        Hub hub = hubRepository.findByHubId(request.getHubId())
                .orElseThrow(() -> new ResourceNotFoundException("Hub not found with ID: " + request.getHubId()));

        // Ensure Hub is not already assigned
        if (!hubAdminRepository.findByHub_Id(hub.getId()).isEmpty()) {
            throw new BadRequestException("Hub " + request.getHubId() + " is already assigned to another Admin");
        }

        HubAdmin admin = HubAdmin.builder()
                .name(request.getName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .hub(hub)
                .build();
        admin = hubAdminRepository.save(admin);
        return toDto(admin);
    }

    @Override
    public HubAdminResponseDto getById(Long id) {
        HubAdmin admin = hubAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hub Admin not found"));
        return toDto(admin);
    }

    @Override
    public List<HubAdminResponseDto> getByHubId(Long hubId) {
        return hubAdminRepository.findByHub_Id(hubId)
                .stream()
                .filter(h -> h.getIsActive() == null || h.getIsActive())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<HubAdminResponseDto> getAllHubAdmins() {
        return hubAdminRepository.findActive().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void deleteHubAdmin(Long id) {
        HubAdmin admin = hubAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hub Admin not found"));
        admin.setIsActive(false);
        hubAdminRepository.save(admin);
    }

    private HubAdminResponseDto toDto(HubAdmin admin) {
        return HubAdminResponseDto.builder()
                .id(admin.getId())
                .name(admin.getName())
                .username(admin.getUsername())
                .email(admin.getEmail())
                .hubId(admin.getHub().getId())
                .hubName(admin.getHub().getName())
                .city(admin.getHub().getCity())
                .isActive(admin.getIsActive())
                .build();
    }
}
