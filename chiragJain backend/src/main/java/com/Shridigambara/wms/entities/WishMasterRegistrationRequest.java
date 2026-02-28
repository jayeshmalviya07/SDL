package com.Shridigambara.wms.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "wish_master_registration_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishMasterRegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
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

    @Column(name = "proposed_rate", nullable = false)
    private Double proposedRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hub_admin_id", nullable = false)
    private HubAdmin hubAdmin;

    @ElementCollection
    @CollectionTable(name = "registration_request_documents", joinColumns = @JoinColumn(name = "request_id"))
    @MapKeyColumn(name = "document_type")
    @Column(name = "file_url")
    private Map<String, String> documents;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private SuperAdmin reviewedBy;

    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
