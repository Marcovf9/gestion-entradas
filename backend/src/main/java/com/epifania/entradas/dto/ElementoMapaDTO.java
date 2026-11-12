package com.epifania.entradas.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElementoMapaDTO {
    private Long id;
    private String etiqueta;
    private Integer fila;
    private Integer posX;
    private Integer ancho;
}
