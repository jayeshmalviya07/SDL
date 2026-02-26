package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.SuperAdmin;
import com.Shridigambara.wms.exceptions.BadRequestException;
import com.Shridigambara.wms.repositories.SuperAdminRepository;
import com.Shridigambara.wms.requestdto.SuperAdminRequestDto;
import com.Shridigambara.wms.responsedto.SuperAdminResponseDto;
import com.Shridigambara.wms.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuperAdminServiceImpl implements SuperAdminService {

    private final SuperAdminRepository superAdminRepository;
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

    private SuperAdminResponseDto toDto(SuperAdmin admin) {
        return SuperAdminResponseDto.builder()
                .id(admin.getId())
                .name(admin.getName())
                .email(admin.getEmail())
                .build();
    }
}
