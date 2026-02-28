package com.Shridigambara.wms.service;

import com.Shridigambara.wms.responsedto.*;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    // Super Admin Reports
    List<HubResponseDto> getAllHubs();

    List<HubResponseDto> getHubsByCity(String city);

    List<HubResponseDto> getHubsByCityAndArea(String city, String area);

    List<WishMasterPerformanceSummaryDto> getWishMastersByHub(Long hubId, LocalDate startDate, LocalDate endDate);

    PerformanceReportDto getWishMasterDetailedReport(Long wishMasterId, LocalDate startDate, LocalDate endDate);

    List<WishMasterPerformanceSummaryDto> searchWishMasters(String employeeId, LocalDate startDate, LocalDate endDate);

    // Hub Admin Reports (scoped to their hub)
    List<WishMasterPerformanceSummaryDto> getHubWishMasters(Long hubAdminId, LocalDate startDate, LocalDate endDate);

    PerformanceReportDto getHubWishMasterDetailedReport(Long hubAdminId, Long wishMasterId, LocalDate startDate,
            LocalDate endDate);

    List<WishMasterPerformanceSummaryDto> searchHubWishMasters(Long hubAdminId, String employeeId);

    // Wish Master Self-Service Reports
    WishMasterPerformanceSummaryDto getMyOverallPerformance(Long wishMasterId);

    PerformanceReportDto getMyDetailedReport(Long wishMasterId, LocalDate startDate, LocalDate endDate);

    List<DailyPerformanceDto> getMyDayPerformance(Long wishMasterId, LocalDate date);
}
