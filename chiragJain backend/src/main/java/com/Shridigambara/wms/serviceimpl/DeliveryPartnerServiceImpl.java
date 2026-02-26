package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.*;
import com.Shridigambara.wms.exceptions.BadRequestException;
import com.Shridigambara.wms.exceptions.ResourceNotFoundException;
import com.Shridigambara.wms.mapper.DeliverypartnerMapper;
import com.Shridigambara.wms.repositories.*;
import com.Shridigambara.wms.requestdto.WishMasterRegistrationRequestDto;
import com.Shridigambara.wms.responsedto.DeliveryPartnerResponseDto;
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

    @org.springframework.beans.factory.annotation.Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional
    public DeliveryPartnerResponseDto createBySuperAdmin(WishMasterRegistrationRequestDto request) {
        if (request.getHubAdminId() == null) {
            throw new BadRequestException("hubAdminId required for Super Admin");
        }
        return registerWishMaster(request.getHubAdminId(), request);
    }

    @Override
    @Transactional
    public DeliveryPartnerResponseDto registerWishMaster(Long hubAdminId, WishMasterRegistrationRequestDto request) {
        if (deliveryPartnerRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists");
        }
        HubAdmin hubAdmin = hubAdminRepository.findById(hubAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Hub Admin not found"));

        DeliveryPartner partner = DeliveryPartner.builder()
                .employeeId(request.getEmployeeId())
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .vehicleNumber(request.getVehicleNumber())
                .proposedRate(request.getProposedRate())
                .password(passwordEncoder.encode(request.getPassword()))
                .hubAdmin(hubAdmin)
                .approvalStatus(ApprovalStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        partner = deliveryPartnerRepository.save(partner);

        if (request.getDocuments() != null) {
            for (Map.Entry<String, String> entry : request.getDocuments().entrySet()) {
                try {
                    DocumentType type = DocumentType.valueOf(entry.getKey());
                    WishMasterDocument doc = WishMasterDocument.builder()
                            .wishMaster(partner)
                            .documentType(type)
                            .fileUrl(entry.getValue())
                            .build();
                    doc = documentRepository.save(doc);
                    partner.getDocuments().add(doc);
                } catch (IllegalArgumentException ignored) {
                    // skip invalid document types
                }
            }
        }
        return DeliverypartnerMapper.toResponse(partner);
    }

    @Override
    public DeliveryPartnerResponseDto approveRegistration(Long wishMasterId, boolean approved) {
        DeliveryPartner partner = deliveryPartnerRepository.findById(wishMasterId)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));
        if (partner.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Registration is not pending");
        }
        partner.setApprovalStatus(approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED);
        if (approved) {
            // Approve both registration AND price together
            partner.setApprovedRate(partner.getProposedRate());
        }
        partner.setUpdatedAt(LocalDateTime.now());
        partner = deliveryPartnerRepository.save(partner);
        return DeliverypartnerMapper.toResponse(partner);
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
        return deliveryPartnerRepository.findByHubAdminId(hubAdminId)
                .stream()
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryPartnerResponseDto> searchByHubAdminIdAndEmployeeId(Long hubAdminId, String employeeId) {
        return deliveryPartnerRepository.findByHubAdminIdAndEmployeeIdContainingIgnoreCase(hubAdminId, employeeId)
                .stream()
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DeliveryPartnerResponseDto> getByHubId(Long hubId) {
        return deliveryPartnerRepository.findByHubAdmin_Hub_Id(hubId)
                .stream()
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DeliveryPartnerResponseDto> getPendingRegistrations() {
        return deliveryPartnerRepository.findAll().stream()
                .filter(p -> p.getApprovalStatus() == ApprovalStatus.PENDING)
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DeliveryPartnerResponseDto> getAllPartners() {
        return deliveryPartnerRepository.findAll()
                .stream()
                .map(DeliverypartnerMapper::toResponse)
                .collect(Collectors.toList());
    }
}
