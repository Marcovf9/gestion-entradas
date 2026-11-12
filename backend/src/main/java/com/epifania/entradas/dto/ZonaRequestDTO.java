package com.epifania.entradas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ZonaRequestDTO {

    @NotNull(message = "El evento es obligatorio")
    private Long eventoId;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "El precio es obligatorio")
    @PositiveOrZero(message = "El precio no puede ser negativo")
    private Integer precio;

    @NotBlank(message = "El color es obligatorio")
    private String color;

    @NotNull(message = "El orden es obligatorio")
    private Integer displayOrder;
}
