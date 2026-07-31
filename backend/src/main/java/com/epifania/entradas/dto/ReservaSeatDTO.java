package com.epifania.entradas.dto;

import com.epifania.entradas.models.enums.EstadoButaca;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaSeatDTO {
    private Long id;
    private Integer fila;
    private Integer columna;
    private String zonaNombre;
    private Integer precio;
    private EstadoButaca estado;
}
