package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.*;
import com.Shridigambara.wms.exceptions.BadRequestException;
import com.Shridigambara.wms.exceptions.ResourceNotFoundException;
import com.Shridigambara.wms.mapper.DeliveryPerformanceMapper;
import com.Shridigambara.wms.repositories.DeliveryPartnerRepository;
import com.Shridigambara.wms.repositories.DeliveryPerformanceRepository;
import com.Shridigambara.wms.repositories.HubAdminRepository;
import com.Shridigambara.wms.requestdto.DeliveryPerformanceRequestDto;
import com.Shridigambara.wms.responsedto.DeliveryPerformanceResponseDto;
import com.Shridigambara.wms.service.DeliveryPerformanceService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryPerformanceServiceImpl implements DeliveryPerformanceService {

    private final DeliveryPerformanceRepository performanceRepository;
    private final DeliveryPartnerRepository partnerRepository;
    private final HubAdminRepository hubAdminRepository;

    @Override
    public DeliveryPerformanceResponseDto createOrUpdateEntry(DeliveryPerformanceRequestDto request) {
        // Only allow entries for today's date
        if (request.getDeliveryDate() != null && !request.getDeliveryDate().equals(LocalDate.now())) {
            throw new IllegalArgumentException("Entries can only be submitted for today's date");
        }
        if (request.getDeliveryDate() == null) {
            request.setDeliveryDate(LocalDate.now());
        }

        DeliveryPartner wishMaster = resolveWishMaster(request);
        validateNumbers(request);

        Optional<DeliveryPerformance> existing = request.getWishMasterId() != null
                ? performanceRepository.findByWishMaster_IdAndDeliveryDate(request.getWishMasterId(),
                        request.getDeliveryDate())
                : performanceRepository.findByWishMaster_IdAndDeliveryDate(wishMaster.getId(),
                        request.getDeliveryDate());

        Double rate = wishMaster.getApprovedRate() != null ? wishMaster.getApprovedRate()
                : wishMaster.getProposedRate();
        if (rate == null)
            rate = 0.0;
        double calculatedAmount = request.getParcelsDelivered() * rate;
        double finalAmount = request.getOverrideAmount() != null ? request.getOverrideAmount() : calculatedAmount;

        DeliveryPerformance entity;
        if (existing.isPresent()) {
            entity = existing.get();
            entity.setParcelsTaken(request.getParcelsTaken());
            entity.setParcelsDelivered(request.getParcelsDelivered());
            entity.setParcelsFailed(request.getParcelsFailed());
            entity.setParcelsReturned(request.getParcelsReturned() != null ? request.getParcelsReturned() : 0);
            entity.setScreenshotUrl(request.getScreenshotUrl());
            entity.setCalculatedAmount(calculatedAmount);
            entity.setOverrideAmount(request.getOverrideAmount());
            entity.setFinalAmount(finalAmount);
            // Auto-approve entries (no Hub Admin verification needed)
            entity.setVerificationStatus(VerificationStatus.APPROVED);
            entity.setVerifiedBy(null);
            entity.setVerifiedAt(LocalDateTime.now());
        } else {
            entity = DeliveryPerformance.builder()
                    .wishMaster(wishMaster)
                    .deliveryDate(request.getDeliveryDate())
                    .parcelsTaken(request.getParcelsTaken())
                    .parcelsDelivered(request.getParcelsDelivered())
                    .parcelsFailed(request.getParcelsFailed())
                    .parcelsReturned(request.getParcelsReturned() != null ? request.getParcelsReturned() : 0)
                    .screenshotUrl(request.getScreenshotUrl())
                    .verificationStatus(VerificationStatus.APPROVED) // Auto-approved
                    .verifiedAt(LocalDateTime.now())
                    .calculatedAmount(calculatedAmount)
                    .overrideAmount(request.getOverrideAmount())
                    .finalAmount(finalAmount)
                    .build();
        }
        entity = performanceRepository.save(entity);
        return DeliveryPerformanceMapper.toResponse(entity);
    }

    // Verification removed - entries are auto-approved

    @Override
    public List<DeliveryPerformanceResponseDto> getByWishMaster(Long wishMasterId) {
        return performanceRepository.findByWishMaster_Id(wishMasterId)
                .stream()
                .map(DeliveryPerformanceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DeliveryPerformanceResponseDto> getByWishMasterEmployeeId(String employeeId) {
        DeliveryPartner partner = partnerRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));
        return getByWishMaster(partner.getId());
    }

    @Override
    public List<DeliveryPerformanceResponseDto> getByDateRange(LocalDate start, LocalDate end) {
        return performanceRepository.findByDeliveryDateBetween(start, end)
                .stream()
                .map(DeliveryPerformanceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Resource downloadMonthlySheet(Long wishMasterId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<DeliveryPerformance> entries = performanceRepository.findByWishMaster_Id(wishMasterId)
                .stream()
                .filter(e -> e.getVerificationStatus() == VerificationStatus.APPROVED)
                .filter(e -> !e.getDeliveryDate().isBefore(start) && !e.getDeliveryDate().isAfter(end))
                .sorted((a, b) -> a.getDeliveryDate().compareTo(b.getDeliveryDate()))
                .collect(Collectors.toList());

        DeliveryPartner partner = partnerRepository.findById(wishMasterId)
                .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Monthly Sheet");
            createHeaderRow(sheet);
            int rowNum = 1;
            for (DeliveryPerformance e : entries) {
                createDataRow(sheet, rowNum++, e);
            }
            workbook.write(out);
            return new ByteArrayResource(out.toByteArray());
        } catch (Exception e) {
            throw new BadRequestException("Failed to generate sheet: " + e.getMessage());
        }
    }

    private DeliveryPartner resolveWishMaster(DeliveryPerformanceRequestDto request) {
        if (request.getWishMasterId() != null) {
            return partnerRepository.findById(request.getWishMasterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));
        }
        if (request.getEmployeeId() != null) {
            return partnerRepository.findByEmployeeId(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wish Master not found"));
        }
        throw new BadRequestException("wishMasterId or employeeId required");
    }

    private void validateNumbers(DeliveryPerformanceRequestDto request) {
        if (request.getParcelsTaken() == null || request.getParcelsDelivered() == null
                || request.getParcelsFailed() == null) {
            throw new BadRequestException("Parcels taken, delivered and failed are required");
        }
        int returned = request.getParcelsReturned() != null ? request.getParcelsReturned() : 0;
        int total = request.getParcelsDelivered() + request.getParcelsFailed() + returned;
        if (request.getParcelsTaken() < total) {
            throw new BadRequestException("Parcels taken should be >= delivered + failed + returned");
        }
    }

    private void createHeaderRow(Sheet sheet) {
        Row header = sheet.createRow(0);
        String[] headers = { "Date", "Parcels Taken", "Delivered", "Failed", "Returned", "Amount" };
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
        }
    }

    private void createDataRow(Sheet sheet, int rowNum, DeliveryPerformance e) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(e.getDeliveryDate().toString());
        row.createCell(1).setCellValue(e.getParcelsTaken());
        row.createCell(2).setCellValue(e.getParcelsDelivered());
        row.createCell(3).setCellValue(e.getParcelsFailed());
        row.createCell(4).setCellValue(e.getParcelsReturned() != null ? e.getParcelsReturned() : 0);
        row.createCell(5).setCellValue(e.getFinalAmount());
    }

    @Override
    @Transactional
    public void deleteByMonth(Long wishMasterId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        performanceRepository.deleteByWishMaster_IdAndDeliveryDateBetween(wishMasterId, start, end);
    }
}
