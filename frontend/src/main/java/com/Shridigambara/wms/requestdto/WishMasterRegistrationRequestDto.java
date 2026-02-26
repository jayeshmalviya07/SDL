package com.Shridigambara.wms.requestdto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Map;

@Data
public class WishMasterRegistrationRequestDto {

    private Long hubAdminId;  // Required when Super Admin creates; ignored when Hub Admin creates

    @NotBlank
    private String employeeId;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    private String address;

    private String vehicleNumber;

    @NotNull
    @Positive
    private Double proposedRate;

    @NotBlank
    @Size(min = 6)
    private String password;

    /**
     * Document type -> file URL (from upload API)
     * Keys: AADHAAR, PAN, POLICE_VERIFICATION, AGREEMENT, PHOTO, DRIVING_LICENSE
     */
    private Map<String, String> documents;
}
