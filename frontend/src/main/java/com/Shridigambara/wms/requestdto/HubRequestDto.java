package com.Shridigambara.wms.requestdto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HubRequestDto {
    @NotBlank
    private String hubId;

    @NotBlank
    private String name;

    @NotBlank
    private String city;

    @NotBlank
    private String area;
}
