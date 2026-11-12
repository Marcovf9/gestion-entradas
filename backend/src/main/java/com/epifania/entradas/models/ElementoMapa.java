package com.epifania.entradas.models;

import jakarta.persistence.*;
import lombok.*;

/** Elemento decorativo del plano que ocupa lugar en una fila (ej. la cabina). */
@Entity
@Table(name = "elementos_mapa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElementoMapa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @Column(nullable = false, length = 50)
    private String etiqueta;

    @Column(nullable = false)
    private Integer fila;

    @Column(name = "pos_x", nullable = false)
    private Integer posX;

    @Column(nullable = false)
    private Integer ancho;
}
