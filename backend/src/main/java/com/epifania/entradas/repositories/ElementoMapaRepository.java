package com.epifania.entradas.repositories;

import com.epifania.entradas.models.ElementoMapa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElementoMapaRepository extends JpaRepository<ElementoMapa, Long> {
    List<ElementoMapa> findByEventoIdOrderByFilaAscPosXAsc(Long eventoId);
}
