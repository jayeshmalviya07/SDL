package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.Hub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HubRepository extends JpaRepository<Hub, Long> {
    Optional<Hub> findByHubId(String hubId);
    boolean existsByHubId(String hubId);
    List<Hub> findByCity(String city);
    List<Hub> findByCityAndArea(String city, String area);
}
