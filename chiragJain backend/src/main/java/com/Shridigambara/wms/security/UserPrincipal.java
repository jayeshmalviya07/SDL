package com.Shridigambara.wms.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserPrincipal {
    private final String subject;   // email or employeeId
    private final String role;     // SUPER_ADMIN, HUB_ADMIN, WISH_MASTER
    private final Long entityId;
}
