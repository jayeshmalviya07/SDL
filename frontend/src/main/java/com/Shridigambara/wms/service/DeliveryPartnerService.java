package com.Shridigambara.wms.service;

import com.Shridigambara.wms.requestdto.WishMasterRegistrationRequestDto;
import com.Shridigambara.wms.responsedto.DeliveryPartnerResponseDto;

import java.util.List;

public interface DeliveryPartnerService {
    DeliveryPartnerResponseDto registerWishMaster(Long hubAdminId, WishMasterRegistrationRequestDto request);

    DeliveryPartnerResponseDto createBySuperAdmin(WishMasterRegistrationRequestDto request);

    DeliveryPartnerResponseDto approveRegistration(Long wishMasterId, boolean approved);

    DeliveryPartnerResponseDto getByEmployeeId(String employeeId);

    DeliveryPartnerResponseDto getById(Long id);

    List<DeliveryPartnerResponseDto> getByHubAdminId(Long hubAdminId);

    List<DeliveryPartnerResponseDto> getByHubId(Long hubId);

    List<DeliveryPartnerResponseDto> getPendingRegistrations();

    List<DeliveryPartnerResponseDto> getAllPartners();
}
