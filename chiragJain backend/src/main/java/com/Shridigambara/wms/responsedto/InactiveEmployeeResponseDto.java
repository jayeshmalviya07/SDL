package com.Shridigambara.wms.responsedto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InactiveEmployeeResponseDto {
    private Long id;
    private String name;
    private String employeeId;
    private String role;
    private String hubName;
    private String city;
}
