package com.epifania.entradas.repositories;

import com.epifania.entradas.models.Butaca;
import com.epifania.entradas.models.enums.EstadoButaca;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ButacaRepository extends JpaRepository<Butaca, Long> {

    List<Butaca> findByZonaEventoIdOrderByZonaIdAscFilaAscColumnaAsc(Long eventoId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Butaca b where b.id in :ids")
    List<Butaca> findAllByIdForUpdate(@Param("ids") List<Long> ids);

    @Query("select b from Butaca b where b.estado = :estado and b.reservaHasta > :ahora order by b.zona.id asc, b.fila asc, b.columna asc")
    List<Butaca> findActivasConHold(@Param("estado") EstadoButaca estado, @Param("ahora") LocalDateTime ahora);

    @Modifying
    @Query("update Butaca b set b.estado = com.epifania.entradas.models.enums.EstadoButaca.DISPONIBLE, "
            + "b.clienteNombre = null, b.clienteDni = null, b.clienteEmail = null, b.reservaHasta = null "
            + "where b.estado = com.epifania.entradas.models.enums.EstadoButaca.RESERVADA and b.reservaHasta < :ahora")
    int expirarReservasVencidas(@Param("ahora") LocalDateTime ahora);
}
