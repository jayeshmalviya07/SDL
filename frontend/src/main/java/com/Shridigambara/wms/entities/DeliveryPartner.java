package com.Shridigambara.wms.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_partner", uniqueConstraints = @UniqueConstraint(columnNames = "emp_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "emp_id", nullable = false, unique = true)
    private String employeeId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private String address;

    @Column(name = "vehicle_number")
    private String vehicleNumber;

    @Column(nullable = false)
    private String password;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hub_admin_id", nullable = false)
    private HubAdmin hubAdmin;

    private Double proposedRate;

    private Double approvedRate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * For payment calculation use approvedRate. Returns approvedRate if set, else proposedRate for display.
     */
    public Double getEffectiveRate() {
        return approvedRate != null ? approvedRate : proposedRate;
    }
}
