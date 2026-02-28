package com.Shridigambara.wms.responsedto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PerformanceReportDto {
    private List<DailyPerformanceDto> dailyPerformances;
    private PerformanceSummaryDto grandTotal;
    private Long hubId;
    private String hubName;
    private DeliveryPartnerResponseDto employeeDetails;
}
