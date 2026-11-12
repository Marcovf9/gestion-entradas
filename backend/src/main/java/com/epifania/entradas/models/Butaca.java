package com.epifania.entradas.models;

import com.epifania.entradas.models.enums.EstadoButaca;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "butacas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Butaca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zona_id", nullable = false)
    private Zona zona;

    @Column(nullable = false)
    private Integer fila;

    @Column(nullable = false)
    private Integer columna;

    /** Posición horizontal en el plano, en medios asientos (un asiento ocupa 2). */
    @Builder.Default
    @Column(name = "pos_x", nullable = false)
    private Integer posX = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private EstadoButaca estado = EstadoButaca.DISPONIBLE;

    @Column(name = "cliente_nombre")
    private String clienteNombre;

    @Column(name = "cliente_dni")
    private String clienteDni;

    @Column(name = "cliente_email")
    private String clienteEmail;

    @Column(name = "reserva_hasta")
    private LocalDateTime reservaHasta;
}
