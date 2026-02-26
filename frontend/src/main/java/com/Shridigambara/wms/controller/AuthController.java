package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.requestdto.ForgotPasswordRequestDto;
import com.Shridigambara.wms.requestdto.LoginRequestDto;
import com.Shridigambara.wms.requestdto.ResetPasswordRequestDto;
import com.Shridigambara.wms.responsedto.LoginResponseDto;
import com.Shridigambara.wms.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        authService.generateOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP generated successfully. Check the server console."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }
}
