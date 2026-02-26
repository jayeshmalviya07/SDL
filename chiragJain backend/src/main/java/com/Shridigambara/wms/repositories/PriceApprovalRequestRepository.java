package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.ApprovalStatus;
import com.Shridigambara.wms.entities.PriceApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceApprovalRequestRepository extends JpaRepository<PriceApprovalRequest, Long> {
    List<PriceApprovalRequest> findByStatus(ApprovalStatus status);
}
