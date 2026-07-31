package com.epifania.entradas.services;

import com.epifania.entradas.dto.ButacaDTO;
import com.epifania.entradas.models.Butaca;
import com.epifania.entradas.models.Evento;
import com.epifania.entradas.models.Zona;
import com.epifania.entradas.models.enums.EstadoButaca;
import com.epifania.entradas.models.enums.GridColumn;
import com.epifania.entradas.repositories.ButacaRepository;
import com.epifania.entradas.repositories.EventoRepository;
import com.epifania.entradas.repositories.ZonaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class EventoServiceIntegrationTest {

    @Autowired
    private EventoService eventoService;
    @Autowired
    private EventoRepository eventoRepository;
    @Autowired
    private ZonaRepository zonaRepository;
    @Autowired
    private ButacaRepository butacaRepository;

    private Long eventoId;
    private Long butacaId;

    @BeforeEach
    void setUp() {
        butacaRepository.deleteAll();
        zonaRepository.deleteAll();
        eventoRepository.deleteAll();

        Evento evento = eventoRepository.save(Evento.builder()
                .nombre("Evento de prueba")
                .fecha(LocalDate.now().plusMonths(1))
                .activo(true)
                .build());
        eventoId = evento.getId();

        Zona zona = zonaRepository.save(Zona.builder()
                .evento(evento)
                .nombre("Platea baja")
                .precio(25000)
                .color("#f5d742")
                .displayOrder(1)
                .gridColumn(GridColumn.CENTRO)
                .skewDeg(0)
                .build());

        Butaca butaca = butacaRepository.save(Butaca.builder()
                .zona(zona)
                .fila(1)
                .columna(1)
                .estado(EstadoButaca.RESERVADA)
                .clienteNombre("Vencido")
                .reservaHasta(LocalDateTime.now().minusMinutes(1))
                .build());
        butacaId = butaca.getId();
    }

    /**
     * Reproduce el bug de "cannot execute UPDATE in a read-only
     * transaction": listarButacas es @Transactional(readOnly = true) pero
     * dispara la expiración de holds vencidos, que hace un UPDATE. Contra
     * Postgres real esto fallaba antes de que expirarReservasVencidas()
     * pasara a REQUIRES_NEW.
     */
    @Test
    void listarButacasExpiraReservasVencidasSinFallarPorSerReadOnly() {
        var butacas = eventoService.listarButacas(eventoId);

        ButacaDTO actualizada = butacas.stream()
                .filter(b -> b.getId().equals(butacaId))
                .findFirst()
                .orElseThrow();

        assertEquals(EstadoButaca.DISPONIBLE, actualizada.getEstado());
    }
}
