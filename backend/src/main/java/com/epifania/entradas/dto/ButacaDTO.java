package com.epifania.entradas.dto;

import com.epifania.entradas.models.enums.EstadoButaca;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ButacaDTO {
    private Long id;
    private Long zonaId;
    private Integer fila;
    private Integer columna;
    private EstadoButaca estado;
}
