package com.Shridigambara.wms.mapper;

import com.Shridigambara.wms.entities.DeliveryPerformance;
import com.Shridigambara.wms.responsedto.DeliveryPerformanceResponseDto;

public class DeliveryPerformanceMapper {
    public static DeliveryPerformanceResponseDto toResponse(DeliveryPerformance entity) {
        return DeliveryPerformanceResponseDto.builder()
                .id(entity.getId())
                .wishMasterId(entity.getWishMaster() != null ? entity.getWishMaster().getId() : null)
                .employeeId(entity.getWishMaster() != null ? entity.getWishMaster().getEmployeeId() : null)
                .wishMasterName(entity.getWishMaster() != null ? entity.getWishMaster().getName() : null)
                .deliveryDate(entity.getDeliveryDate())
                .parcelsTaken(entity.getParcelsTaken())
                .parcelsDelivered(entity.getParcelsDelivered())
                .parcelsFailed(entity.getParcelsFailed())
                .parcelsReturned(entity.getParcelsReturned())
                .screenshotUrl(entity.getScreenshotUrl())
                .verificationStatus(entity.getVerificationStatus())
                .calculatedAmount(entity.getCalculatedAmount())
                .overrideAmount(entity.getOverrideAmount())
                .finalAmount(entity.getFinalAmount())
                .build();
    }
}
