package com.Shridigambara.wms.responsedto;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SuperAdminResponseDto {

    private Long id;
    private String name;
    private String email;

}
