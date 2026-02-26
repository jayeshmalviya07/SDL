package com.Shridigambara.wms.requestdto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Data
 @NoArgsConstructor
public class DeliveryPartnerRequestDto {

    @NotBlank
    private String employeeId;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    @NotNull
    @Positive
    private Double perParcelRate;
}
