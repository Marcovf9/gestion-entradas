package com.epifania.entradas.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoDTO {
    private Long id;
    private String nombre;
    private LocalDate fecha;
    private Boolean activo;
}
