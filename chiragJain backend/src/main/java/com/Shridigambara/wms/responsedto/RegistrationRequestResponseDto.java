package com.Shridigambara.wms.responsedto;

import com.Shridigambara.wms.entities.ApprovalStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class RegistrationRequestResponseDto {
    private Long id;
    private String employeeId;
    private String name;
    private String phone;
    private String address;
    private String vehicleNumber;
    private Double proposedRate;
    private Map<String, String> documents;
    private ApprovalStatus status;
    private Long hubAdminId;
    private String hubName;
    private String hubCity;
    private LocalDateTime createdAt;
}
