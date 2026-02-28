package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.DeliveryPerformance;
import com.Shridigambara.wms.entities.DeliveryPartner;
import com.Shridigambara.wms.entities.VerificationStatus;
import com.Shridigambara.wms.exceptions.ResourceNotFoundException;
import com.Shridigambara.wms.repositories.*;
import com.Shridigambara.wms.responsedto.*;
import com.Shridigambara.wms.mapper.DeliverypartnerMapper;
import com.Shridigambara.wms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
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
        public List<WishMasterPerformanceSummaryDto> getWishMastersByHub(Long hubId, LocalDate startDate,
                        LocalDate endDate) {
                List<DeliveryPartner> wishMasters = deliveryPartnerRepository.findByHubAdmin_Hub_Id(hubId);
                return wishMasters.stream()
                                .map(wm -> calculateWishMasterSummary(wm, startDate, endDate))
                                .collect(Collectors.toList());
        }

        @Override
        public PerformanceReportDto getWishMasterDetailedReport(Long wishMasterId, LocalDate startDate,
                        LocalDate endDate) {
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
                                                .id(e.getId())
                                                .date(e.getDeliveryDate())
                                                .parcelsReceived(e.getParcelsTaken())
                                                .parcelsDelivered(e.getParcelsDelivered())
                                                .parcelsFailed(e.getParcelsFailed())
                                                .parcelsReturned(e.getParcelsReturned() != null ? e.getParcelsReturned()
                                                                : 0)
                                                .screenshotUrl(normalizeScreenshotUrl(e.getScreenshotUrl()))
                                                .amount(e.getFinalAmount())
                                                .build())
                                .collect(Collectors.toList());

                PerformanceSummaryDto grandTotal = calculateGrandTotal(entries);
                grandTotal.setPerParcelRate(wishMaster.getEffectiveRate());
                grandTotal.setProposedRate(wishMaster.getProposedRate());
                grandTotal.setApprovedRate(wishMaster.getApprovedRate());

                Long hubId = null;
                String hubName = "N/A";
                if (wishMaster.getHubAdmin() != null && wishMaster.getHubAdmin().getHub() != null) {
                        hubId = wishMaster.getHubAdmin().getHub().getId();
                        hubName = wishMaster.getHubAdmin().getHub().getName();
                }

                return PerformanceReportDto.builder()
                                .dailyPerformances(dailyPerformances)
                                .grandTotal(grandTotal)
                                .hubId(hubId)
                                .hubName(hubName)
                                .employeeDetails(DeliverypartnerMapper.toResponse(wishMaster))
                                .build();
        }

        @Override
        public List<WishMasterPerformanceSummaryDto> searchWishMasters(String employeeId, LocalDate startDate,
                        LocalDate endDate) {
                return deliveryPartnerRepository.findAll().stream()
                                .filter(wm -> wm.getEmployeeId().contains(employeeId))
                                .map(wm -> calculateWishMasterSummary(wm, startDate, endDate))
                                .collect(Collectors.toList());
        }

        // ========== HUB ADMIN REPORTS ==========
        @Override
        public List<WishMasterPerformanceSummaryDto> getHubWishMasters(Long hubAdminId, LocalDate startDate,
                        LocalDate endDate) {
                List<DeliveryPartner> wishMasters = deliveryPartnerRepository.findByHubAdminId(hubAdminId);
                return wishMasters.stream()
                                .map(wm -> calculateWishMasterSummary(wm, startDate, endDate))
                                .collect(Collectors.toList());
        }

        @Override
        public PerformanceReportDto getHubWishMasterDetailedReport(Long hubAdminId, Long wishMasterId,
                        LocalDate startDate, LocalDate endDate) {
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
                                .map(wm -> calculateWishMasterSummary(wm, null, null))
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
        public List<DailyPerformanceDto> getMyDayPerformance(Long wishMasterId, LocalDate date) {
                return deliveryPerformanceRepository
                                .findByWishMaster_IdAndDeliveryDate(wishMasterId, date)
                                .stream()
                                .map(entry -> DailyPerformanceDto.builder()
                                                .id(entry.getId())
                                                .date(entry.getDeliveryDate())
                                                .parcelsReceived(entry.getParcelsTaken())
                                                .parcelsDelivered(entry.getParcelsDelivered())
                                                .parcelsFailed(entry.getParcelsFailed())
                                                .parcelsReturned(entry.getParcelsReturned() != null
                                                                ? entry.getParcelsReturned()
                                                                : 0)
                                                .screenshotUrl(normalizeScreenshotUrl(entry.getScreenshotUrl()))
                                                .amount(entry.getFinalAmount())
                                                .build())
                                .collect(Collectors.toList());
        }

        // ========== HELPER METHODS ==========

        private WishMasterPerformanceSummaryDto calculateWishMasterSummary(DeliveryPartner wishMaster,
                        LocalDate startDate, LocalDate endDate) {
                List<DeliveryPerformance> entries = deliveryPerformanceRepository
                                .findByWishMaster_Id(wishMaster.getId())
                                .stream()
                                .filter(e -> e.getVerificationStatus() == VerificationStatus.APPROVED)
                                .filter(e -> (startDate == null || !e.getDeliveryDate().isBefore(startDate)) &&
                                                (endDate == null || !e.getDeliveryDate().isAfter(endDate)))
                                .collect(Collectors.toList());

                PerformanceSummaryDto summary = calculateGrandTotal(entries);

                Long hubId = null;
                String hubName = "N/A";
                if (wishMaster.getHubAdmin() != null && wishMaster.getHubAdmin().getHub() != null) {
                        hubId = wishMaster.getHubAdmin().getHub().getId();
                        hubName = wishMaster.getHubAdmin().getHub().getName();
                }

                return WishMasterPerformanceSummaryDto.builder()
                                .wishMasterId(wishMaster.getId())
                                .employeeId(wishMaster.getEmployeeId())
                                .wishMasterName(wishMaster.getName())
                                .hubId(hubId)
                                .hubName(hubName)
                                .totalParcelsReceived(summary.getTotalParcelsReceived())
                                .totalParcelsDelivered(summary.getTotalParcelsDelivered())
                                .totalParcelsFailed(summary.getTotalParcelsFailed())
                                .totalParcelsReturned(summary.getTotalParcelsReturned())
                                .totalAmount(summary.getTotalAmount())
                                .perParcelRate(wishMaster.getEffectiveRate())
                                .proposedRate(wishMaster.getProposedRate())
                                .approvedRate(wishMaster.getApprovedRate())
                                .build();
        }

        private WishMasterPerformanceSummaryDto calculateWishMasterSummary(DeliveryPartner wishMaster) {
                return calculateWishMasterSummary(wishMaster, null, null);
        }

        private PerformanceSummaryDto calculateGrandTotal(List<DeliveryPerformance> entries) {
                long totalReceived = entries.stream().mapToLong(DeliveryPerformance::getParcelsTaken).sum();
                long totalDelivered = entries.stream().mapToLong(DeliveryPerformance::getParcelsDelivered).sum();
                long totalFailed = entries.stream().mapToLong(DeliveryPerformance::getParcelsFailed).sum();
                long totalReturned = entries.stream()
                                .mapToLong(e -> e.getParcelsReturned() != null ? e.getParcelsReturned() : 0).sum();
                double totalAmount = entries.stream().mapToDouble(DeliveryPerformance::getFinalAmount).sum();

                return PerformanceSummaryDto.builder()
                                .totalParcelsReceived(totalReceived)
                                .totalParcelsDelivered(totalDelivered)
                                .totalParcelsFailed(totalFailed)
                                .totalParcelsReturned(totalReturned)
                                .totalAmount(totalAmount)
                                .build();
        }

        private String normalizeScreenshotUrl(String url) {
                if (url == null || url.isEmpty() || url.startsWith("/api/uploads/")) {
                        return url;
                }
                return "/api/uploads/" + url;
        }
}
