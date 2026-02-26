package com.Shridigambara.wms.requestdto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequestDto {

    @NotBlank(message = "Email or Employee ID is required")
    private String emailOrEmpId;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "New Password is required")
    private String newPassword;
}
