package com.epifania.entradas.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ButacasIdsRequestDTO {

    @NotEmpty(message = "No se enviaron butacas")
    private List<Long> seatIds;
}
