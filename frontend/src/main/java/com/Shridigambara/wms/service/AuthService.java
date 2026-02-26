package com.Shridigambara.wms.service;

import com.Shridigambara.wms.requestdto.ForgotPasswordRequestDto;
import com.Shridigambara.wms.requestdto.LoginRequestDto;
import com.Shridigambara.wms.requestdto.ResetPasswordRequestDto;
import com.Shridigambara.wms.responsedto.LoginResponseDto;

public interface AuthService {
    LoginResponseDto login(LoginRequestDto request);

    void generateOtp(ForgotPasswordRequestDto request);

    void resetPassword(ResetPasswordRequestDto request);
}
