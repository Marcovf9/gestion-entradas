package com.epifania.entradas.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaActivaDTO {
    private Long id;
    private String zonaNombre;
    private Integer fila;
    private Integer columna;
    private String clienteNombre;
    private String clienteDni;
    private String clienteEmail;
    private LocalDateTime reservaHasta;
}
