package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.DeliveryPerformance;
import com.Shridigambara.wms.entities.DeliveryPartner;
import com.Shridigambara.wms.entities.VerificationStatus;
import com.Shridigambara.wms.exceptions.ResourceNotFoundException;
import com.Shridigambara.wms.repositories.*;
import com.Shridigambara.wms.responsedto.*;
import com.Shridigambara.wms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final HubRepository hubRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryPerformanceRepository deliveryPerformanceRepository;
    private final HubAdminRepository hubAdminRepository;

    // ========== SUPER ADMIN REPORTS ==========

    @Override
    public List<HubResponseDto> getAllHubs() {
        return hubRepository.findAll().stream()
                .map(h -> HubResponseDto.builder()
                        .id(h.getId())
                        .hubId(h.getHubId())
                        .name(h.getName())
                        .city(h.getCity())
                        .area(h.getArea())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<HubResponseDto> getHubsByCity(String city) {
        return hubRepository.findByCity(city).stream()
                .map(h -> HubResponseDto.builder()
                        .id(h.getId())
                        .hubId(h.getHubId())
                        .name(h.getName())
                        .city(h.getCity())
                        .area(h.getArea())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<HubResponseDto> getHubsByCityAndArea(String city, String area) {
        return hubRepository.findByCityAndArea(city, area).stream()
                .map(h -> HubResponseDto.builder()
                        .id(h.getId())
                        .hubId(h.getHubId())
                        .name(h.getName())
                        .city(h.getCity())
                        .area(h.getArea())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<WishMasterPerformanceSummaryDto> getWishMastersByHub(Long hubId) {
        List<DeliveryPartner> wishMasters = deliveryPartnerRepository.findByHubAdmin_Hub_Id(hubId);
        return wishMasters.stream()
                .map(this::calculateWishMasterSummary)
                .collect(Collectors.toList());
    }

    @Override
    public PerformanceReportDto getWishMasterDetailedReport(Long wishMasterId, LocalDate startDate, LocalDate endDate) {
        DeliveryPartner wishMaster = deliveryPartnerRepository.findById(wishMasterId)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));

        List<DeliveryPerformance> entries = deliveryPerformanceRepository.findByWishMaster_Id(wishMasterId)
                .stream()
                .filter(e -> e.getVerificationStatus() == VerificationStatus.APPROVED)
                .filter(e -> (startDate == null || !e.getDeliveryDate().isBefore(startDate)) &&
                             (endDate == null || !e.getDeliveryDate().isAfter(endDate)))
                .sorted((a, b) -> a.getDeliveryDate().compareTo(b.getDeliveryDate()))
                .collect(Collectors.toList());

        List<DailyPerformanceDto> dailyPerformances = entries.stream()
                .map(e -> DailyPerformanceDto.builder()
                        .date(e.getDeliveryDate())
                        .parcelsReceived(e.getParcelsTaken())
                        .parcelsDelivered(e.getParcelsDelivered())
                        .parcelsFailed(e.getParcelsFailed())
                        .parcelsReturned(e.getParcelsReturned() != null ? e.getParcelsReturned() : 0)
                        .amount(e.getFinalAmount())
                        .build())
                .collect(Collectors.toList());

        PerformanceSummaryDto grandTotal = calculateGrandTotal(entries);

        return PerformanceReportDto.builder()
                .dailyPerformances(dailyPerformances)
                .grandTotal(grandTotal)
                .build();
    }

    @Override
    public List<WishMasterPerformanceSummaryDto> searchWishMasters(String employeeId) {
        return deliveryPartnerRepository.findAll().stream()
                .filter(wm -> wm.getEmployeeId().contains(employeeId))
                .map(this::calculateWishMasterSummary)
                .collect(Collectors.toList());
    }

    // ========== HUB ADMIN REPORTS ==========

    @Override
    public List<WishMasterPerformanceSummaryDto> getHubWishMasters(Long hubAdminId) {
        List<DeliveryPartner> wishMasters = deliveryPartnerRepository.findByHubAdminId(hubAdminId);
        return wishMasters.stream()
                .map(this::calculateWishMasterSummary)
                .collect(Collectors.toList());
    }

    @Override
    public PerformanceReportDto getHubWishMasterDetailedReport(Long hubAdminId, Long wishMasterId, LocalDate startDate, LocalDate endDate) {
        DeliveryPartner wishMaster = deliveryPartnerRepository.findById(wishMasterId)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));

        if (!wishMaster.getHubAdmin().getId().equals(hubAdminId)) {
            throw new ResourceNotFoundException("Wish Master does not belong to your hub");
        }

        return getWishMasterDetailedReport(wishMasterId, startDate, endDate);
    }

    @Override
    public List<WishMasterPerformanceSummaryDto> searchHubWishMasters(Long hubAdminId, String employeeId) {
        return deliveryPartnerRepository.findByHubAdminId(hubAdminId).stream()
                .filter(wm -> wm.getEmployeeId().contains(employeeId))
                .map(this::calculateWishMasterSummary)
                .collect(Collectors.toList());
    }

    // ========== WISH MASTER SELF-SERVICE ==========

    @Override
    public WishMasterPerformanceSummaryDto getMyOverallPerformance(Long wishMasterId) {
        DeliveryPartner wishMaster = deliveryPartnerRepository.findById(wishMasterId)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));
        return calculateWishMasterSummary(wishMaster);
    }

    @Override
    public PerformanceReportDto getMyDetailedReport(Long wishMasterId, LocalDate startDate, LocalDate endDate) {
        return getWishMasterDetailedReport(wishMasterId, startDate, endDate);
    }

    @Override
    public DailyPerformanceDto getMyDayPerformance(Long wishMasterId, LocalDate date) {
        DeliveryPerformance entry = deliveryPerformanceRepository
                .findByWishMaster_IdAndDeliveryDate(wishMasterId, date)
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found for this date"));

        return DailyPerformanceDto.builder()
                .date(entry.getDeliveryDate())
                .parcelsReceived(entry.getParcelsTaken())
                .parcelsDelivered(entry.getParcelsDelivered())
                .parcelsFailed(entry.getParcelsFailed())
                .parcelsReturned(entry.getParcelsReturned() != null ? entry.getParcelsReturned() : 0)
                .amount(entry.getFinalAmount())
                .build();
    }

    // ========== HELPER METHODS ==========

    private WishMasterPerformanceSummaryDto calculateWishMasterSummary(DeliveryPartner wishMaster) {
        List<DeliveryPerformance> entries = deliveryPerformanceRepository.findByWishMaster_Id(wishMaster.getId())
                .stream()
                .filter(e -> e.getVerificationStatus() == VerificationStatus.APPROVED)
                .collect(Collectors.toList());

        PerformanceSummaryDto summary = calculateGrandTotal(entries);

        return WishMasterPerformanceSummaryDto.builder()
                .wishMasterId(wishMaster.getId())
                .employeeId(wishMaster.getEmployeeId())
                .wishMasterName(wishMaster.getName())
                .hubId(wishMaster.getHubAdmin().getHub().getId())
                .hubName(wishMaster.getHubAdmin().getHub().getName())
                .totalParcelsReceived(summary.getTotalParcelsReceived())
                .totalParcelsDelivered(summary.getTotalParcelsDelivered())
                .totalParcelsFailed(summary.getTotalParcelsFailed())
                .totalParcelsReturned(summary.getTotalParcelsReturned())
                .totalAmount(summary.getTotalAmount())
                .build();
    }

    private PerformanceSummaryDto calculateGrandTotal(List<DeliveryPerformance> entries) {
        long totalReceived = entries.stream().mapToLong(DeliveryPerformance::getParcelsTaken).sum();
        long totalDelivered = entries.stream().mapToLong(DeliveryPerformance::getParcelsDelivered).sum();
        long totalFailed = entries.stream().mapToLong(DeliveryPerformance::getParcelsFailed).sum();
        long totalReturned = entries.stream().mapToLong(e -> e.getParcelsReturned() != null ? e.getParcelsReturned() : 0).sum();
        double totalAmount = entries.stream().mapToDouble(DeliveryPerformance::getFinalAmount).sum();

        return PerformanceSummaryDto.builder()
                .totalParcelsReceived(totalReceived)
                .totalParcelsDelivered(totalDelivered)
                .totalParcelsFailed(totalFailed)
                .totalParcelsReturned(totalReturned)
                .totalAmount(totalAmount)
                .build();
    }
}
