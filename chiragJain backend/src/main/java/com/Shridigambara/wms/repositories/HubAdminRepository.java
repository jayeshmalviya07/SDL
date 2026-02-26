package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.HubAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HubAdminRepository extends JpaRepository<HubAdmin, Long> {
    Optional<HubAdmin> findByEmail(String email);

    Optional<HubAdmin> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<HubAdmin> findByHub_Id(Long hubId);
}
