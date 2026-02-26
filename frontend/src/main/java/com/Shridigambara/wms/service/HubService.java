package com.Shridigambara.wms.service;

import com.Shridigambara.wms.requestdto.HubRequestDto;
import com.Shridigambara.wms.responsedto.HubResponseDto;

import java.util.List;

public interface HubService {
    HubResponseDto createHub(HubRequestDto request);

    HubResponseDto getById(Long id);

    HubResponseDto getByHubId(String hubId);

    List<HubResponseDto> getAllHubs();

    void deleteHub(Long id);
}
