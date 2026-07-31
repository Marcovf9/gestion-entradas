package com.epifania.entradas.dto;

import com.epifania.entradas.models.enums.GridColumn;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZonaDTO {
    private Long id;
    private Long eventoId;
    private String nombre;
    private Integer precio;
    private String color;
    private Integer displayOrder;
    private GridColumn gridColumn;
    private Integer skewDeg;
}
