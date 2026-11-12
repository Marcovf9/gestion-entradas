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

    @Query("select b from Butaca b join fetch b.zona z where z.evento.id = :eventoId "
            + "and b.estado = :estado and b.reservaHasta > :ahora "
            + "order by b.reservaHasta asc, b.fila asc, b.columna asc")
    List<Butaca> findActivasConHold(@Param("eventoId") Long eventoId, @Param("estado") EstadoButaca estado,
                                    @Param("ahora") LocalDateTime ahora);

    @Query("select b from Butaca b join fetch b.zona z where z.evento.id = :eventoId and b.estado = :estado "
            + "order by b.clienteNombre asc, b.fila asc, b.columna asc")
    List<Butaca> findByEstadoConZona(@Param("eventoId") Long eventoId, @Param("estado") EstadoButaca estado);

    @Modifying
    @Query("update Butaca b set b.estado = com.epifania.entradas.models.enums.EstadoButaca.DISPONIBLE, "
            + "b.clienteNombre = null, b.clienteDni = null, b.clienteEmail = null, b.reservaHasta = null "
            + "where b.estado = com.epifania.entradas.models.enums.EstadoButaca.RESERVADA and b.reservaHasta < :ahora")
    int expirarReservasVencidas(@Param("ahora") LocalDateTime ahora);
}
