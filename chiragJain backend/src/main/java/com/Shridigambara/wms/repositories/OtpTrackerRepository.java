package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.OtpTracker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpTrackerRepository extends JpaRepository<OtpTracker, Long> {
    Optional<OtpTracker> findByIdentifierAndOtp(String identifier, String otp);

    void deleteByIdentifier(String identifier);
}
