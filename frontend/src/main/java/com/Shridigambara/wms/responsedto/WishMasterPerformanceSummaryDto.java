package com.Shridigambara.wms.responsedto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WishMasterPerformanceSummaryDto {
    private Long wishMasterId;
    private String employeeId;
    private String wishMasterName;
    private Long hubId;
    private String hubName;
    private Long totalParcelsReceived;
    private Long totalParcelsDelivered;
    private Long totalParcelsFailed;
    private Long totalParcelsReturned;
    private Double totalAmount;
}
