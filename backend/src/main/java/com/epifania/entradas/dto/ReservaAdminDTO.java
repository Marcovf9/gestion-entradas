package com.epifania.entradas.dto;

import com.epifania.entradas.models.enums.EstadoButaca;
import lombok.*;

import java.time.LocalDateTime;

/** Butaca reservada o vendida, con los datos del cliente (solo para el panel admin). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaAdminDTO {
    private Long id;
    private String zonaNombre;
    private Integer fila;
    private Integer columna;
    private Integer precio;
    private EstadoButaca estado;
    private String clienteNombre;
    private String clienteDni;
    private String clienteEmail;
    private LocalDateTime reservaHasta;
    /** Solo para reservas (no vendidas): segundos que faltan para que venza. */
    private Long segundosRestantes;
}
