package com.Shridigambara.wms.service;

import com.Shridigambara.wms.responsedto.PriceApprovalResponseDto;

import java.util.List;

public interface PriceApprovalService {
    PriceApprovalResponseDto createRequest(Long hubAdminId, Long wishMasterId, Double proposedRate);

    PriceApprovalResponseDto approve(Long requestId, Long superAdminId, boolean approved, Double finalRate);

    List<PriceApprovalResponseDto> getPendingRequests();
}
