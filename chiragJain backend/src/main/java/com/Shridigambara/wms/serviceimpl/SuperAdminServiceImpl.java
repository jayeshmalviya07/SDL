package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.SuperAdmin;
import com.Shridigambara.wms.exceptions.BadRequestException;
import com.Shridigambara.wms.repositories.DeliveryPartnerRepository;
import com.Shridigambara.wms.repositories.HubAdminRepository;
import com.Shridigambara.wms.repositories.SuperAdminRepository;
import com.Shridigambara.wms.requestdto.SuperAdminRequestDto;
import com.Shridigambara.wms.responsedto.InactiveEmployeeResponseDto;
import com.Shridigambara.wms.responsedto.SuperAdminResponseDto;
import com.Shridigambara.wms.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuperAdminServiceImpl implements SuperAdminService {

    private final SuperAdminRepository superAdminRepository;
    private final HubAdminRepository hubAdminRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public SuperAdminResponseDto createSuperAdmin(SuperAdminRequestDto request) {
        if (superAdminRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        SuperAdmin admin = SuperAdmin.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .build();
        admin = superAdminRepository.save(admin);
        return toDto(admin);
    }

    @Override
    public List<SuperAdminResponseDto> getAllSuperAdmins() {
        return superAdminRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<InactiveEmployeeResponseDto> getInactiveEmployees() {
        List<InactiveEmployeeResponseDto> inactiveList = new ArrayList<>();

        // Add Inactive Hub Admins
        hubAdminRepository.findByIsActive(false).forEach(admin -> {
            inactiveList.add(InactiveEmployeeResponseDto.builder()
                    .id(admin.getId())
                    .name(admin.getName())
                    .employeeId(admin.getUsername()) // Using username for Hub Admin
                    .role("HUB_ADMIN")
                    .hubName(admin.getHub() != null ? admin.getHub().getName() : "N/A")
                    .city(admin.getHub() != null ? admin.getHub().getCity() : "N/A")
                    .build());
        });

        // Add Inactive Wish Masters
        deliveryPartnerRepository.findByIsActive(false).forEach(partner -> {
            inactiveList.add(InactiveEmployeeResponseDto.builder()
                    .id(partner.getId())
                    .name(partner.getName())
                    .employeeId(partner.getEmployeeId())
                    .role("WISH_MASTER")
                    .hubName(partner.getHubAdmin() != null && partner.getHubAdmin().getHub() != null
                            ? partner.getHubAdmin().getHub().getName()
                            : "N/A")
                    .city(partner.getHubAdmin() != null && partner.getHubAdmin().getHub() != null
                            ? partner.getHubAdmin().getHub().getCity()
                            : "N/A")
                    .build());
        });

        return inactiveList;
    }

    private SuperAdminResponseDto toDto(SuperAdmin admin) {
        return SuperAdminResponseDto.builder()
                .id(admin.getId())
                .name(admin.getName())
                .email(admin.getEmail())
                .build();
    }
}
