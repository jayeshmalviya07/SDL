package com.Shridigambara.wms.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hub", uniqueConstraints = @UniqueConstraint(columnNames = "hub_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hub_id", nullable = false, unique = true)
    private String hubId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String area;

    @Builder.Default
    private Boolean isActive = true;
}
