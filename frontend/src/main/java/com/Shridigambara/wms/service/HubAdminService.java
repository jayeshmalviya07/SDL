package com.Shridigambara.wms.service;

import com.Shridigambara.wms.requestdto.HubAdminRequestDto;
import com.Shridigambara.wms.responsedto.HubAdminResponseDto;

import java.util.List;

public interface HubAdminService {
    HubAdminResponseDto createHubAdmin(HubAdminRequestDto request);

    HubAdminResponseDto getById(Long id);

    List<HubAdminResponseDto> getByHubId(Long hubId);

    List<HubAdminResponseDto> getAllHubAdmins();
}
