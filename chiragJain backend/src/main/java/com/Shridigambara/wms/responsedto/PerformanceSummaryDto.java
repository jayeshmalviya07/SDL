package com.Shridigambara.wms.responsedto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PerformanceSummaryDto {
    private Long totalParcelsReceived;
    private Long totalParcelsDelivered;
    private Long totalParcelsFailed;
    private Long totalParcelsReturned;
    private Double totalAmount;
    private Double perParcelRate;
    private Double proposedRate;
    private Double approvedRate;
}
