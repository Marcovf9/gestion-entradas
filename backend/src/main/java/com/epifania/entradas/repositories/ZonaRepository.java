package com.epifania.entradas.repositories;

import com.epifania.entradas.models.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long> {
    List<Zona> findByEventoIdOrderByDisplayOrderAsc(Long eventoId);
}
