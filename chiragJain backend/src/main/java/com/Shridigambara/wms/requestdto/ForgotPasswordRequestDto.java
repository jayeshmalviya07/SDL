package com.Shridigambara.wms.requestdto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequestDto {

    @NotBlank(message = "Email or Employee ID is required")
    private String emailOrEmpId;
}
