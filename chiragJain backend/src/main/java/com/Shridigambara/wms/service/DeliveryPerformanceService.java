package com.Shridigambara.wms.service;

import com.Shridigambara.wms.requestdto.DeliveryPerformanceRequestDto;
import com.Shridigambara.wms.responsedto.DeliveryPerformanceResponseDto;
import org.springframework.core.io.Resource;

import java.time.LocalDate;
import java.util.List;

public interface DeliveryPerformanceService {
    DeliveryPerformanceResponseDto createOrUpdateEntry(DeliveryPerformanceRequestDto request);

    List<DeliveryPerformanceResponseDto> getByWishMaster(Long wishMasterId);

    List<DeliveryPerformanceResponseDto> getByWishMasterEmployeeId(String employeeId);

    List<DeliveryPerformanceResponseDto> getByDateRange(LocalDate start, LocalDate end);

    Resource downloadMonthlySheet(Long wishMasterId, int year, int month);

    void deleteByMonth(Long wishMasterId, int year, int month);
}
