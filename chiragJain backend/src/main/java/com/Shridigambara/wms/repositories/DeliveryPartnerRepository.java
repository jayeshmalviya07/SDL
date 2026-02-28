package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    Optional<DeliveryPartner> findByEmployeeId(String employeeId);

    boolean existsByEmployeeId(String employeeId);

    List<DeliveryPartner> findByHubAdminId(Long hubAdminId);

    List<DeliveryPartner> findByHubAdminIdAndEmployeeIdContainingIgnoreCase(Long hubAdminId, String employeeId);

    List<DeliveryPartner> findByHubAdmin_Hub_Id(Long hubId);

    @Query("SELECT d FROM DeliveryPartner d WHERE d.isActive = true OR d.isActive IS NULL")
    List<DeliveryPartner> findActive();

    @Query("SELECT d FROM DeliveryPartner d WHERE d.isActive = false")
    List<DeliveryPartner> findInactive();

    @Query("SELECT d FROM DeliveryPartner d WHERE d.hubAdmin.id = :hubAdminId AND (d.isActive = true OR d.isActive IS NULL)")
    List<DeliveryPartner> findActiveByHubAdminId(@Param("hubAdminId") Long hubAdminId);

    List<DeliveryPartner> findByHubAdminIdAndIsActive(Long hubAdminId, Boolean isActive);

    List<DeliveryPartner> findByIsActive(Boolean isActive);
}
