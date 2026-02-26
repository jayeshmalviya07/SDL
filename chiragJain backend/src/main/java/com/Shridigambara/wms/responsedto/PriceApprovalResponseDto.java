package com.Shridigambara.wms.responsedto;

import com.Shridigambara.wms.entities.ApprovalStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PriceApprovalResponseDto {
    private Long id;
    private Long wishMasterId;
    private String wishMasterName;
    private Double proposedRate;
    private ApprovalStatus status;
    private LocalDateTime reviewedAt;
}
