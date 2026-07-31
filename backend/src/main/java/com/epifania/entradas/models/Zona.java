package com.epifania.entradas.models;

import com.epifania.entradas.models.enums.GridColumn;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zonas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Zona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false)
    private Integer precio;

    @Column(nullable = false, length = 20)
    private String color;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "grid_column", nullable = false, length = 20)
    private GridColumn gridColumn;

    @Builder.Default
    @Column(name = "skew_deg", nullable = false)
    private Integer skewDeg = 0;
}
