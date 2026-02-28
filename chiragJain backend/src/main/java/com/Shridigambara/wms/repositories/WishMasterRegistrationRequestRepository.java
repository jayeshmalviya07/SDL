package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.ApprovalStatus;
import com.Shridigambara.wms.entities.WishMasterRegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishMasterRegistrationRequestRepository extends JpaRepository<WishMasterRegistrationRequest, Long> {
    List<WishMasterRegistrationRequest> findByStatus(ApprovalStatus status);

    boolean existsByEmployeeIdAndStatus(String employeeId, ApprovalStatus status);
}
