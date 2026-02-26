package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.*;
import com.Shridigambara.wms.exceptions.BadRequestException;
import com.Shridigambara.wms.exceptions.ResourceNotFoundException;
import com.Shridigambara.wms.repositories.*;
import com.Shridigambara.wms.responsedto.PriceApprovalResponseDto;
import com.Shridigambara.wms.service.PriceApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PriceApprovalServiceImpl implements PriceApprovalService {

    private final PriceApprovalRequestRepository approvalRepository;
    private final DeliveryPartnerRepository partnerRepository;
    private final HubAdminRepository hubAdminRepository;
    private final SuperAdminRepository superAdminRepository;

    @Override
    public PriceApprovalResponseDto createRequest(Long hubAdminId, Long wishMasterId, Double proposedRate) {
        DeliveryPartner partner = partnerRepository.findById(wishMasterId)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));
        HubAdmin hubAdmin = hubAdminRepository.findById(hubAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Hub Admin not found"));
        if (!partner.getHubAdmin().getId().equals(hubAdminId)) {
            throw new BadRequestException("Wish Master does not belong to your hub");
        }

        PriceApprovalRequest request = PriceApprovalRequest.builder()
                .wishMaster(partner)
                .proposedRate(proposedRate)
                .requestedBy(hubAdmin)
                .status(ApprovalStatus.PENDING)
                .build();
        request = approvalRepository.save(request);
        return toDto(request);
    }

    @Override
    public PriceApprovalResponseDto approve(Long requestId, Long superAdminId, boolean approved, Double finalRate) {
        PriceApprovalRequest request = approvalRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        if (request.getStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Request is not pending");
        }
        SuperAdmin admin = superAdminRepository.findById(superAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found"));

        request.setStatus(approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED);
        request.setReviewedBy(admin);
        request.setReviewedAt(LocalDateTime.now());
        request = approvalRepository.save(request);

        if (approved) {
            DeliveryPartner partner = request.getWishMaster();
            partner.setApprovedRate(finalRate != null ? finalRate : request.getProposedRate());
            partnerRepository.save(partner);
        }
        return toDto(request);
    }

    @Override
    public List<PriceApprovalResponseDto> getPendingRequests() {
        return approvalRepository.findByStatus(ApprovalStatus.PENDING)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private PriceApprovalResponseDto toDto(PriceApprovalRequest r) {
        return PriceApprovalResponseDto.builder()
                .id(r.getId())
                .wishMasterId(r.getWishMaster().getId())
                .wishMasterName(r.getWishMaster().getName())
                .proposedRate(r.getProposedRate())
                .status(r.getStatus())
                .reviewedAt(r.getReviewedAt())
                .build();
    }
}
