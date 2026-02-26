package com.Shridigambara.wms.responsedto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HubAdminResponseDto {
    private Long id;
    private String name;
    private String username;
    private String email;
    private Long hubId;
    private String hubName;
    private String city;
}
