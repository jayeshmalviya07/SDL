package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuperAdminRepository extends JpaRepository<SuperAdmin, Long> {

    boolean existsByEmail(String email);

    java.util.Optional<SuperAdmin> findByEmail(String email);

    long countByIsActiveTrue();
}
