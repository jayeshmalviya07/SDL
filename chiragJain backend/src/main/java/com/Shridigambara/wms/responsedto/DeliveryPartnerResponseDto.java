package com.Shridigambara.wms.responsedto;

import com.Shridigambara.wms.entities.ApprovalStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeliveryPartnerResponseDto {
    private Long id;
    private String employeeId;
    private String name;
    private String phone;
    private String address;
    private String vehicleNumber;
    private Double proposedRate;
    private Double approvedRate;
    private ApprovalStatus approvalStatus;
    private Long hubAdminId;
    private String hubName;
    private String profilePhotoUrl;
    private java.util.Map<String, String> documents;
    private Boolean isActive;
}
