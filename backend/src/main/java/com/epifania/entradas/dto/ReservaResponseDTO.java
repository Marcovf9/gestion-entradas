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
}
