package com.Shridigambara.wms.service;

import com.Shridigambara.wms.requestdto.WishMasterRegistrationRequestDto;
import com.Shridigambara.wms.responsedto.DeliveryPartnerResponseDto;

import java.util.List;
import com.Shridigambara.wms.responsedto.RegistrationRequestResponseDto;

public interface DeliveryPartnerService {
    DeliveryPartnerResponseDto registerWishMaster(Long hubAdminId, WishMasterRegistrationRequestDto request);

    DeliveryPartnerResponseDto createBySuperAdmin(WishMasterRegistrationRequestDto request);

    DeliveryPartnerResponseDto approveRegistration(Long wishMasterId, boolean approved);

    List<RegistrationRequestResponseDto> getPendingRegistrationRequests();

    RegistrationRequestResponseDto getRegistrationRequestById(Long id);

    DeliveryPartnerResponseDto processRegistrationRequest(Long requestId, Long superAdminId, boolean approved,
            Double approvedRate);

    DeliveryPartnerResponseDto getByEmployeeId(String employeeId);

    DeliveryPartnerResponseDto getById(Long id);

    List<DeliveryPartnerResponseDto> getByHubAdminId(Long hubAdminId);

    List<DeliveryPartnerResponseDto> searchByHubAdminIdAndEmployeeId(Long hubAdminId, String employeeId);

    List<DeliveryPartnerResponseDto> getByHubId(Long hubId);

    List<DeliveryPartnerResponseDto> getPendingRegistrations();

    List<DeliveryPartnerResponseDto> getAllPartners();

    void deleteWishMaster(Long id);
}
