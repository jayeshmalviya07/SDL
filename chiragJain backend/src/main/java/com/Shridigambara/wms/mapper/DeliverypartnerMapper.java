package com.Shridigambara.wms.mapper;

import com.Shridigambara.wms.entities.DeliveryPartner;
import com.Shridigambara.wms.responsedto.DeliveryPartnerResponseDto;

public class DeliverypartnerMapper {
    public static DeliveryPartnerResponseDto toResponse(DeliveryPartner entity) {
        String photoUrl = entity.getDocuments() != null ? entity.getDocuments().stream()
                .filter(doc -> com.Shridigambara.wms.entities.DocumentType.PHOTO.equals(doc.getDocumentType()))
                .map(doc -> "/api/files/download/" + doc.getFileUrl())
                .findFirst()
                .orElse(null) : null;

        return DeliveryPartnerResponseDto.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .name(entity.getName())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .vehicleNumber(entity.getVehicleNumber())
                .proposedRate(entity.getProposedRate())
                .approvedRate(entity.getApprovedRate())
                .approvalStatus(entity.getApprovalStatus())
                .hubAdminId(entity.getHubAdmin() != null ? entity.getHubAdmin().getId() : null)
                .hubName(entity.getHubAdmin() != null ? entity.getHubAdmin().getHub().getName() : null)
                .profilePhotoUrl(photoUrl)
                .build();
    }
}
