package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.*;
import com.Shridigambara.wms.exceptions.BadRequestException;
import com.Shridigambara.wms.exceptions.ResourceNotFoundException;
import com.Shridigambara.wms.mapper.DeliverypartnerMapper;
import com.Shridigambara.wms.repositories.*;
import com.Shridigambara.wms.requestdto.WishMasterRegistrationRequestDto;
import com.Shridigambara.wms.responsedto.DeliveryPartnerResponseDto;
import com.Shridigambara.wms.responsedto.RegistrationRequestResponseDto;
import com.Shridigambara.wms.service.DeliveryPartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryPartnerServiceImpl implements DeliveryPartnerService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final HubAdminRepository hubAdminRepository;
    private final PasswordEncoder passwordEncoder;
    private final WishMasterDocumentRepository documentRepository;
    private final WishMasterRegistrationRequestRepository registrationRequestRepository;
    private final SuperAdminRepository superAdminRepository;

    @org.springframework.beans.factory.annotation.Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional
    public DeliveryPartnerResponseDto createBySuperAdmin(WishMasterRegistrationRequestDto request) {
        if (request.getHubAdminId() == null) {
            throw new BadRequestException("hubAdminId required for Super Admin");
        }
        // For Super Admin creation, we can still use the direct registration if we
        // want,
        // but let's stick to the request flow or make it auto-approved.
        // The user said "all details... super admin can see... before approval".
        // If super admin creates, maybe it's auto-approved?
        // Let's make it create a request and return it, OR just register directly if
        // that's desired.
        // Actually, the user's main concern is Hub Admin adding.
        return registerWishMaster(request.getHubAdminId(), request);
    }

    @Override
    @Transactional
    public DeliveryPartnerResponseDto registerWishMaster(Long hubAdminId, WishMasterRegistrationRequestDto request) {
        if (deliveryPartnerRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists in main database");
        }
        if (registrationRequestRepository.existsByEmployeeIdAndStatus(request.getEmployeeId(),
                ApprovalStatus.PENDING)) {
            throw new BadRequestException("A pending registration request already exists for this Employee ID");
        }

        HubAdmin hubAdmin = hubAdminRepository.findById(hubAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Hub Admin not found"));

        WishMasterRegistrationRequest registrationRequest = WishMasterRegistrationRequest.builder()
                .employeeId(request.getEmployeeId())
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .vehicleNumber(request.getVehicleNumber())
                .proposedRate(request.getProposedRate())
                .password(passwordEncoder.encode(request.getPassword()))
                .hubAdmin(hubAdmin)
                .documents(request.getDocuments())
                .status(ApprovalStatus.PENDING)
                .build();

        registrationRequest = registrationRequestRepository.save(registrationRequest);

        // Map to a response DTO that indicates it's pending.
        // We'll reuse DeliveryPartnerResponseDto but with a flag or status.
        return DeliveryPartnerResponseDto.builder()
                .employeeId(registrationRequest.getEmployeeId())
                .name(registrationRequest.getName())
                .approvalStatus(ApprovalStatus.PENDING)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationRequestResponseDto> getPendingRegistrationRequests() {
        return registrationRequestRepository.findByStatus(ApprovalStatus.PENDING)
                .stream()
                .map(this::mapToRegistrationDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RegistrationRequestResponseDto getRegistrationRequestById(Long id) {
        WishMasterRegistrationRequest request = registrationRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration request not found"));
        return mapToRegistrationDto(request);
    }

    @Override
    @Transactional
    public DeliveryPartnerResponseDto processRegistrationRequest(Long requestId, Long superAdminId, boolean approved,
            Double approvedRate) {
        WishMasterRegistrationRequest request = registrationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration request not found"));

        if (request.getStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Request is already processed");
        }

        SuperAdmin admin = superAdminRepository.findById(superAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found"));

        request.setStatus(approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED);
        request.setReviewedBy(admin);
        request.setReviewedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        registrationRequestRepository.save(request);

        if (approved) {
            // Create the actual DeliveryPartner
            DeliveryPartner partner = DeliveryPartner.builder()
                    .employeeId(request.getEmployeeId())
                    .name(request.getName())
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .vehicleNumber(request.getVehicleNumber())
                    .proposedRate(request.getProposedRate())
                    .approvedRate(approvedRate != null ? approvedRate : request.getProposedRate())
                    .password(request.getPassword()) // already encoded
                    .hubAdmin(request.getHubAdmin())
                    .approvalStatus(ApprovalStatus.APPROVED)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            partner = deliveryPartnerRepository.save(partner);

            // Save documents
            if (request.getDocuments() != null) {
                for (Map.Entry<String, String> entry : request.getDocuments().entrySet()) {
                    try {
                        DocumentType type = DocumentType.valueOf(entry.getKey());
                        WishMasterDocument doc = WishMasterDocument.builder()
                                .wishMaster(partner)
                                .documentType(type)
                                .fileUrl(entry.getValue())
                                .build();
                        documentRepository.save(doc);
                    } catch (IllegalArgumentException ignored) {
                    }
                }
            }
            return DeliverypartnerMapper.toResponse(partner);
        }

        return DeliveryPartnerResponseDto.builder().build(); // Return empty instead of null to avoid NPE in mapper
    }

    private RegistrationRequestResponseDto mapToRegistrationDto(WishMasterRegistrationRequest request) {
        return RegistrationRequestResponseDto.builder()
                .id(request.getId())
                .employeeId(request.getEmployeeId())
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .vehicleNumber(request.getVehicleNumber())
                .proposedRate(request.getProposedRate())
                .documents(request.getDocuments())
                .status(request.getStatus())
                .hubAdminId(request.getHubAdmin().getId())
                .hubName(request.getHubAdmin().getHub().getName())
                .hubCity(request.getHubAdmin().getHub().getCity())
                .createdAt(request.getCreatedAt())
                .build();
    }

    @Override
    public DeliveryPartnerResponseDto approveRegistration(Long wishMasterId, boolean approved) {
        // This was the old method, maybe we should keep it for backward compatibility
        // if needed,
        // but now it's mostly handled by processRegistrationRequest
        DeliveryPartner partner = deliveryPartnerRepository.findById(wishMasterId)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));
        partner.setApprovalStatus(approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED);
        partner.setUpdatedAt(LocalDateTime.now());
        return DeliverypartnerMapper.toResponse(deliveryPartnerRepository.save(partner));
    }

    @Override
    public DeliveryPartnerResponseDto getByEmployeeId(String employeeId) {
        DeliveryPartner partner = deliveryPartnerRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));
        return DeliverypartnerMapper.toResponse(partner);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryPartnerResponseDto getById(Long id) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));
        return DeliverypartnerMapper.toResponse(partner);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryPartnerResponseDto> getByHubAdminId(Long hubAdminId) {
        return deliveryPartnerRepository.findActiveByHubAdminId(hubAdminId)
                .stream()
                .filter(p -> ApprovalStatus.APPROVED.equals(p.getApprovalStatus()))
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryPartnerResponseDto> searchByHubAdminIdAndEmployeeId(Long hubAdminId, String employeeId) {
        return deliveryPartnerRepository.findByHubAdminIdAndEmployeeIdContainingIgnoreCase(hubAdminId, employeeId)
                .stream()
                .filter(p -> ApprovalStatus.APPROVED.equals(p.getApprovalStatus())
                        && (p.getIsActive() == null || p.getIsActive()))
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryPartnerResponseDto> getByHubId(Long hubId) {
        return deliveryPartnerRepository.findByHubAdmin_Hub_Id(hubId)
                .stream()
                .filter(p -> ApprovalStatus.APPROVED.equals(p.getApprovalStatus())
                        && (p.getIsActive() == null || p.getIsActive()))
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryPartnerResponseDto> getPendingRegistrations() {
        return deliveryPartnerRepository.findAll().stream()
                .filter(p -> p.getApprovalStatus() == ApprovalStatus.PENDING)
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryPartnerResponseDto> getAllPartners() {
        return deliveryPartnerRepository.findActive()
                .stream()
                .filter(p -> ApprovalStatus.APPROVED.equals(p.getApprovalStatus()))
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteWishMaster(Long id) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));
        partner.setIsActive(false);
        deliveryPartnerRepository.save(partner);
    }
}
