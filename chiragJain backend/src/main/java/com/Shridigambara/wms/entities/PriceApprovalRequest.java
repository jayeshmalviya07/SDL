package com.Shridigambara.wms.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "price_approval_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceApprovalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wish_master_id", nullable = false)
    private DeliveryPartner wishMaster;

    @Column(name = "proposed_rate", nullable = false)
    private Double proposedRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private HubAdmin requestedBy;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private SuperAdmin reviewedBy;

    private LocalDateTime reviewedAt;
}
