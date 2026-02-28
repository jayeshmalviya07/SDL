package com.Shridigambara.wms.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@RequiredArgsConstructor
@AllArgsConstructor
@Table(name = "delivery_performance")
@Builder
public class DeliveryPerformance {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "wish_master_id", nullable = false)
        private DeliveryPartner wishMaster;

        @Column(name = "delivery_date", nullable = false)
        private LocalDate deliveryDate;

        @Column(name = "parcels_taken", nullable = false)
        private Integer parcelsTaken;

        @Column(name = "parcels_delivered", nullable = false)
        private Integer parcelsDelivered;

        @Column(name = "parcels_failed", nullable = false)
        private Integer parcelsFailed;

        @Column(name = "parcels_returned")
        private Integer parcelsReturned;

        @Column(name = "screenshot_url")
        private String screenshotUrl;

        @Enumerated(EnumType.STRING)
        @Column(name = "verification_status")
        @Builder.Default
        private VerificationStatus verificationStatus = VerificationStatus.PENDING;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "verified_by")
        private HubAdmin verifiedBy;

        @Column(name = "verified_at")
        private LocalDateTime verifiedAt;

        @Column(name = "calculated_amount", nullable = false)
        private Double calculatedAmount;

        @Column(name = "override_amount")
        private Double overrideAmount;

        @Column(name = "final_amount", nullable = false)
        private Double finalAmount;
}
