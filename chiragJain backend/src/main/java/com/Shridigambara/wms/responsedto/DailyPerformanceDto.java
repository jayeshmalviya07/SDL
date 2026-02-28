package com.Shridigambara.wms.responsedto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DailyPerformanceDto {
    private Long id;
    private LocalDate date;
    private Integer parcelsReceived;
    private Integer parcelsDelivered;
    private Integer parcelsFailed;
    private Integer parcelsReturned;
    private String screenshotUrl;
    private Double amount;
}
