package com.epifania.entradas.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "eventos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(nullable = false)
    private LocalDate fecha;

    private LocalTime hora;

    @Column(length = 200)
    private String lugar;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;
}
