package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.DeliveryPerformance;
import com.Shridigambara.wms.entities.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DeliveryPerformanceRepository extends JpaRepository<DeliveryPerformance, Long> {

    Optional<DeliveryPerformance> findByWishMaster_IdAndDeliveryDate(Long wishMasterId, LocalDate date);

    List<DeliveryPerformance> findByWishMaster_Id(Long wishMasterId);

    List<DeliveryPerformance> findByDeliveryDateBetween(LocalDate start, LocalDate end);

    List<DeliveryPerformance> findByWishMaster_HubAdmin_Hub_IdAndDeliveryDateBetween(Long hubId, LocalDate start,
            LocalDate end);

    List<DeliveryPerformance> findByWishMaster_HubAdmin_IdAndVerificationStatus(Long hubAdminId,
            VerificationStatus status);

    List<DeliveryPerformance> findByWishMaster_HubAdmin_Hub_IdAndVerificationStatus(Long hubId,
            VerificationStatus status);

    List<DeliveryPerformance> findByWishMaster_HubAdmin_IdAndDeliveryDateBetween(Long hubAdminId, LocalDate start,
            LocalDate end);

    void deleteByWishMaster_IdAndDeliveryDateBetween(Long wishMasterId, LocalDate start, LocalDate end);
}
