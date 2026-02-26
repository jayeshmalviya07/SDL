package com.Shridigambara.wms.responsedto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HubResponseDto {
    private Long id;
    private String hubId;
    private String name;
    private String city;
    private String area;
}
