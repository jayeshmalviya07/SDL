package com.Shridigambara.wms.requestdto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDto {
    @NotBlank
    private String emailOrEmpId;

    @NotBlank
    private String password;

    private String role;  // SUPER_ADMIN, HUB_ADMIN, WISH_MASTER - optional, can be inferred
}
