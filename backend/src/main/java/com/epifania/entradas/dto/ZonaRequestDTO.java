package com.epifania.entradas.dto;

import com.epifania.entradas.models.enums.GridColumn;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    @Positive(message = "El precio debe ser mayor a cero")
    private Integer precio;

    @NotBlank(message = "El color es obligatorio")
    private String color;

    @NotNull(message = "El orden es obligatorio")
    private Integer displayOrder;

    @NotNull(message = "La columna del grid es obligatoria")
    private GridColumn gridColumn;

    private Integer skewDeg;
}
