package com.epifania.entradas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {
    private String token;
    private String email;
    private Boolean requiereCambioPassword;
}
