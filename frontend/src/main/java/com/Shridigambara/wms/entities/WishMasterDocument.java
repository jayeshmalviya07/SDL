package com.Shridigambara.wms.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wish_master_document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishMasterDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wish_master_id", nullable = false)
    private DeliveryPartner wishMaster;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;
}
