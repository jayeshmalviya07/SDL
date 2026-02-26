package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    Optional<DeliveryPartner> findByEmployeeId(String employeeId);

    boolean existsByEmployeeId(String employeeId);

    List<DeliveryPartner> findByHubAdminId(Long hubAdminId);

    List<DeliveryPartner> findByHubAdmin_Hub_Id(Long hubId);
}
