package com.Shridigambara.wms.responsedto;

import com.Shridigambara.wms.entities.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DeliveryPerformanceResponseDto {
    private Long id;
    private Long wishMasterId;
    private String employeeId;
    private String wishMasterName;
    private LocalDate deliveryDate;
    private Integer parcelsTaken;
    private Integer parcelsDelivered;
    private Integer parcelsFailed;
    private Integer parcelsReturned;
    private String screenshotUrl;
    private VerificationStatus verificationStatus;
    private Double calculatedAmount;
    private Double overrideAmount;
    private Double finalAmount;
}
