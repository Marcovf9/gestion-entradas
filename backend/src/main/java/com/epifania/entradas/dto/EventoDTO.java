package com.epifania.entradas.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoDTO {
    private Long id;
    private String nombre;
    private LocalDate fecha;
    private LocalTime hora;
    private String lugar;
    private Boolean activo;
}
