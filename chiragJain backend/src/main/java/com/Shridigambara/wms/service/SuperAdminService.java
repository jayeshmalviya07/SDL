package com.Shridigambara.wms.service;

import com.Shridigambara.wms.requestdto.SuperAdminRequestDto;
import com.Shridigambara.wms.responsedto.SuperAdminResponseDto;

import java.util.List;

public interface SuperAdminService {
    SuperAdminResponseDto createSuperAdmin(SuperAdminRequestDto request);

    List<SuperAdminResponseDto> getAllSuperAdmins();
}
