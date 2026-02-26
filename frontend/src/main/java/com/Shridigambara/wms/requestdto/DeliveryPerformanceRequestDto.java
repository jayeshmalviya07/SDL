package com.Shridigambara.wms.requestdto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class DeliveryPerformanceRequestDto {

    private Long wishMasterId;  // when Super Admin uses

    private String employeeId;   // when Wish Master uses - preferred for their API

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deliveryDate;

    @NotNull
    @Min(0)
    private Integer parcelsTaken;

    @NotNull
    @Min(0)
    private Integer parcelsDelivered;

    @NotNull
    @Min(0)
    private Integer parcelsFailed;

    @Min(0)
    private Integer parcelsReturned;

    private String screenshotUrl;

    private Double overrideAmount;  // optional
}
