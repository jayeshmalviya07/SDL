package com.Shridigambara.wms.responsedto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDto {
    private String token;
    private String role;
    private Long entityId;
    private String name;
}
