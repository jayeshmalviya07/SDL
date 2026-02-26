package com.Shridigambara.wms.config;

import com.Shridigambara.wms.entities.SuperAdmin;
import com.Shridigambara.wms.repositories.SuperAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SuperAdminRepository superAdminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${wms.seed.super-admin.email:admin@wms.com}")
    private String seedEmail;

    @Value("${wms.seed.super-admin.password:Admin@123}")
    private String seedPassword;

    @Value("${wms.seed.enabled:true}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (!seedEnabled) return;
        if (superAdminRepository.count() > 0) return;

        SuperAdmin admin = SuperAdmin.builder()
                .name("System Super Admin")
                .email(seedEmail)
                .password(passwordEncoder.encode(seedPassword))
                .isActive(true)
                .build();
        superAdminRepository.save(admin);
    }
}
