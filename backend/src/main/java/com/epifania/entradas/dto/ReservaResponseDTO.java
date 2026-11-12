package com.epifania.entradas.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaResponseDTO {
    private List<ReservaSeatDTO> seats;
    private LocalDateTime expiresAt;
    /** Segundos que faltan para que venza la reserva; evita depender de la zona horaria del cliente. */
    private Long segundosRestantes;
}
