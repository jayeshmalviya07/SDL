package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.*;
import com.Shridigambara.wms.exceptions.BadRequestException;
import com.Shridigambara.wms.repositories.*;
import com.Shridigambara.wms.requestdto.LoginRequestDto;
import com.Shridigambara.wms.responsedto.LoginResponseDto;
import com.Shridigambara.wms.security.JwtUtil;
import com.Shridigambara.wms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final SuperAdminRepository superAdminRepository;
    private final HubAdminRepository hubAdminRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final OtpTrackerRepository otpTrackerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponseDto login(LoginRequestDto request) {
        // Try Super Admin
        Optional<SuperAdmin> superAdmin = superAdminRepository.findByEmail(request.getEmailOrEmpId());
        if (superAdmin.isPresent()) {
            if (!passwordEncoder.matches(request.getPassword(), superAdmin.get().getPassword())) {
                throw new BadRequestException("Invalid credentials");
            }
            if (!superAdmin.get().getIsActive()) {
                throw new BadRequestException("Account is inactive");
            }
            String token = jwtUtil.generateToken(
                    superAdmin.get().getEmail(),
                    "SUPER_ADMIN",
                    superAdmin.get().getId(),
                    superAdmin.get().getName());
            return LoginResponseDto.builder()
                    .token(token)
                    .role("SUPER_ADMIN")
                    .entityId(superAdmin.get().getId())
                    .name(superAdmin.get().getName())
                    .build();
        }

        // Try Hub Admin (by username first, then email fallback)
        Optional<HubAdmin> hubAdmin = hubAdminRepository.findByUsername(request.getEmailOrEmpId());
        if (hubAdmin.isEmpty()) {
            hubAdmin = hubAdminRepository.findByEmail(request.getEmailOrEmpId());
        }
        if (hubAdmin.isPresent()) {
            if (!passwordEncoder.matches(request.getPassword(), hubAdmin.get().getPassword())) {
                throw new BadRequestException("Invalid credentials");
            }
            if (!hubAdmin.get().getIsActive()) {
                throw new BadRequestException("Account is inactive");
            }
            String token = jwtUtil.generateToken(
                    hubAdmin.get().getUsername(),
                    "HUB_ADMIN",
                    hubAdmin.get().getId(),
                    hubAdmin.get().getName());
            return LoginResponseDto.builder()
                    .token(token)
                    .role("HUB_ADMIN")
                    .entityId(hubAdmin.get().getId())
                    .name(hubAdmin.get().getName())
                    .build();
        }

        // Try Wish Master (by employeeId)
        Optional<DeliveryPartner> wishMaster = deliveryPartnerRepository.findByEmployeeId(request.getEmailOrEmpId());
        if (wishMaster.isPresent()) {
            if (!passwordEncoder.matches(request.getPassword(), wishMaster.get().getPassword())) {
                throw new BadRequestException("Invalid credentials");
            }
            if (wishMaster.get().getApprovalStatus() != ApprovalStatus.APPROVED) {
                throw new BadRequestException("Wish Master registration is not approved");
            }
            String token = jwtUtil.generateToken(
                    wishMaster.get().getEmployeeId(),
                    "WISH_MASTER",
                    wishMaster.get().getId(),
                    wishMaster.get().getName());
            return LoginResponseDto.builder()
                    .token(token)
                    .role("WISH_MASTER")
                    .entityId(wishMaster.get().getId())
                    .name(wishMaster.get().getName())
                    .build();
        }

        throw new BadRequestException("Invalid credentials");
    }

    @Override
    @Transactional
    public void generateOtp(com.Shridigambara.wms.requestdto.ForgotPasswordRequestDto request) {
        String identifier = request.getEmailOrEmpId();

        // Check if user exists first
        boolean exists = superAdminRepository.findByEmail(identifier).isPresent() ||
                hubAdminRepository.findByEmail(identifier).isPresent() ||
                hubAdminRepository.findByUsername(identifier).isPresent() ||
                deliveryPartnerRepository.findByEmployeeId(identifier).isPresent();

        if (!exists) {
            throw new BadRequestException("User not found with provided Email or Employee ID");
        }

        // Generate 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Delete old OTP if exists
        otpTrackerRepository.deleteByIdentifier(identifier);

        // Save new OTP
        OtpTracker tracker = OtpTracker.builder()
                .identifier(identifier)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .build();

        otpTrackerRepository.save(tracker);

        // Mock email sending: print to console
        System.out.println("=================================================");
        System.out.println("MOCK EMAIL OTP DELIVERED FOR: " + identifier);
        System.out.println("OTP CODE: " + otp);
        System.out.println("=================================================");
    }

    @Override
    @Transactional
    public void resetPassword(com.Shridigambara.wms.requestdto.ResetPasswordRequestDto request) {
        String identifier = request.getEmailOrEmpId();

        OtpTracker tracker = otpTrackerRepository.findByIdentifierAndOtp(identifier, request.getOtp())
                .orElseThrow(() -> new BadRequestException("Invalid OTP"));

        if (tracker.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        boolean passwordUpdated = false;

        // Update Super Admin
        Optional<SuperAdmin> superAdmin = superAdminRepository.findByEmail(identifier);
        if (superAdmin.isPresent()) {
            superAdmin.get().setPassword(encodedPassword);
            superAdminRepository.save(superAdmin.get());
            passwordUpdated = true;
        }

        // Update Hub Admin
        if (!passwordUpdated) {
            Optional<HubAdmin> hubAdmin = hubAdminRepository.findByUsername(identifier).isEmpty()
                    ? hubAdminRepository.findByEmail(identifier)
                    : hubAdminRepository.findByUsername(identifier);

            if (hubAdmin.isPresent()) {
                hubAdmin.get().setPassword(encodedPassword);
                hubAdminRepository.save(hubAdmin.get());
                passwordUpdated = true;
            }
        }

        // Update Wish Master
        if (!passwordUpdated) {
            Optional<DeliveryPartner> wishMaster = deliveryPartnerRepository.findByEmployeeId(identifier);
            if (wishMaster.isPresent()) {
                wishMaster.get().setPassword(encodedPassword);
                deliveryPartnerRepository.save(wishMaster.get());
                passwordUpdated = true;
            }
        }

        if (!passwordUpdated) {
            throw new BadRequestException("User not found to update password");
        }

        // Delete OTP after successful reset
        otpTrackerRepository.deleteByIdentifier(identifier);
    }
}
